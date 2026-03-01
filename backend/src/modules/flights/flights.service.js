const Amadeus = require('amadeus');

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
  hostname: process.env.AMADEUS_HOSTNAME || 'test'
});

const searchFlights = async ({ origin, destination, departureDate, returnDate, adults, children, infants, cabinClass, currencyCode }) => {
  const params = {
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate,
    adults: adults || 1,
    currencyCode: currencyCode || 'NGN',
    max: 20
  };

  if (returnDate) params.returnDate = returnDate;
  if (children) params.children = children;
  if (infants) params.infants = infants;
  if (cabinClass) params.travelClass = cabinClass;

  const response = await amadeus.shopping.flightOffersSearch.get(params);
  return response.data;
};

const searchAirports = async (keyword) => {
  const response = await amadeus.referenceData.locations.get({
    keyword,
    subType: 'AIRPORT,CITY'
  });
  return response.data;
};

const getFlightPrice = async (flightOffer) => {
  const response = await amadeus.shopping.flightOffers.pricing.post(
    JSON.stringify({
      data: {
        type: 'flight-offers-pricing',
        flightOffers: [flightOffer]
      }
    })
  );
  return response.data;
};

module.exports = { searchFlights, searchAirports, getFlightPrice };
