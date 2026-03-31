import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useFlightStore from '../store/flightStore';
import { Plane, Clock, ArrowRight, SlidersHorizontal, X, ChevronDown, ChevronUp, Luggage, Wifi, Check } from 'lucide-react';

const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' });
const formatDuration = (dur) => dur?.replace('PT', '').replace('H', 'h ').replace('M', 'm') || '';
const formatPrice = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

const AIRLINE_NAMES = {
  AT: 'Royal Air Maroc', KQ: 'Kenya Airways', MS: 'EgyptAir',
  ET: 'Ethiopian Airlines', EK: 'Emirates', QR: 'Qatar Airways',
  LH: 'Lufthansa', AF: 'Air France', KL: 'KLM', WB: 'RwandAir',
  BA: 'British Airways', TK: 'Turkish Airlines', DL: 'Delta',
  UA: 'United Airlines', AA: 'American Airlines', TC: 'Air Tanzania',
  W3: 'Arik Air', P4: 'Air Peace', QS: 'SmartWings'
};

const getAirlineLogo = (code) => `https://pics.avs.io/80/80/${code}.png`;

const FlightLeg = ({ seg, lastSeg, stops, duration, segments, color = 'blue' }) => (
  <div className="flex items-center w-full gap-2 sm:gap-4">
    {/* Airline */}
    <div className="flex items-center space-x-2 w-28 sm:w-36 flex-shrink-0">
      <img src={getAirlineLogo(seg.carrierCode)} alt={seg.carrierCode}
        className="w-9 h-9 rounded-xl object-contain bg-gray-50 p-1 border border-gray-100 flex-shrink-0"
        onError={(e) => { e.target.style.display = 'none'; }} />
      <div>
        <p className="text-xs font-bold text-gray-700 leading-tight">{AIRLINE_NAMES[seg.carrierCode] || seg.carrierCode}</p>
        <p className="text-xs text-gray-400">{seg.carrierCode}{seg.number}</p>
      </div>
    </div>

    {/* Times and Route */}
    <div className="flex items-center flex-1 justify-between">
      <div className="text-center">
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatTime(seg.departure.at)}</p>
        <p className="text-sm font-semibold text-gray-600">{seg.departure.iataCode}</p>
        {seg.departure.terminal && <p className="text-xs text-gray-400">T{seg.departure.terminal}</p>}
      </div>

      <div className="flex flex-col items-center flex-1 px-2 sm:px-4">
        <div className="flex items-center space-x-1 text-gray-400 mb-1">
          <Clock className="w-3 h-3" />
          <span className="text-xs font-medium">{formatDuration(duration)}</span>
        </div>
        <div className="flex items-center w-full">
          <div className="h-px flex-1 bg-gray-200"></div>
          {stops === 0 ? (
            <div className="mx-1 w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center">
              <Plane className="w-3 h-3 text-blue-500" />
            </div>
          ) : (
            <div className="mx-1 flex space-x-0.5">
              {Array.from({ length: stops }).map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-orange-400"></div>
              ))}
            </div>
          )}
          <div className="h-px flex-1 bg-gray-200"></div>
        </div>
        <p className={`text-xs mt-1 font-semibold ${stops === 0 ? 'text-green-600' : 'text-orange-500'}`}>
          {stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}
        </p>
        {stops > 0 && segments && (
          <p className="text-xs text-gray-400">
            via {segments.slice(0, -1).map(s => s.arrival.iataCode).join(', ')}
          </p>
        )}
      </div>

      <div className="text-center">
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatTime(lastSeg.arrival.at)}</p>
        <p className="text-sm font-semibold text-gray-600">{lastSeg.arrival.iataCode}</p>
        {lastSeg.arrival.terminal && <p className="text-xs text-gray-400">T{lastSeg.arrival.terminal}</p>}
      </div>
    </div>
  </div>
);

