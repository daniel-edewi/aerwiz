const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, getBookingById, getBookingByReference, cancelBooking, changeBookingDate, changeBookingRoute } = require('./bookings.controller');
const { downloadBoardingPass } = require('./boardingpass.controller');
const { protect } = require('../../middleware/auth');

router.use(protect);

router.post('/', createBooking);
router.get('/', getUserBookings);
router.get('/reference/:reference', getBookingByReference);
router.get('/:id/boarding-pass', downloadBoardingPass);
router.get('/:id', getBookingById);
router.patch('/:id/cancel', cancelBooking);
router.patch('/:id/change-date', changeBookingDate);
router.patch('/:id/change-route', changeBookingRoute);

module.exports = router;
