/**
 * Best Cars — Dealer & Review Microservice
 * Port: 3030
 *
 * Responsibilities:
 *  - Serve dealership CRUD
 *  - Serve review CRUD
 *  - Broadcast real-time reviews via Socket.IO
 *  - Expose /health endpoint for monitoring
 *
 * Security: helmet, rate-limiting, structured error handling
 */

const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

// ── App setup ─────────────────────────────────────────────
const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3030;
const SERVICE_START = Date.now();

// ── Socket.IO — Real-time review broadcast ───────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:8000', 'http://localhost:3000', 'http://localhost'],
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(JSON.stringify({ time: new Date().toISOString(), service: 'dealer-api', event: 'socket_connect', socketId: socket.id }));
  socket.on('join_dealer', (dealerId) => {
    socket.join(`dealer_${dealerId}`);
  });
  socket.on('disconnect', () => {
    console.log(JSON.stringify({ time: new Date().toISOString(), service: 'dealer-api', event: 'socket_disconnect', socketId: socket.id }));
  });
});

// ── Security & middleware ─────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));  // CSP handled by Nginx
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(require('body-parser').urlencoded({ extended: false }));

// ── Structured request logging ─────────────────────────────
app.use((req, res, next) => {
  const traceId = req.headers['x-trace-id'] || `dealer-${Date.now()}`;
  req.traceId = traceId;
  res.setHeader('X-Trace-Id', traceId);
  const start = Date.now();
  res.on('finish', () => {
    console.log(JSON.stringify({
      time: new Date().toISOString(),
      service: 'dealer-api',
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
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests.' },
});

const reviewLimiter = rateLimit({
  windowMs: 60 * 1000,         // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'REVIEW_RATE_LIMIT', message: 'Review submission limit reached. Try again in a minute.' },
});

app.use(globalLimiter);

// ── Data models ───────────────────────────────────────────
const Reviews = require('./review');
const Dealerships = require('./dealership');
const Cars = require('./inventory');

// ── MongoDB connection with retry ─────────────────────────
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo_db:27017/';
const MAX_RETRIES = 5;

async function connectWithRetry(attempt = 1) {
  try {
    await mongoose.connect(MONGO_URL, { dbName: 'dealershipsDB' });
    console.log(JSON.stringify({ time: new Date().toISOString(), service: 'dealer-api', level: 'INFO', message: `MongoDB connected on attempt ${attempt}` }));
    await seedDatabase();
    await createIndexes();
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      const delay = Math.pow(2, attempt) * 1000;
      console.log(JSON.stringify({ time: new Date().toISOString(), service: 'dealer-api', level: 'WARN', message: `MongoDB connection failed, retrying in ${delay}ms (attempt ${attempt}/${MAX_RETRIES})` }));
      setTimeout(() => connectWithRetry(attempt + 1), delay);
    } else {
      console.error(JSON.stringify({ time: new Date().toISOString(), service: 'dealer-api', level: 'ERROR', message: 'MongoDB connection failed after max retries', error: err.message }));
      process.exit(1);
    }
  }
}

// ── Seed data ─────────────────────────────────────────────
async function seedDatabase() {
  try {
    const reviews_data = JSON.parse(fs.readFileSync('data/reviews.json', 'utf8'));
    const dealerships_data = JSON.parse(fs.readFileSync('data/dealerships.json', 'utf8'));
    const cars_data = JSON.parse(fs.readFileSync('data/car_records.json', 'utf8'));

    await Reviews.deleteMany({});
    await Reviews.insertMany(reviews_data['reviews']);

    await Dealerships.deleteMany({});
    await Dealerships.insertMany(dealerships_data['dealerships']);

    await Cars.deleteMany({});
    const cars = cars_data['cars'].map(car => {
      if (!car.price) car.price = Math.floor(Math.random() * (70000 - 20000 + 1)) + 20000;
      return car;
    });
    await Cars.insertMany(cars);
    console.log(JSON.stringify({ time: new Date().toISOString(), service: 'dealer-api', level: 'INFO', message: 'Database seeded successfully' }));
  } catch (err) {
    console.error(JSON.stringify({ time: new Date().toISOString(), service: 'dealer-api', level: 'ERROR', message: 'Seeding failed', error: err.message }));
  }
}

// ── MongoDB indexes for performance ───────────────────────
async function createIndexes() {
  try {
    await Dealerships.collection.createIndex({ state: 1, city: 1 });
    await Reviews.collection.createIndex({ dealership: 1, id: -1 });
    console.log(JSON.stringify({ time: new Date().toISOString(), service: 'dealer-api', level: 'INFO', message: 'MongoDB indexes created' }));
  } catch (err) {
    console.warn(JSON.stringify({ time: new Date().toISOString(), service: 'dealer-api', level: 'WARN', message: 'Index creation warning', error: err.message }));
  }
}

// ══════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════

// ── Health endpoint ────────────────────────────────────────
app.get('/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const memUsage = process.memoryUsage();

  res.json({
    service: 'dealer-api',
    version: '2.0.0',
    status: dbState === 1 ? 'healthy' : 'degraded',
    uptime_seconds: Math.floor((Date.now() - SERVICE_START) / 1000),
    database: {
      status: dbStatus[dbState] || 'unknown',
      connected: dbState === 1,
    },
    memory: {
      rss_mb: Math.round(memUsage.rss / 1024 / 1024),
      heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
      heap_total_mb: Math.round(memUsage.heapTotal / 1024 / 1024),
    },
    timestamp: new Date().toISOString(),
  });
});

// ── Root ──────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ service: 'dealer-api', message: 'Best Cars Dealer & Review API', version: '2.0.0' });
});

// ── Dealerships ───────────────────────────────────────────
app.get('/fetchDealers', async (req, res) => {
  try {
    const documents = await Dealerships.find().lean();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'FETCH_ERROR', message: 'Error fetching dealerships' });
  }
});

