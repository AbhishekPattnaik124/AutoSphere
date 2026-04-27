const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const redis = require('redis');
const cors = require('cors');
const nodemailer = require('nodemailer');
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
const SERVICE_EMAIL = process.env.SERVICE_EMAIL || 'notifications@autosphere.com';

// ── Nodemailer Setup ────────────────────────────────────────
// Using Ethereal/Mock transport if no REAL credentials provided
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || 'mock_user',
    pass: process.env.SMTP_PASS || 'mock_pass'
  }
});

// ── Redis Subscriber Setup ──────────────────────────────────
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const subscriber = redis.createClient({ url: redisUrl });

subscriber.connect().then(() => {
  console.log('✅ Notification Service connected to Redis');
  
  // Subscribe to multiple channels
  subscriber.subscribe('booking_events', async (message) => {
    console.log('🔔 New Booking Event:', message);
    const event = JSON.parse(message);
    
    // 1. Emit Socket.IO event for real-time UI updates
    io.emit('notification', {
      type: 'BOOKING',
      title: 'New Appointment',
      message: `User ${event.data.user_id} booked ${event.data.car_name}`,
      timestamp: new Date()
    });

    // 2. Send Confirmation Email
    const mailOptions = {
      from: `"AutoSphere Concierge" <${SERVICE_EMAIL}>`,
      to: event.data.user_email,
      subject: `Booking Confirmed: ${event.data.car_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #c5a059; border-radius: 10px;">
          <h2 style="color: #c5a059;">Elite Booking Confirmed</h2>
          <p>Dear ${event.data.user_id},</p>
          <p>Your test drive appointment for the <strong>${event.data.car_name}</strong> has been successfully synchronized with our network.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Appointment ID:</strong> ${event.data.booking_id}</p>
            <p><strong>Date & Time:</strong> ${new Date(event.data.booking_date).toLocaleString()}</p>
          </div>
          <p>Our concierge team will be waiting for you at the dealership.</p>
          <p style="font-size: 0.8rem; color: #777;">AutoSphere Global Network • Excellence in Motion</p>
        </div>
      `
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('📧 Confirmation Email Sent:', info.messageId);
    } catch (err) {
      console.error('❌ Email Transmission Failed:', err);
    }
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

// ── HTTP Notification Fallback ─────────────────────────────
app.post('/notify', express.json(), async (req, res) => {
  const event = req.body;
  console.log('📬 Received Direct Notification:', event);
  
  if (event.type === 'BOOKING_CREATED') {
    // 1. Emit to Socket.IO
    io.emit('notification', {
      type: 'BOOKING',
      title: 'New Appointment (Direct)',
      message: `User ${event.data.user_id} booked ${event.data.car_name}`,
      timestamp: new Date()
    });

    // 2. Send Email
    const mailOptions = {
      from: `"AutoSphere Concierge" <${SERVICE_EMAIL}>`,
      to: event.data.user_email,
      subject: `Booking Confirmed: ${event.data.car_name}`,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #c5a059;">
               <h2 style="color: #c5a059;">Elite Booking Confirmed</h2>
               <p>Your test drive for <strong>${event.data.car_name}</strong> is confirmed.</p>
             </div>`
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('📧 Confirmation Email Sent via Direct Link');
    } catch (err) {
      console.error('❌ Direct Email Failed:', err);
    }
  }
  
  res.json({ success: true });
});

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
