const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../../middleware/auth');
const { getStats, getAllBookings, getAllUsers, updateBookingStatus } = require('./admin.controller');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/bookings', getAllBookings);
router.get('/users', getAllUsers);
router.patch('/bookings/:id/status', updateBookingStatus);

module.exports = router;