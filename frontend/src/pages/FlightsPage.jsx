import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useFlightStore from '../store/flightStore';
import { Plane, Clock, ArrowRight, SlidersHorizontal, X } from 'lucide-react';

const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const formatDuration = (dur) => dur.replace('PT', '').replace('H', 'h ').replace('M', 'm');
const formatPrice = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

const AIRLINE_NAMES = {
  AT: 'Royal Air Maroc', KQ: 'Kenya Airways', MS: 'EgyptAir',
  ET: 'Ethiopian Airlines', EK: 'Emirates', QR: 'Qatar Airways',
  LH: 'Lufthansa', AF: 'Air France', KL: 'KLM', WB: 'RwandAir',
  BA: 'British Airways', TK: 'Turkish Airlines', DL: 'Delta',
  UA: 'United Airlines', AA: 'American Airlines'
};

const getAirlineLogo = (code) => `https://pics.avs.io/60/60/${code}.png`;

const FlightsPage = () => {
  const navigate = useNavigate();
  const { searchResults, searchParams, setSelectedFlight } = useFlightStore();
  const [sortBy, setSortBy] = useState('price');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ stops: 'all', maxPrice: '', airlines: [] });

  const airlines = useMemo(() => {
    const codes = [...new Set(searchResults.map(f => f.itineraries[0].segments[0].carrierCode))];
    return codes;
  }, [searchResults]);

  const filtered = useMemo(() => {
    let results = [...searchResults];

    if (filters.stops !== 'all') {
      results = results.filter(f => {
        const stops = f.itineraries[0].segments.length - 1;
        if (filters.stops === 'direct') return stops === 0;
        if (filters.stops === '1stop') return stops === 1;
        return true;
      });
    }

    if (filters.maxPrice) {
      results = results.filter(f => parseFloat(f.price.grandTotal) <= parseFloat(filters.maxPrice));
    }

    if (filters.airlines.length > 0) {
      results = results.filter(f => filters.airlines.includes(f.itineraries[0].segments[0].carrierCode));
    }

    results.sort((a, b) => {
      if (sortBy === 'price') return parseFloat(a.price.grandTotal) - parseFloat(b.price.grandTotal);
      if (sortBy === 'duration') {
        const getDuration = (f) => {
          const d = f.itineraries[0].duration.replace('PT', '');
          const h = parseInt(d.split('H')[0] || 0);
          const m = parseInt((d.split('H')[1] || d).replace('M', '') || 0);
          return h * 60 + m;
        };
        return getDuration(a) - getDuration(b);
      }
      if (sortBy === 'departure') return new Date(a.itineraries[0].segments[0].departure.at) - new Date(b.itineraries[0].segments[0].departure.at);
      return 0;
    });

    return results;
  }, [searchResults, filters, sortBy]);

  if (!searchResults.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">No flights found</h2>
          <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2 rounded-lg mt-4">Search Again</button>
        </div>
      </div>
    );
  }

  const toggleAirline = (code) => {
    setFilters(f => ({
      ...f,
      airlines: f.airlines.includes(code) ? f.airlines.filter(a => a !== code) : [...f.airlines, code]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-700 text-white py-4 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xl font-bold">
              <span className="uppercase">{searchParams.origin}</span>
              <ArrowRight className="w-5 h-5" />
              <span className="uppercase">{searchParams.destination}</span>
            </div>
            <p className="text-blue-200 text-sm mt-1">{searchParams.departureDate} · {searchParams.adults} Adult · {searchParams.cabinClass}</p>
          </div>
          <button onClick={() => navigate('/')} className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium text-sm">Modify Search</button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Sort & Filter Bar */}
        <div className="flex items-center justify-between mb-4 bg-white rounded-xl px-4 py-3 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 font-medium">{filtered.length} flights</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">Sort by:</span>
            {['price', 'duration', 'departure'].map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${sortBy === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm font-medium text-gray-600">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {(filters.stops !== 'all' || filters.maxPrice || filters.airlines.length > 0) && (
              <span className="bg-blue-600 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">!</span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stops */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">Stops</p>
              <div className="space-y-1">
                {[['all', 'Any'], ['direct', 'Direct only'], ['1stop', '1 Stop']].map(([val, label]) => (
                  <label key={val} className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="stops" value={val} checked={filters.stops === val}
                      onChange={() => setFilters(f => ({ ...f, stops: val }))} className="text-blue-600" />
                    <span className="text-sm text-gray-600">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Max Price */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">Max Price (NGN)</p>
              <input type="number" placeholder="e.g. 500000"
                value={filters.maxPrice}
                onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              {filters.maxPrice && (
                <button onClick={() => setFilters(f => ({ ...f, maxPrice: '' }))} className="text-xs text-blue-600 mt-1">Clear</button>
              )}
            </div>

            {/* Airlines */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">Airlines</p>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {airlines.map(code => (
                  <label key={code} className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={filters.airlines.includes(code)}
                      onChange={() => toggleAirline(code)} className="text-blue-600" />
                    <span className="text-sm text-gray-600">{AIRLINE_NAMES[code] || code}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reset */}
            <div className="md:col-span-3 flex justify-end">
              <button onClick={() => setFilters({ stops: 'all', maxPrice: '', airlines: [] })}
                className="flex items-center space-x-1 text-sm text-red-500 hover:text-red-600">
                <X className="w-4 h-4" />
                <span>Reset filters</span>
              </button>
            </div>
          </div>
        )}

        {/* Flight Cards */}
        <div className="space-y-3">
          {filtered.map((flight) => {
            const seg = flight.itineraries[0].segments[0];
            const lastSeg = flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1];
            const stops = flight.itineraries[0].segments.length - 1;
            const duration = flight.itineraries[0].duration;
            const isLowest = flight.price.grandTotal === filtered[0].price.grandTotal;

            return (
              <div key={flight.id} className={`bg-white rounded-xl shadow-sm border transition-shadow hover:shadow-md ${isLowest ? 'border-green-200' : 'border-gray-100'}`}>
                {isLowest && (
                  <div className="bg-green-50 text-green-700 text-xs font-bold px-4 py-1 rounded-t-xl">
                    BEST PRICE
                  </div>
                )}
                <div className="p-5 flex items-center justify-between">
                  {/* Airline */}
                  <div className="flex items-center space-x-3 w-36">
                    <img
                      src={getAirlineLogo(seg.carrierCode)}
                      alt={seg.carrierCode}
                      className="w-10 h-10 rounded-full object-contain bg-gray-50 p-1"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-700">{AIRLINE_NAMES[seg.carrierCode] || seg.carrierCode}</p>
                      <p className="text-xs text-gray-400">{seg.carrierCode}{seg.number}</p>
                    </div>
                  </div>

                  {/* Times */}
                  <div className="flex items-center space-x-4 flex-1 justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800">{formatTime(seg.departure.at)}</p>
                      <p className="text-sm text-gray-500 font-medium">{seg.departure.iataCode}</p>
                    </div>

                    <div className="text-center px-2">
                      <div className="flex items-center space-x-1 text-gray-400 mb-1 justify-center">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{formatDuration(duration)}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-px w-12 bg-gray-300"></div>
                        <Plane className="w-4 h-4 text-blue-500 mx-1" />
                        <div className="h-px w-12 bg-gray-300"></div>
                      </div>
                      <p className={`text-xs mt-1 font-medium ${stops === 0 ? 'text-green-600' : 'text-orange-500'}`}>
                        {stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800">{formatTime(lastSeg.arrival.at)}</p>
                      <p className="text-sm text-gray-500 font-medium">{lastSeg.arrival.iataCode}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{formatPrice(flight.price.grandTotal)}</p>
                    <p className="text-xs text-gray-400 mb-3">per person</p>
                    <button onClick={() => { setSelectedFlight(flight); navigate('/book'); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors">
                      Select
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 pb-3 flex space-x-4 text-xs text-gray-400 border-t border-gray-50 pt-2">
                  <span className="font-medium text-gray-500">{flight.travelerPricings[0].fareDetailsBySegment[0].cabin}</span>
                  {flight.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags && (
                    <span>✓ {flight.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.quantity} checked bag</span>
                  )}
                  {flight.travelerPricings[0].fareDetailsBySegment[0].includedCabinBags && (
                    <span>✓ Cabin bag included</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FlightsPage;