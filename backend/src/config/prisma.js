const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Warm up connection on startup
prisma.$connect()
  .then(() => console.log('Database connected'))
  .catch(e => console.error('Database connection error:', e.message));

// Keepalive ping every 3 minutes to prevent Neon cold starts
setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Keepalive ping OK');
  } catch (e) {
    console.error('Keepalive ping failed:', e.message);
  }
}, 3 * 60 * 1000);

module.exports = prisma;