process.env.PORT = process.env.PORT || '8000';
require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 8000;

const { checkAlerts } = require('./src/modules/alerts/alerts.controller');

// Check price alerts every hour
setInterval(checkAlerts, 60 * 60 * 1000);
// Also check on startup after 10 seconds
setTimeout(checkAlerts, 10000);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Aerwiz server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Test at: http://localhost:${PORT}`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled rejection:', err);
  server.close(() => process.exit(1));
});
app.get('/health', (req, res) => res.json({ status: 'ok' }));