const express = require('express');
const router = express.Router();
const { searchFlights, searchAirports } = require('./flights.controller');

router.get('/search', searchFlights);
router.get('/airports', searchAirports);

module.exports = router;
