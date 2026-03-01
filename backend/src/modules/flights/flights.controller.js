const flightsService = require('./flights.service');

const searchFlights = async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate, adults, children, infants, cabinClass, currencyCode } = req.query;

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        success: false,
        message: 'origin, destination and departureDate are required'
      });
    }

    const flights = await flightsService.searchFlights({
      origin, destination, departureDate, returnDate, adults, children, infants, cabinClass, currencyCode
    });

    res.json({
      success: true,
      count: flights.length,
      data: flights
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const searchAirports = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'keyword is required'
      });
    }

    const airports = await flightsService.searchAirports(keyword);

    res.json({
      success: true,
      count: airports.length,
      data: airports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { searchFlights, searchAirports };
