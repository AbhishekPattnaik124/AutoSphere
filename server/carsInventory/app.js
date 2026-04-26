/**
 * Best Cars — Car Inventory Microservice
 * Port: 3050
 *
 * Features:
 *  - Server-side pagination (page + limit)
 *  - Multi-criteria filtering (make, model, year, mileage, price)
 *  - Aggregate stats endpoint
 *  - /health endpoint
 *  - helmet + rate-limiting
 *  - MongoDB retry with exponential backoff
 */

const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Cars = require('./inventory');

const app = express();
const port = process.env.PORT || 3050;
const SERVICE_START = Date.now();

// ── Security & middleware ─────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ── Structured request logging ─────────────────────────────
app.use((req, res, next) => {
  const traceId = req.headers['x-trace-id'] || `inv-${Date.now()}`;
  req.traceId = traceId;
  res.setHeader('X-Trace-Id', traceId);
  const start = Date.now();
  res.on('finish', () => {
    console.log(JSON.stringify({
      time: new Date().toISOString(),
      service: 'inventory-api',
      traceId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ms: Date.now() - start,
    }));
  });
  next();
});

// ── Rate limiting ─────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests.' },
});
app.use(globalLimiter);

// ── MongoDB connection with retry ─────────────────────────
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo_db:27017/';
const MAX_RETRIES = 5;

async function connectWithRetry(attempt = 1) {
  try {
    await mongoose.connect(MONGO_URL, { dbName: 'carsInventory' });
    console.log(JSON.stringify({ time: new Date().toISOString(), service: 'inventory-api', level: 'INFO', message: `MongoDB connected (attempt ${attempt})` }));
    await seedDatabase();
    await createIndexes();
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      const delay = Math.pow(2, attempt) * 1000;
      console.warn(JSON.stringify({ time: new Date().toISOString(), service: 'inventory-api', level: 'WARN', message: `Retrying in ${delay}ms (${attempt}/${MAX_RETRIES})` }));
      setTimeout(() => connectWithRetry(attempt + 1), delay);
    } else {
      console.error(JSON.stringify({ time: new Date().toISOString(), service: 'inventory-api', level: 'ERROR', message: 'MongoDB failed after max retries' }));
      process.exit(1);
    }
  }
}

async function seedDatabase() {
  try {
    const car_records = JSON.parse(fs.readFileSync('./data/car_records.json', 'utf8'));
    await Cars.deleteMany({});
    const cars = car_records['cars'].map(car => {
      if (!car.price) car.price = Math.floor(Math.random() * (70000 - 20000 + 1)) + 20000;
      return car;
    });
    await Cars.insertMany(cars);
    console.log(JSON.stringify({ time: new Date().toISOString(), service: 'inventory-api', level: 'INFO', message: `Seeded ${cars.length} cars` }));
  } catch (err) {
    console.error(JSON.stringify({ time: new Date().toISOString(), service: 'inventory-api', level: 'ERROR', message: 'Seeding failed', error: err.message }));
  }
}

async function createIndexes() {
  try {
    await Cars.collection.createIndex({ dealer_id: 1, make: 1 });
    await Cars.collection.createIndex({ dealer_id: 1, year: -1 });
    await Cars.collection.createIndex({ dealer_id: 1, price: 1 });
    console.log(JSON.stringify({ time: new Date().toISOString(), service: 'inventory-api', level: 'INFO', message: 'Indexes created' }));
  } catch (err) {
    console.warn(JSON.stringify({ time: new Date().toISOString(), service: 'inventory-api', level: 'WARN', message: 'Index warning', error: err.message }));
  }
}

// ── Helper: build pagination meta ────────────────────────
function paginationMeta(total, page, limit) {
  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    total_pages: Math.ceil(total / limit),
    has_next: page * limit < total,
    has_prev: page > 1,
  };
}

// ══════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════

// ── Health endpoint ────────────────────────────────────────
app.get('/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const mem = process.memoryUsage();
  res.json({
    service: 'inventory-api',
    version: '2.0.0',
    status: dbState === 1 ? 'healthy' : 'degraded',
    uptime_seconds: Math.floor((Date.now() - SERVICE_START) / 1000),
    database: { connected: dbState === 1, state: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] },
    memory: { rss_mb: Math.round(mem.rss / 1024 / 1024), heap_used_mb: Math.round(mem.heapUsed / 1024 / 1024) },
    timestamp: new Date().toISOString(),
  });
});

// ── Root ──────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ service: 'inventory-api', message: 'Welcome to the Mongoose API', version: '2.0.0' });
});

