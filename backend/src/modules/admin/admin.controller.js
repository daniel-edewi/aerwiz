const prisma = require('../../config/prisma');

const getStats = async (req, res) => {
  try {
    const [totalUsers, totalBookings, totalRevenue, recentBookings] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'CANCELLED' } }
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          passengers: true
        }
      })
    ]);
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    const bookingsByAirline = await prisma.booking.groupBy({
      by: ['airline'],
      _count: { airline: true },
      _sum: { totalAmount: true },
      orderBy: { _count: { airline: 'desc' } },
      take: 5
    });
    const normalizedBookings = recentBookings.map(b => ({
      ...b,
      user: b.user || {
        firstName: b.passengers?.[0]?.firstName || 'Guest',
        lastName: b.passengers?.[0]?.lastName || '',
        email: b.passengers?.[0]?.email || 'N/A'
      }
    }));
    res.json({
      success: true,
      data: {
        totalUsers, totalBookings,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        recentBookings: normalizedBookings,
        bookingsByStatus, bookingsByAirline
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = status ? { status } : {};
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          passengers: true,
          payment: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      prisma.booking.count({ where })
    ]);
    const normalizedBookings = bookings.map(b => ({
      ...b,
      user: b.user || {
        firstName: b.passengers?.[0]?.firstName || 'Guest',
        lastName: b.passengers?.[0]?.lastName || '',
        email: b.passengers?.[0]?.email || 'N/A'
      }
    }));
    res.json({ success: true, data: normalizedBookings, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, firstName: true, lastName: true, email: true,
        phone: true, role: true, createdAt: true,
        _count: { select: { bookings: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const booking = await prisma.booking.update({ where: { id }, data: { status } });
    // Notify admin SSE clients
    notifyAdmins({ type: 'BOOKING_STATUS_UPDATED', booking });
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be USER or ADMIN' });
    }
    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, firstName: true, lastName: true, email: true, role: true }
    });
    res.json({ success: true, data: updated, message: `${updated.firstName} is now ${role}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// SSE: Store connected admin clients
const adminClients = new Set();

const sseConnect = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Admin notifications active' })}\n\n`);

  // Keep alive every 30s
  const keepAlive = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'PING' })}\n\n`);
  }, 30000);

  adminClients.add(res);

  req.on('close', () => {
    clearInterval(keepAlive);
    adminClients.delete(res);
  });
};

const notifyAdmins = (data) => {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  adminClients.forEach(client => {
    try { client.write(message); } catch (e) { adminClients.delete(client); }
  });
};

module.exports = { getStats, getAllBookings, getAllUsers, updateBookingStatus, updateUserRole, sseConnect, notifyAdmins };