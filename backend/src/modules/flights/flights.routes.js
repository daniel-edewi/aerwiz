const express = require('express');
const router = express.Router();
const { searchFlights, searchAirports } = require('./flights.controller');
const { getSeatMap } = require('./seats.controller');

router.get('/seats', getSeatMap);
router.get('/search', searchFlights);
router.get('/airports', searchAirports);

module.exports = router;
