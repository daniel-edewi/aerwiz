const Amadeus = require('amadeus');
const NodeCache = require('node-cache');

// Cache flight results for 10 minutes, airport results for 24 hours
const flightCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
const airportCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
  hostname: process.env.AMADEUS_HOSTNAME || 'test'
});

const searchFlights = async ({ origin, destination, departureDate, returnDate, adults, children, infants, cabinClass, currencyCode }) => {
  const cacheKey = `flights_${origin}_${destination}_${departureDate}_${returnDate || ''}_${adults || 1}_${cabinClass || ''}_${currencyCode || 'NGN'}`;
  
  const cached = flightCache.get(cacheKey);
  if (cached) {
    console.log('✅ Flight cache hit:', cacheKey);
    return cached;
  }

  const params = {
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate,
    adults: adults || 1,
    currencyCode: currencyCode || 'NGN',
    max: 250
  };
  if (returnDate) params.returnDate = returnDate;
  if (children) params.children = children;
  if (infants) params.infants = infants;
  if (cabinClass) params.travelClass = cabinClass;

  const response = await amadeus.shopping.flightOffersSearch.get(params);
  flightCache.set(cacheKey, response.data);
  return response.data;
};

const searchAirports = async (keyword) => {
  const cacheKey = `airports_${keyword.toLowerCase()}`;
  
  const cached = airportCache.get(cacheKey);
  if (cached) {
    console.log('✅ Airport cache hit:', keyword);
    return cached;
  }

  const response = await amadeus.referenceData.locations.get({
    keyword,
    subType: 'AIRPORT,CITY'
  });
  airportCache.set(cacheKey, response.data);
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


const getFareCalendar = async ({ origin, destination, month }) => {
  const cacheKey = `calendar_${origin}_${destination}_${month}`;
  const cached = flightCache.get(cacheKey);
  if (cached) return cached;
  try {
    const [year, mon] = month.split('-').map(Number);
    const daysInMonth = new Date(year, mon, 0).getDate();
    const startDate = `${month}-01`;
    const endDate = `${month}-${String(daysInMonth).padStart(2, '0')}`;
    const response = await amadeus.shopping.flightDates.get({
      origin,
      destination,
      departureDate: `${startDate},${endDate}`,
      currencyCode: 'NGN',
      oneWay: true
    });
    const data = response.data || [];
    const priceMap = {};
    data.forEach(item => {
      priceMap[item.departureDate] = { price: parseFloat(item.price.total), currency: item.price.currency || 'NGN' };
    });
    const prices = Object.values(priceMap).map(p => p.price);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const result = { priceMap, minPrice, maxPrice, origin, destination, month };
    flightCache.set(cacheKey, result, 1800);
    return result;
  } catch (err) {
    console.error('Fare calendar error:', err.message);
    return { priceMap: {}, minPrice: 0, maxPrice: 0, origin, destination, month };
  }
};
module.exports = { searchFlights, searchAirports, getFlightPrice, getFareCalendar };
