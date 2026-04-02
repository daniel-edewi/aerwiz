const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../../middleware/auth');
const {
  getStats,
  getAllBookings,
  getAllUsers,
  updateBookingStatus,
  updateUserRole,
  streamNotifications
} = require('./admin.controller');

// SSE stream — must be authenticated
router.get('/notifications/stream', protect, adminOnly, streamNotifications);

// All other routes
router.use(protect, adminOnly);
router.get('/stats', getStats);
router.get('/bookings', getAllBookings);
router.get('/users', getAllUsers);
router.patch('/bookings/:id/status', updateBookingStatus);
router.patch('/users/:id/role', updateUserRole);

module.exports = router;