const express = require('express');
const router = express.Router();
const { searchFlights, searchAirports, getFareCalendarHandler } = require('./flights.controller');
const { getSeatMap } = require('./seats.controller');

router.get('/seats', getSeatMap);
router.get('/search', searchFlights);
router.get('/airports', searchAirports);
router.get('/calendar', getFareCalendarHandler);

module.exports = router;