// ── Cars by dealer (paginated) ────────────────────────────
app.get('/cars/:id', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const query = { dealer_id: req.params.id };
    const [documents, total] = await Promise.all([
      Cars.find(query).skip(skip).limit(limit).lean(),
      Cars.countDocuments(query),
    ]);

    res.json({ cars: documents, pagination: paginationMeta(total, page, limit) });
  } catch (error) {
    res.status(500).json({ error: 'FETCH_ERROR', message: 'Error fetching cars' });
  }
});

// ── Filter by make ─────────────────────────────────────────
app.get('/carsbymake/:id/:make', async (req, res) => {
  try {
    const documents = await Cars.find({ dealer_id: req.params.id, make: new RegExp(req.params.make, 'i') }).lean();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'FETCH_ERROR', message: 'Error fetching by make' });
  }
});

// ── Filter by model ────────────────────────────────────────
app.get('/carsbymodel/:id/:model', async (req, res) => {
  try {
    const documents = await Cars.find({ dealer_id: req.params.id, model: new RegExp(req.params.model, 'i') }).lean();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'FETCH_ERROR', message: 'Error fetching by model' });
  }
});

// ── Filter by max mileage ──────────────────────────────────
app.get('/carsbymaxmileage/:id/:mileage', async (req, res) => {
  try {
    const mileage = parseInt(req.params.mileage);
    let mileageQuery;
    if (mileage <= 50000) mileageQuery = { $lte: 50000 };
    else if (mileage <= 100000) mileageQuery = { $lte: 100000, $gt: 50000 };
    else if (mileage <= 150000) mileageQuery = { $lte: 150000, $gt: 100000 };
    else if (mileage <= 200000) mileageQuery = { $lte: 200000, $gt: 150000 };
    else mileageQuery = { $gt: 200000 };

    const documents = await Cars.find({ dealer_id: req.params.id, mileage: mileageQuery }).lean();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'FETCH_ERROR', message: 'Error fetching by mileage' });
  }
});

// ── Filter by price range ──────────────────────────────────
app.get('/carsbyprice/:id/:price', async (req, res) => {
  try {
    const price = parseInt(req.params.price);
    let priceQuery;
    if (price <= 20000) priceQuery = { $lte: 20000 };
    else if (price <= 40000) priceQuery = { $lte: 40000, $gt: 20000 };
    else if (price <= 60000) priceQuery = { $lte: 60000, $gt: 40000 };
    else if (price <= 80000) priceQuery = { $lte: 80000, $gt: 60000 };
    else priceQuery = { $gt: 80000 };

    const documents = await Cars.find({ dealer_id: req.params.id, price: priceQuery }).lean();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'FETCH_ERROR', message: 'Error fetching by price' });
  }
});

// ── Filter by minimum year ─────────────────────────────────
app.get('/carsbyyear/:id/:year', async (req, res) => {
  try {
    const documents = await Cars.find({ dealer_id: req.params.id, year: { $gte: parseInt(req.params.year) } }).lean();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'FETCH_ERROR', message: 'Error fetching by year' });
  }
});

// ── Aggregate stats for a dealer ───────────────────────────
app.get('/cars/stats/:id', async (req, res) => {
  try {
    const stats = await Cars.aggregate([
      { $match: { dealer_id: req.params.id } },
      {
        $group: {
          _id: null,
          total_cars: { $sum: 1 },
          avg_price: { $avg: '$price' },
          min_price: { $min: '$price' },
          max_price: { $max: '$price' },
          avg_mileage: { $avg: '$mileage' },
          newest_year: { $max: '$year' },
          oldest_year: { $min: '$year' },
        },
      },
    ]);

    const makeStats = await Cars.aggregate([
      { $match: { dealer_id: req.params.id } },
      { $group: { _id: '$make', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      dealer_id: req.params.id,
      summary: stats[0] ? {
        ...stats[0],
        avg_price: Math.round(stats[0].avg_price),
        avg_mileage: Math.round(stats[0].avg_mileage),
      } : { total_cars: 0 },
      top_makes: makeStats.map(m => ({ make: m._id, count: m.count })),
    });
  } catch (error) {
    res.status(500).json({ error: 'STATS_ERROR', message: 'Error computing stats' });
  }
});

// ── Global error handler ──────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(JSON.stringify({ time: new Date().toISOString(), service: 'inventory-api', level: 'ERROR', traceId: req.traceId, error: err.message }));
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' });
});

// ── Start ─────────────────────────────────────────────────
connectWithRetry();

app.listen(port, () => {
  console.log(JSON.stringify({ time: new Date().toISOString(), service: 'inventory-api', level: 'INFO', message: `Server listening on port ${port}` }));
});
