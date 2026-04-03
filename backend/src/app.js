const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

const app = express();

// Trust Railway's proxy
app.set('trust proxy', 1);

app.use(compression());

origin: [
  'https://aerwiz.com',
  'https://www.aerwiz.com',
  'https://aerwiz.vercel.app',
  'http://localhost:3000'
],

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later'
});
app.use('/api', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/flights', require('./modules/flights/flights.routes'));
app.use('/api/bookings', require('./modules/bookings/bookings.routes'));
app.use('/api/payments', require('./modules/payments/payments.routes'));
app.use('/api/alerts', require('./modules/alerts/alerts.routes'));
app.use('/api/admin', require('./modules/admin/admin.routes'));
app.use('/api/promo', require('./modules/promo/promo.routes'));

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Root
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '✈️ Welcome to Aerwiz API',
    version: '1.0.0',
    status: 'running'
  });
});

// Test email
app.get('/test-email', async (req, res) => {
  try {
    const { sendWelcomeEmail } = require('./utils/emailService');
    await sendWelcomeEmail({ firstName: 'Daniel', email: 'daniel.edewi90@gmail.com' });
    res.json({ success: true, message: 'Email sent!' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

module.exports = app;