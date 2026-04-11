const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

const app = express();

app.set('trust proxy', 1);
app.use(compression());

app.use(cors({
  origin: ['https://aerwiz.com', 'https://www.aerwiz.com', 'https://aerwiz.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests' });
app.use('/api', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/flights', require('./modules/flights/flights.routes'));
app.use('/api/bookings', require('./modules/bookings/bookings.routes'));
app.use('/api/payments', require('./modules/payments/payments.routes'));
app.use('/api/alerts', require('./modules/alerts/alerts.routes'));
app.use('/api/admin', require('./modules/admin/admin.routes'));
app.use('/api/promo', require('./modules/promo/promo.routes'));
app.use('/api/contact', require('./modules/contact/contact.routes'));
app.use('/api/blog', require('./modules/blog/blog.routes'));
app.use('/api/affiliate', require('./modules/affiliate/affiliate.routes'));
app.use('/api/password', require('./modules/auth/password-reset.routes'));

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.get('/', (req, res) => res.json({ success: true, message: '✈️ Welcome to Aerwiz API', version: '1.0.0' }));

app.get('/brevo-test', (req, res) => res.json({ test: 'works', brevo: !!process.env.BREVO_API_KEY }));

app.get('/api/debug-env', (req, res) => {
  res.json({
    hasResendKey: !!process.env.RESEND_API_KEY,
    hasBrevoKey: !!process.env.BREVO_API_KEY,
    brevoKeyPrefix: process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.substring(0, 10) : 'NOT SET',
    nodeEnv: process.env.NODE_ENV
  });
});

app.get('/api/test-outbound', (req, res) => {
  const https = require('https');
  const options = {
    hostname: 'api.brevo.com',
    path: '/v3/account',
    method: 'GET',
    family: 4,
    headers: { 'api-key': process.env.BREVO_API_KEY }
  };
  const req2 = https.request(options, (r) => {
    res.json({ success: true, status: r.statusCode });
  });
  req2.on('error', (e) => res.json({ success: false, error: e.message }));
  req2.setTimeout(5000, () => { req2.destroy(); res.json({ success: false, error: 'timeout' }); });
  req2.end();
});

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});


app.get('/api/test-brevo-email', (req, res) => {
  const https = require('https');
  const body = JSON.stringify({
    sender: { name: 'Aerwiz', email: 'noreply@aerwiz.com' },
    to: [{ email: 'daniel.edewi90@gmail.com' }],
    subject: 'Test from Railway',
    htmlContent: '<p>Test email from Railway via Brevo</p>'
  });
  const options = {
    hostname: 'api.brevo.com',
    path: '/v3/smtp/email',
    method: 'POST',
    family: 4,
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  };
  const req2 = https.request(options, (r) => {
    let data = '';
    r.on('data', chunk => data += chunk);
    r.on('end', () => res.json({ success: true, status: r.statusCode, body: data }));
  });
  req2.on('error', (e) => res.json({ success: false, error: e.message }));
  req2.setTimeout(8000, () => { req2.destroy(); res.json({ success: false, error: 'timeout' }); });
  req2.write(body);
  req2.end();
});
module.exports = app;