app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const documents = await Dealerships.find({ state: req.params.state }).lean();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'FETCH_ERROR', message: 'Error fetching dealerships by state' });
  }
});

app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const documents = await Dealerships.find({ id: req.params.id }).lean();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'FETCH_ERROR', message: 'Error fetching dealer' });
  }
});

// ── Reviews ───────────────────────────────────────────────
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find().lean();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'FETCH_ERROR', message: 'Error fetching reviews' });
  }
});

app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({ dealership: req.params.id }).lean();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'FETCH_ERROR', message: 'Error fetching reviews' });
  }
});

// ── Insert Review — with Socket.IO broadcast ──────────────
app.post('/insert_review', reviewLimiter, express.raw({ type: '*/*' }), async (req, res) => {
  try {
    const data = JSON.parse(req.body);

    // Input validation
    if (!data.review || !data.name || !data.dealership) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'review, name, and dealership are required' });
    }

    const documents = await Reviews.find().sort({ id: -1 }).limit(1).lean();
    const new_id = (documents[0]?.id || 0) + 1;

    const review = new Reviews({
      id: new_id,
      name: String(data.name).substring(0, 100),
      dealership: data.dealership,
      review: String(data.review).substring(0, 2000),
      purchase: Boolean(data.purchase),
      purchase_date: data.purchase_date,
      car_make: data.car_make,
      car_model: data.car_model,
      car_year: data.car_year,
    });

    const savedReview = await review.save();

    // Broadcast to all clients viewing this dealer's page
    io.to(`dealer_${data.dealership}`).emit('new_review', {
      ...savedReview.toObject(),
      _broadcast: true,
    });

    console.log(JSON.stringify({
      time: new Date().toISOString(),
      service: 'dealer-api',
      level: 'INFO',
      traceId: req.traceId,
      event: 'review_created',
      dealership: data.dealership,
      reviewId: new_id,
    }));

    res.json(savedReview);
  } catch (error) {
    console.error(JSON.stringify({ time: new Date().toISOString(), service: 'dealer-api', level: 'ERROR', message: error.message }));
    res.status(500).json({ error: 'INSERT_ERROR', message: 'Error inserting review' });
  }
});

// ── Cars (legacy endpoint) ─────────────────────────────────
app.get('/fetchCars/dealer/:id', async (req, res) => {
  try {
    const documents = await Cars.find({ dealer_id: req.params.id }).lean();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'FETCH_ERROR', message: 'Error fetching cars' });
  }
});

// ── Global error handler ──────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(JSON.stringify({ time: new Date().toISOString(), service: 'dealer-api', level: 'ERROR', traceId: req.traceId, error: err.message }));
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' });
});

// ── Start ─────────────────────────────────────────────────
connectWithRetry();

httpServer.listen(port, () => {
  console.log(JSON.stringify({ time: new Date().toISOString(), service: 'dealer-api', level: 'INFO', message: `Server listening on port ${port}` }));
});
