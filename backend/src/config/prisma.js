const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error'],
});

// Keepalive ping every 4 minutes to prevent Neon cold starts
setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    console.error('Keepalive ping failed:', e.message);
  }
}, 4 * 60 * 1000);

module.exports = prisma;