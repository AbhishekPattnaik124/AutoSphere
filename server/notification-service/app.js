const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const redis = require('redis');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3080;

// ── Redis Subscriber Setup ──────────────────────────────────
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const subscriber = redis.createClient({ url: redisUrl });

subscriber.connect().then(() => {
  console.log('✅ Notification Service connected to Redis');
  
  // Subscribe to multiple channels
  subscriber.subscribe('booking_events', (message) => {
    console.log('🔔 New Booking Event:', message);
    const event = JSON.parse(message);
    io.emit('notification', {
      type: 'BOOKING',
      title: 'New Appointment',
      message: `User ${event.data.user_id} booked ${event.data.car_name}`,
      timestamp: new Date()
    });
  });

  subscriber.subscribe('review_events', (message) => {
    console.log('🔔 New Review Event:', message);
    const event = JSON.parse(message);
    io.emit('notification', {
      type: 'REVIEW',
      title: 'New Review',
      message: `A new ${event.data.sentiment} review was posted for dealer ${event.data.dealer_id}`,
      timestamp: new Date()
    });
  });

  subscriber.subscribe('inventory_events', (message) => {
    console.log('🔔 Inventory Event:', message);
    const event = JSON.parse(message);
    if (event.event === 'reserved') {
      io.emit('notification', {
        type: 'INVENTORY',
        title: 'Car Reserved',
        message: `A vehicle was just reserved!`,
        timestamp: new Date()
      });
    }
  });
}).catch(console.error);

// ── Socket.IO Connection ────────────────────────────────────
io.on('connection', (socket) => {
  console.log('👤 Client connected to Notifications:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('👤 Client disconnected');
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Notification Service' });
});

server.listen(port, () => {
  console.log(`🚀 Notification Service running on port ${port}`);
});