const FlightsPage = () => {
  const navigate = useNavigate();
  const { searchResults, searchParams, setSelectedFlight } = useFlightStore();
  const [sortBy, setSortBy] = useState('price');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ stops: 'all', maxPrice: '', airlines: [] });
  const [expandedFlight, setExpandedFlight] = useState(null);

  const airlines = useMemo(() => {
    return [...new Set(searchResults.map(f => f.itineraries[0].segments[0].carrierCode))];
  }, [searchResults]);

  const priceRange = useMemo(() => {
    if (!searchResults.length) return { min: 0, max: 0 };
    const prices = searchResults.map(f => parseFloat(f.price.grandTotal));
    return { min: Math.min(...prices), max: Math.max(...prices) };
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
    if (filters.maxPrice) results = results.filter(f => parseFloat(f.price.grandTotal) <= parseFloat(filters.maxPrice));
    if (filters.airlines.length > 0) results = results.filter(f => filters.airlines.includes(f.itineraries[0].segments[0].carrierCode));
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
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center cursor-pointer" onClick={() => navigate('/')}>
              <Plane className="text-white w-5 h-5" />
            </div>
            <span className="text-blue-700 text-xl font-bold cursor-pointer" onClick={() => navigate('/')}>Aerwiz</span>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plane className="w-10 h-10 text-blue-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No flights found</h2>
            <p className="text-gray-400 mb-6">Try adjusting your search criteria</p>
            <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">Search Again</button>
          </div>
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

  const activeFiltersCount = (filters.stops !== 'all' ? 1 : 0) + (filters.maxPrice ? 1 : 0) + filters.airlines.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Plane className="text-white w-4 h-4" />
                </div>
                <span className="text-blue-700 text-lg font-bold">Aerwiz</span>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <span className="font-bold text-gray-800 uppercase">{searchParams.origin}</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="font-bold text-gray-800 uppercase">{searchParams.destination}</span>
                {searchParams.tripType === 'ROUND_TRIP' && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">Round Trip</span>}
                <span className="text-gray-400">·</span>
                <span className="text-gray-500 text-xs">{searchParams.departureDate}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500 text-xs">{searchParams.adults} Adult{searchParams.adults > 1 ? 's' : ''}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500 text-xs">{searchParams.cabinClass}</span>
              </div>
            </div>
            <button onClick={() => navigate('/')}
              className="flex items-center space-x-1 border border-blue-600 text-blue-600 px-3 py-1.5 rounded-lg font-medium text-xs hover:bg-blue-50 transition-colors">
              <span>Modify Search</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
        <div className="flex gap-6">

          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Filter Results</h3>
                {activeFiltersCount > 0 && (
                  <button onClick={() => setFilters({ stops: 'all', maxPrice: '', airlines: [] })}
                    className="text-xs text-red-500 hover:text-red-700 font-medium">Clear all</button>
                )}
              </div>

              {/* Stops */}
              <div className="mb-5">
                <p className="text-sm font-bold text-gray-700 mb-3">Stops</p>
                <div className="space-y-2">
                  {[['all', 'Any stops'], ['direct', 'Direct only'], ['1stop', '1 Stop max']].map(([val, label]) => (
                    <label key={val} className="flex items-center space-x-3 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${filters.stops === val ? 'border-blue-600 bg-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                        {filters.stops === val && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                      <span className={`text-sm ${filters.stops === val ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mb-5">
                <p className="text-sm font-bold text-gray-700 mb-3">Max Price</p>
                <div className="text-xs text-gray-400 flex justify-between mb-2">
                  <span>{formatPrice(priceRange.min)}</span>
                  <span>{formatPrice(priceRange.max)}</span>
                </div>
                <input type="range"
                  min={priceRange.min} max={priceRange.max}
                  value={filters.maxPrice || priceRange.max}
                  onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                  className="w-full accent-blue-600" />
                {filters.maxPrice && (
                  <p className="text-xs text-blue-600 font-medium mt-1">Up to {formatPrice(filters.maxPrice)}</p>
                )}
              </div>

              {/* Airlines */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">Airlines</p>
                <div className="space-y-2">
                  {airlines.map(code => (
                    <label key={code} className="flex items-center space-x-3 cursor-pointer group">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${filters.airlines.includes(code) ? 'border-blue-600 bg-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                        {filters.airlines.includes(code) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex items-center space-x-2">
                        <img src={getAirlineLogo(code)} alt={code} className="w-5 h-5 object-contain"
                          onError={(e) => { e.target.style.display = 'none'; }} />
                        <span className="text-sm text-gray-600">{AIRLINE_NAMES[code] || code}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  {filtered.length} flight{filtered.length !== 1 ? 's' : ''} found
                </h1>
                <p className="text-sm text-gray-500">
                  {searchParams.origin} → {searchParams.destination} · {searchParams.departureDate}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {/* Mobile Filter Button */}
                <button onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center space-x-1 border border-gray-300 bg-white px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:border-blue-400 transition-colors">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filter</span>
                  {activeFiltersCount > 0 && <span className="bg-blue-600 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">{activeFiltersCount}</span>}
                </button>
                {/* Sort */}
                <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5">
                  <span className="text-xs text-gray-400 hidden sm:block">Sort:</span>
                  {['price', 'duration', 'departure'].map(s => (
                    <button key={s} onClick={() => setSortBy(s)}
                      className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${sortBy === s ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                      {s === 'price' ? 'Price' : s === 'duration' ? 'Duration' : 'Departure'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden bg-white rounded-xl shadow-sm p-4 mb-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">Stops</p>
                  <div className="space-y-1">
                    {[['all', 'Any'], ['direct', 'Direct'], ['1stop', '1 Stop']].map(([val, label]) => (
                      <label key={val} className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="stops" checked={filters.stops === val}
                          onChange={() => setFilters(f => ({ ...f, stops: val }))} className="accent-blue-600" />
                        <span className="text-sm text-gray-600">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">Airlines</p>
                  <div className="space-y-1">
                    {airlines.map(code => (
                      <label key={code} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={filters.airlines.includes(code)}
                          onChange={() => toggleAirline(code)} className="accent-blue-600" />
                        <span className="text-sm text-gray-600">{AIRLINE_NAMES[code] || code}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 flex justify-between items-center border-t pt-2">
                  <input type="number" placeholder="Max price (NGN)" value={filters.maxPrice}
                    onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none w-48" />
                  <button onClick={() => setFilters({ stops: 'all', maxPrice: '', airlines: [] })}
                    className="flex items-center space-x-1 text-sm text-red-500">
                    <X className="w-4 h-4" /><span>Reset</span>
                  </button>
                </div>
              </div>
            )}

            {/* Flight Cards */}
            <div className="space-y-3">
              {filtered.map((flight, index) => {
                const seg = flight.itineraries[0].segments[0];
                const lastSeg = flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1];
                const stops = flight.itineraries[0].segments.length - 1;
                const duration = flight.itineraries[0].duration;
                const segments = flight.itineraries[0].segments;
                const fareDetails = flight.travelerPricings[0].fareDetailsBySegment[0];
                const cabin = fareDetails.cabin;
                const includedBags = fareDetails.includedCheckedBags;
                const includedCabinBags = fareDetails.includedCabinBags;
                const isLowest = index === 0;
                const isFastest = flight.itineraries[0].duration === [...filtered].sort((a, b) => {
                  const getDur = f => { const d = f.itineraries[0].duration.replace('PT',''); const h = parseInt(d.split('H')[0]||0); const m = parseInt((d.split('H')[1]||d).replace('M','')||0); return h*60+m; };
                  return getDur(a) - getDur(b);
                })[0]?.itineraries[0].duration;
                const isRoundTrip = flight.itineraries.length > 1;
                const retSeg = isRoundTrip ? flight.itineraries[1].segments[0] : null;
                const retLastSeg = isRoundTrip ? flight.itineraries[1].segments[flight.itineraries[1].segments.length - 1] : null;
                const retStops = isRoundTrip ? flight.itineraries[1].segments.length - 1 : 0;
                const retDuration = isRoundTrip ? flight.itineraries[1].duration : null;
                const retSegments = isRoundTrip ? flight.itineraries[1].segments : null;
                const isExpanded = expandedFlight === flight.id;

                return (
                  <div key={flight.id}
                    className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${isLowest ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-100'}`}>

                    {/* Tags */}
                    {(isLowest || isFastest) && (
                      <div className="flex space-x-2 px-4 pt-3">
                        {isLowest && <span className="bg-blue-600 text-white text-xs font-bold px-3 py-0.5 rounded-full">💰 Best Price</span>}
                        {isFastest && !isLowest && <span className="bg-green-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">⚡ Fastest</span>}
                      </div>
                    )}

                    <div className="p-4 sm:p-5">
                      {/* Outbound */}
                      <FlightLeg seg={seg} lastSeg={lastSeg} stops={stops} duration={duration} segments={segments} color="blue" />

                      {/* Return */}
                      {isRoundTrip && (
                        <>
                          <div className="border-t border-dashed border-gray-200 my-3 flex items-center">
                            <span className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">↩ Return Flight</span>
                          </div>
                          <FlightLeg seg={retSeg} lastSeg={retLastSeg} stops={retStops} duration={retDuration} segments={retSegments} color="orange" />
                        </>
                      )}

                      {/* Fare Info Strip */}
                      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                        <span className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                          <span>🪑</span>
                          <span>{cabin}</span>
                        </span>
                        {includedCabinBags && (
                          <span className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <Check className="w-3 h-3" />
                            <span>Cabin bag</span>
                          </span>
                        )}
                        {includedBags ? (
                          <span className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <Check className="w-3 h-3" />
                            <span>{includedBags.quantity} checked bag{includedBags.quantity > 1 ? 's' : ''}</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                            <span>✕ No checked bag</span>
                          </span>
                        )}
                        {isRoundTrip && (
                          <span className="flex items-center space-x-1 text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                            <span>↩ Round Trip</span>
                          </span>
                        )}
                        <button onClick={() => setExpandedFlight(isExpanded ? null : flight.id)}
                          className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 ml-auto">
                          <span>{isExpanded ? 'Less details' : 'More details'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-bold text-gray-600 mb-2">Flight Segments</p>
                              {segments.map((s, i) => (
                                <div key={i} className="text-xs text-gray-500 space-y-1 mb-2 bg-gray-50 rounded-lg p-3">
                                  <p className="font-medium text-gray-700">{s.departure.iataCode} → {s.arrival.iataCode}</p>
                                  <p>{AIRLINE_NAMES[s.carrierCode] || s.carrierCode} · {s.carrierCode}{s.number}</p>
                                  <p>Departs: {formatTime(s.departure.at)} {s.departure.terminal ? `· Terminal ${s.departure.terminal}` : ''}</p>
                                  <p>Arrives: {formatTime(s.arrival.at)} {s.arrival.terminal ? `· Terminal ${s.arrival.terminal}` : ''}</p>
                                  <p>Duration: {formatDuration(s.duration)}</p>
                                  {s.aircraft?.code && <p>Aircraft: {s.aircraft.code}</p>}
                                </div>
                              ))}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-600 mb-2">Fare Details</p>
                              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-2">
                                <div className="flex justify-between">
                                  <span>Cabin Class</span>
                                  <span className="font-medium text-gray-700">{cabin}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Cabin Bag</span>
                                  <span className={`font-medium ${includedCabinBags ? 'text-green-600' : 'text-gray-500'}`}>
                                    {includedCabinBags ? `${includedCabinBags.quantity} included` : 'Not included'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Checked Bag</span>
                                  <span className={`font-medium ${includedBags ? 'text-green-600' : 'text-orange-500'}`}>
                                    {includedBags ? `${includedBags.quantity} x ${includedBags.weight ? `${includedBags.weight}${includedBags.weightUnit}` : 'included'}` : 'Not included'}
                                  </span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                  <span>Base Fare</span>
                                  <span className="font-medium text-gray-700">{formatPrice(flight.price.base)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Taxes & Fees</span>
                                  <span className="font-medium text-gray-700">{formatPrice(parseFloat(flight.price.grandTotal) - parseFloat(flight.price.base))}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Price & CTA */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-2xl sm:text-3xl font-bold text-blue-600">{formatPrice(flight.price.grandTotal)}</p>
                          <p className="text-xs text-gray-400">{isRoundTrip ? 'per person · round trip' : 'per person · one way'}</p>
                          <p className="text-xs text-gray-400">{formatDate(seg.departure.at)}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <button
                            onClick={() => { setSelectedFlight(flight); navigate('/book'); }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm hover:shadow-md">
                            Book Now
                          </button>
                          <p className="text-xs text-gray-400">{flight.numberOfBookableSeats ? `${flight.numberOfBookableSeats} seats left` : 'Limited seats'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <div className="text-5xl mb-4">✈️</div>
                <p className="text-gray-500 font-medium">No flights match your filters</p>
                <button onClick={() => setFilters({ stops: 'all', maxPrice: '', airlines: [] })}
                  className="mt-3 text-blue-600 text-sm font-medium hover:underline">Clear filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightsPage;