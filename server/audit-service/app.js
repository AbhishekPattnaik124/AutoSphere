const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3090;

app.use(cors());
app.use(express.json());

// ── MongoDB Connection ───────────────────────────────────────
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/audit';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Audit Service connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ── Audit Log Model ──────────────────────────────────────────
const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  service: { type: String, required: true },
  user_id: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ['SUCCESS', 'FAILURE'], default: 'SUCCESS' },
  ip_address: String,
  timestamp: { type: Date, default: Date.now }
});

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

// ── Redis Setup ──────────────────────────────────────────
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const subscriber = redis.createClient({ url: redisUrl });

subscriber.connect().then(() => {
  console.log('✅ Audit Service listening to Redis events');
  
  subscriber.subscribe('booking_events', async (message) => {
    const event = JSON.parse(message);
    const log = new AuditLog({
      action: 'BOOKING_CREATED',
      service: 'booking-service',
      user_id: event.data.user_id,
      details: event.data
    });
    await log.save();
  });

  subscriber.subscribe('review_events', async (message) => {
    const event = JSON.parse(message);
    const log = new AuditLog({
      action: 'REVIEW_POSTED',
      service: 'dealer-api',
      user_id: event.data.reviewer_name,
      details: event.data
    });
    await log.save();
  });
}).catch(console.error);

// ── API Key Model ───────────────────────────────────────────
const ApiKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  service_id: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  last_used: { type: Date }
});

const ApiKey = mongoose.model('ApiKey', ApiKeySchema);

// ── Routes ──────────────────────────────────────────────────

// Generate a new API Key
app.post('/keys/generate', async (req, res) => {
  try {
    const { name, service_id } = req.body;
    const key = 'pk_' + require('crypto').randomBytes(24).toString('hex');
    const apiKey = new ApiKey({ key, name, service_id });
    await apiKey.save();
    res.status(201).json(apiKey);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all API Keys
app.get('/keys', async (req, res) => {
  try {
    const keys = await ApiKey.find().sort({ created_at: -1 });
    res.json(keys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manually log an event
app.post('/log', async (req, res) => {
  try {
    const log = new AuditLog(req.body);
    await log.save();
    res.status(201).json({ status: 'Logged' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all logs (Admin only)
app.get('/logs', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Audit Service' });
});

app.listen(port, () => {
  console.log(`🚀 Audit Service running on port ${port}`);
});
