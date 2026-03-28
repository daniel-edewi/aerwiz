require('dotenv').config();
const app = require('./src/app');
const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Aerwiz server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Test at: http://localhost:${PORT}`);
});

// Price alerts
const { checkAlerts } = require('./src/modules/alerts/alerts.controller');
setInterval(checkAlerts, 60 * 60 * 1000);
setTimeout(checkAlerts, 10000);

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled rejection:', err);
  server.close(() => process.exit(1));
});

// Keep Railway awake - ping self every 5 minutes
const BACKEND_URL = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : 'https://aerwiz-production.up.railway.app';

setInterval(async () => {
  try {
    const https = require('https');
    https.get(`${BACKEND_URL}/health`, (res) => {
      console.log('Self-ping OK:', res.statusCode);
    }).on('error', (e) => {
      console.log('Self-ping failed:', e.message);
    });
  } catch (e) {
    console.log('Self-ping error:', e.message);
  }
}, 5 * 60 * 1000);