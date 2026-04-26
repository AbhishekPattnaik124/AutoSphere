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
const { parseNLQuery, executeNLSearch } = require('./nlsearch');
const https = require('https');
const redis = require('redis');

const app = express();
const port = process.env.PORT || 3050;
const SERVICE_START = Date.now();

// ── Security & middleware ─────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ── Redis Setup ──────────────────────────────────────────
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379/4';
const redisClient = redis.createClient({ url: REDIS_URL });
redisClient.connect().catch(err => console.error('Redis Error:', err));

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

// ── Addition Block 9 (I1) — Chaos Engineering ───────────────
const CHAOS_MODE = process.env.CHAOS_MODE === 'true';

if (CHAOS_MODE) {
  console.log('⚠️ CHAOS MODE ENABLED — Injecting synthetic faults');
  app.use((req, res, next) => {
    // 10% chance of random 500 error
    if (Math.random() < 0.1) {
      console.error('🔥 CHAOS: Injecting 500 Error');
      return res.status(500).json({ error: 'CHAOS_MONKEY', message: 'Simulated system failure' });
    }
    // 20% chance of artificial latency (500ms - 2000ms)
    if (Math.random() < 0.2) {
      const delay = Math.floor(Math.random() * 1500) + 500;
      console.log(`⏱ CHAOS: Injecting ${delay}ms latency`);
      return setTimeout(next, delay);
    }
    next();
  });
}

// ── Models ──────────────────────────────────────────────────
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

// ── Global Market Trends ──────────────────────────────────
app.get('/cars/market-trends', async (req, res) => {
  try {
    const stats = await Cars.aggregate([
      {
        $group: {
          _id: null,
          total_inventory: { $sum: 1 },
          avg_price: { $avg: '$price' },
          price_ranges: {
            $push: {
              $cond: [
                { $lt: ['$price', 25000] }, 'Economy',
                { $cond: [{ $lt: ['$price', 50000] }, 'Premium', 'Luxury'] }
              ]
            }
          }
        }
      }
    ]);

    const makeStats = await Cars.aggregate([
      { $group: { _id: '$make', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      summary: stats[0] || {},
      top_makes: makeStats,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: 'STATS_ERROR', message: error.message });
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

// ══════════════════════════════════════════════════════════
// ADDITION BLOCK 1 (A3) — Natural Language Inventory Search
// ══════════════════════════════════════════════════════════

// POST /cars/nlsearch
// Body: { query: "red SUV under $30,000 with low mileage", dealer_id: "1" }
app.post('/cars/nlsearch', async (req, res) => {
  try {
    const { query, dealer_id } = req.body || {};
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'query is required' });
    }
    const filters = parseNLQuery(query);
    const results = await executeNLSearch(filters, Cars, dealer_id);
    res.json({
      query,
      extracted_filters: filters,
      count: results.length,
      cars: results,
    });
  } catch (error) {
    res.status(500).json({ error: 'NL_SEARCH_ERROR', message: 'Natural language search failed' });
  }
});

// ══════════════════════════════════════════════════════════
// ADDITION BLOCK 2 (B1) — Live Inventory Events
// ══════════════════════════════════════════════════════════

// In-memory event store (replace with MongoDB collection in production)
const _inventoryEvents = new Map(); // car_id → [{ event_type, timestamp, session_id }]

// POST /cars/:id/event  — log a view/reserve/sold event
app.post('/cars/:id/event', async (req, res) => {
  try {
    const { event_type = 'viewed', session_id = 'anon' } = req.body || {};
    const carId = req.params.id;
    if (!['viewed', 'reserved', 'sold'].includes(event_type)) {
      return res.status(400).json({ error: 'INVALID_EVENT', message: 'event_type must be viewed|reserved|sold' });
    }
    if (!_inventoryEvents.has(carId)) _inventoryEvents.set(carId, []);
    _inventoryEvents.get(carId).push({ event_type, timestamp: Date.now(), session_id });
    
    // Publish to Redis
    await redisClient.publish('inventory_events', JSON.stringify({
      type: 'INVENTORY_UPDATE',
      car_id: carId,
      event: event_type
    }));

    res.json({ success: true, car_id: carId, event_type });
  } catch (error) {
    res.status(500).json({ error: 'EVENT_ERROR', message: 'Failed to log event' });
  }
});

// GET /cars/:id/live-status — returns real-time urgency signals
app.get('/cars/:id/live-status', async (req, res) => {
  try {
    const carId = req.params.id;
    const events = _inventoryEvents.get(carId) || [];
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    const viewsLastHour = events.filter(e => e.event_type === 'viewed' && now - e.timestamp < oneHour).length;
    const reservedToday = events.filter(e => e.event_type === 'reserved' && now - e.timestamp < oneDay).length;
    const isSold = events.some(e => e.event_type === 'sold');
    const isReserved = reservedToday > 0;

    res.json({
      car_id: carId,
      views_last_hour: viewsLastHour,
      times_reserved_today: reservedToday,
      availability: isSold ? 'sold' : isReserved ? 'reserved' : 'available',
      urgency_label: viewsLastHour >= 10 ? 'high' : viewsLastHour >= 3 ? 'medium' : 'low',
    });
  } catch (error) {
    res.status(500).json({ error: 'STATUS_ERROR', message: 'Failed to get live status' });
  }
});

// ══════════════════════════════════════════════════════════
// ADDITION BLOCK 8 (H1) — VIN Decoder (NHTSA vPIC API)
// ══════════════════════════════════════════════════════════

// GET /cars/vin/:vin/decode
app.get('/cars/vin/:vin/decode', async (req, res) => {
  const vin = req.params.vin.trim().toUpperCase();
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
    return res.status(400).json({ error: 'INVALID_VIN', message: 'VIN must be 17 alphanumeric characters' });
  }
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;
  https.get(url, (apiRes) => {
    let body = '';
    apiRes.on('data', chunk => { body += chunk; });
    apiRes.on('end', () => {
      try {
        const data = JSON.parse(body);
        const results = data.Results || [];
        const pick = (variableId) => results.find(r => r.VariableId === variableId)?.Value || null;
        res.json({
          vin,
          make:          pick(26),
          model:         pick(28),
          year:          pick(29),
          body_class:    pick(5),
          drive_type:    pick(15),
          fuel_type:     pick(24),
          plant_country: pick(75),
          engine_model:  pick(18),
          source: 'NHTSA vPIC',
        });
      } catch (e) {
        res.status(500).json({ error: 'VIN_DECODE_ERROR', message: 'Failed to parse NHTSA response' });
      }
    });
  }).on('error', (e) => {
    res.status(502).json({ error: 'NHTSA_UNREACHABLE', message: 'NHTSA API unavailable' });
  });
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
