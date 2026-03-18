const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, getBookingById, getBookingByReference, cancelBooking, changeBookingDate, changeBookingRoute } = require('./bookings.controller');
const { downloadBoardingPass } = require('./boardingpass.controller');
const { protect, optionalProtect } = require('../../middleware/auth');

router.post('/', optionalProtect, createBooking);
router.get('/', protect, getUserBookings);
router.get('/reference/:reference', optionalProtect, getBookingByReference);
router.get('/:id/boarding-pass', optionalProtect, downloadBoardingPass);
router.get('/:id', optionalProtect, getBookingById);
router.patch('/:id/cancel', protect, cancelBooking);
router.patch('/:id/change-date', protect, changeBookingDate);
router.patch('/:id/change-route', protect, changeBookingRoute);

module.exports = router;