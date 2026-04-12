const bcrypt = require('bcryptjs');
const prisma = require('../../config/prisma');

const adminClients = new Set();

const broadcastToAdmins = (event) => {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  adminClients.forEach(client => {
    try { client.write(data); } catch (e) { adminClients.delete(client); }
  });
};

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

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const revenueByMonth = await prisma.booking.findMany({
      where: { createdAt: { gte: twelveMonthsAgo }, status: { not: 'CANCELLED' } },
      select: { totalAmount: true, createdAt: true, status: true }
    });

    const monthlyMap = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyMap[key] = { month: key, revenue: 0, bookings: 0 };
    }

    revenueByMonth.forEach(b => {
      const d = new Date(b.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (monthlyMap[key]) {
        monthlyMap[key].revenue += Number(b.totalAmount) || 0;
        monthlyMap[key].bookings += 1;
      }
    });

    const monthlyStats = Object.values(monthlyMap);

    const topRoutes = await prisma.booking.groupBy({
      by: ['origin', 'destination'],
      _count: { id: true },
      _sum: { totalAmount: true },
      orderBy: { _count: { id: 'desc' } },
      take: 6,
      where: { status: { not: 'CANCELLED' } }
    });

    const revenueByClass = await prisma.booking.groupBy({
      by: ['cabinClass'],
      _count: { id: true },
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' } }
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const newUsers = await prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true }
    });

    const userMonthlyMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      userMonthlyMap[key] = { month: key, users: 0 };
    }
    newUsers.forEach(u => {
      const d = new Date(u.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (userMonthlyMap[key]) userMonthlyMap[key].users += 1;
    });
    const userGrowth = Object.values(userMonthlyMap);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [todayBookings, todayRevenue] = await Promise.all([
      prisma.booking.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: todayStart }, status: { not: 'CANCELLED' } }
      })
    ]);

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
        todayBookings,
        todayRevenue: todayRevenue._sum.totalAmount || 0,
        recentBookings: normalizedBookings,
        bookingsByStatus, bookingsByAirline, monthlyStats, topRoutes, revenueByClass, userGrowth
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
        phone: true, role: true, isActive: true, createdAt: true,
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
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['USER', 'ADMIN'].includes(role)) return res.status(400).json({ success: false, message: 'Invalid role' });
    if (id === req.user.id) return res.status(400).json({ success: false, message: 'You cannot change your own role' });
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, firstName: true, lastName: true, email: true, role: true }
    });
    res.json({ success: true, data: user, message: `User role updated to ${role}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyAdminPassword = async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ success: false, message: 'Password is required' });
  try {
    const admin = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Incorrect password' });
    res.json({ success: true, message: 'Password verified' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateUserDetails = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phone, isActive } = req.body;
  if (id === req.user.id) return res.status(400).json({ success: false, message: 'You cannot edit your own account here' });
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(isActive !== undefined && { isActive }),
      },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, isActive: true }
    });
    res.json({ success: true, data: user, message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await prisma.priceAlert.deleteMany({ where: { userId: id } });
    await prisma.payment.deleteMany({ where: { userId: id } });
    const userBookings = await prisma.booking.findMany({ where: { userId: id }, select: { id: true } });
    for (const booking of userBookings) {
      await prisma.passenger.deleteMany({ where: { bookingId: booking.id } });
    }
    await prisma.booking.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: `User ${user.firstName} ${user.lastName} deleted successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const streamNotifications = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Admin notifications connected' })}\n\n`);
  const keepAlive = setInterval(() => { res.write(`data: ${JSON.stringify({ type: 'ping' })}\n\n`); }, 30000);
  adminClients.add(res);
  req.on('close', () => { clearInterval(keepAlive); adminClients.delete(res); });
};

module.exports = {
  getStats, getAllBookings, getAllUsers, updateBookingStatus, updateUserRole,
  verifyAdminPassword, updateUserDetails, deleteUser, streamNotifications, broadcastToAdmins
};