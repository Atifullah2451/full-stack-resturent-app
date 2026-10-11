/**
 * Savoria Restaurant Mobile App - Backend REST API
 * Tech Stack: Node.js, Express, Firebase Admin SDK
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const os = require('os');

const authRoutes = require('./src/routes/authRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health Check & Root Info
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Savoria Restaurant API',
    version: '1.0.0',
    firebaseProject: process.env.FIREBASE_PROJECT_ID || 'myresturent-13093'
  });
});

app.get('/', (req, res) => {
  res.send(`
    <div style="font-family:sans-serif; padding:40px; text-align:center; max-width:600px; margin:auto;">
      <h1 style="color:#EA580C;">🍽️ Savoria Restaurant API</h1>
      <p style="color:#4B5563;">Node.js + Express + Firebase Admin REST Service is Running.</p>
      <div style="text-align:left; background:#F3F4F6; padding:20px; border-radius:8px; font-size:14px;">
        <p><strong>Available Endpoints:</strong></p>
        <ul>
          <li><code>GET  /api/health</code> - Server health status</li>
          <li><code>GET  /api/menu</code> - Catalog list with search & filter</li>
          <li><code>GET  /api/menu/categories</code> - Categories list</li>
          <li><code>POST /api/orders</code> - Place order (requires Firebase ID token)</li>
          <li><code>GET  /api/orders/my-orders</code> - User orders</li>
          <li><code>POST /api/bookings</code> - Book table</li>
          <li><code>GET  /api/bookings/my-bookings</code> - User bookings</li>
          <li><code>GET  /api/bookings/check-availability</code> - Availability check</li>
        </ul>
      </div>
    </div>
  `);
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bookings', bookingRoutes);

// Catch 404 & Centralized Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

// Helper to print local network IP (essential for connecting React Native on real phone)
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    const localIp = getLocalIp();
    console.log(`\n======================================================`);
    console.log(`🚀 Savoria Restaurant Backend is running on PORT: ${PORT}`);
    console.log(`📱 Local Machine:   http://localhost:${PORT}`);
    console.log(`📱 Real Phone / LAN: http://${localIp}:${PORT}`);
    console.log(`🤖 Android Emulator: http://10.0.2.2:${PORT}`);
    console.log(`======================================================\n`);
  });
}

module.exports = app;
