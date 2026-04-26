const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const redis = require('redis');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3060;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── MongoDB Connection ───────────────────────────────────────
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/bookings';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Booking Service connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ── Redis Setup (for event publishing) ──────────────────────
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = redis.createClient({ url: redisUrl });
redisClient.connect().catch(console.error);

// ── Booking Model ───────────────────────────────────────────
const AppointmentSchema = new mongoose.Schema({
  booking_id: { type: String, default: uuidv4, unique: true },
  user_id: { type: String, required: true },
  dealer_id: { type: Number, required: true },
  car_id: { type: String, required: true },
  car_name: { type: String, required: true },
  booking_date: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
  notes: String,
  created_at: { type: Date, default: Date.now }
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);

// ── Routes ──────────────────────────────────────────────────

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Booking Service', timestamp: new Date() });
});

// Book an appointment
app.post('/book', async (req, res) => {
  try {
    const { user_id, dealer_id, car_id, car_name, booking_date, notes } = req.body;
    
    if (!user_id || !dealer_id || !car_id || !booking_date) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'All fields are required' });
    }

    const appointment = new Appointment({
      user_id,
      dealer_id,
      car_id,
      car_name,
      booking_date,
      notes
    });

    await appointment.save();

    // Publish event for Notification Service
    await redisClient.publish('booking_events', JSON.stringify({
      type: 'BOOKING_CREATED',
      data: appointment
    }));

    res.status(201).json({ message: 'Booking successful', appointment });
  } catch (error) {
    console.error('Booking Error:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
  }
});

// Fetch bookings for a dealer
app.get('/dealer/:id', async (req, res) => {
  try {
    const bookings = await Appointment.find({ dealer_id: req.params.id }).sort({ booking_date: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'FETCH_ERROR', message: error.message });
  }
});

// Fetch bookings for a user
app.get('/user/:id', async (req, res) => {
  try {
    const bookings = await Appointment.find({ user_id: req.params.id }).sort({ created_at: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'FETCH_ERROR', message: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Booking Service running on port ${port}`);
});
