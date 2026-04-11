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

// CORS
app.use(cors({
  origin: [
    'https://aerwiz.com',
    'https://www.aerwiz.com',
    'https://aerwiz.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
app.use('/api/password', require('./modules/auth/password-reset.routes'));
app.use('/api/flights', require('./modules/flights/flights.routes'));
app.use('/api/bookings', require('./modules/bookings/bookings.routes'));
app.use('/api/payments', require('./modules/payments/payments.routes'));
app.use('/api/alerts', require('./modules/alerts/alerts.routes'));
app.use('/api/admin', require('./modules/admin/admin.routes'));
app.use('/api/promo', require('./modules/promo/promo.routes'));
app.use('/api/contact', require('./modules/contact/contact.routes'));
app.use('/api/blog', require('./modules/blog/blog.routes'));
app.use('/api/affiliate', require('./modules/affiliate/affiliate.routes'));

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

// Debug env — remove after testing
app.get('/api/debug-env', (req, res) => {
  res.json({
    hasResendKey: !!process.env.RESEND_API_KEY,
    resendKeyPrefix: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 8) : 'NOT SET',
    nodeEnv: process.env.NODE_ENV
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
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
