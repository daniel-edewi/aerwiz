const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, getBookingById, getBookingByReference, cancelBooking } = require('./bookings.controller');
const { downloadBoardingPass } = require('./boardingpass.controller');
const { protect } = require('../../middleware/auth');

router.use(protect);

router.post('/', createBooking);
router.get('/', getUserBookings);
router.get('/reference/:reference', getBookingByReference);
router.get('/:id/boarding-pass', downloadBoardingPass);
router.get('/:id', getBookingById);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;