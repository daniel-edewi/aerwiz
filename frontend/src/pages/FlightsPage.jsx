import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFlightStore from '../store/flightStore';
import {
  Plane, Clock, ArrowRight, SlidersHorizontal,
  X, ChevronDown, ChevronUp, Check, Filter
} from 'lucide-react';

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
  W3: 'Arik Air', P4: 'Air Peace', QS: 'SmartWings', VS: 'Virgin Atlantic',
  IB: 'Iberia', AZ: 'ITA Airways', SN: 'Brussels Airlines'
};

const getAirlineLogo = (code) => `https://pics.avs.io/120/120/${code}.png`;

const getDurationMinutes = (duration) => {
  if (!duration) return 0;
  const d = duration.replace('PT', '');
  const h = parseInt(d.split('H')[0] || 0);
  const m = parseInt((d.split('H')[1] || d).replace('M', '') || 0);
  return h * 60 + m;
};

const FlightLeg = ({ seg, lastSeg, stops, duration, segments }) => (
  <div className="w-full min-w-0">
    <div className="flex items-center w-full min-w-0 gap-2 sm:gap-4">
      <div className="flex items-center space-x-2 w-24 sm:w-40 flex-shrink-0 min-w-0">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
          <img src={getAirlineLogo(seg.carrierCode)} alt={seg.carrierCode}
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span class="text-xs font-black text-blue-700">${seg.carrierCode}</span>`; }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-800 leading-tight truncate">{AIRLINE_NAMES[seg.carrierCode] || seg.carrierCode}</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{seg.carrierCode}{seg.number}</p>
        </div>
      </div>
      <div className="flex items-center flex-1 min-w-0 justify-between gap-1">
        <div className="text-left flex-shrink-0">
          <p className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight leading-none">{formatTime(seg.departure.at)}</p>
          <p className="text-xs font-bold text-gray-600 mt-0.5">{seg.departure.iataCode}</p>
          {seg.departure.terminal && <p className="text-xs text-gray-400 hidden sm:block">T{seg.departure.terminal}</p>}
        </div>
        <div className="flex flex-col items-center flex-1 min-w-0 px-1 sm:px-3">
          <div className="flex items-center space-x-1 text-gray-400 mb-1">
            <Clock className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="text-xs font-semibold whitespace-nowrap">{formatDuration(duration)}</span>
          </div>
          <div className="flex items-center w-full">
            <div className="h-px flex-1 bg-gray-300"></div>
            <div className="mx-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Plane className="w-2.5 h-2.5 text-white" />
            </div>
            <div className="h-px flex-1 bg-gray-300"></div>
          </div>
          <p className={`text-xs mt-1 font-bold whitespace-nowrap ${stops === 0 ? 'text-green-600' : 'text-orange-500'}`}>
            {stops === 0 ? 'Nonstop' : `${stops} Stop${stops > 1 ? 's' : ''}`}
          </p>
          {stops > 0 && segments && (
            <p className="text-xs text-gray-400 truncate max-w-full">via {segments.slice(0, -1).map(s => s.arrival.iataCode).join(', ')}</p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight leading-none">{formatTime(lastSeg.arrival.at)}</p>
          <p className="text-xs font-bold text-gray-600 mt-0.5">{lastSeg.arrival.iataCode}</p>
          {lastSeg.arrival.terminal && <p className="text-xs text-gray-400 hidden sm:block">T{lastSeg.arrival.terminal}</p>}
        </div>
      </div>
    </div>
  </div>
);

// Single flight card (used inside airline group)
const FlightCard = ({ flight, index, isLowest, isFastest, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const seg = flight.itineraries[0].segments[0];
  const lastSeg = flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1];
  const stops = flight.itineraries[0].segments.length - 1;
  const duration = flight.itineraries[0].duration;
  const segments = flight.itineraries[0].segments;
  const fareDetails = flight.travelerPricings[0].fareDetailsBySegment[0];
  const cabin = fareDetails.cabin;
  const includedBags = fareDetails.includedCheckedBags;
  const includedCabinBags = fareDetails.includedCabinBags;
  const isRoundTrip = flight.itineraries.length > 1;
  const retSeg = isRoundTrip ? flight.itineraries[1].segments[0] : null;
  const retLastSeg = isRoundTrip ? flight.itineraries[1].segments[flight.itineraries[1].segments.length - 1] : null;
  const retStops = isRoundTrip ? flight.itineraries[1].segments.length - 1 : 0;
  const retDuration = isRoundTrip ? flight.itineraries[1].duration : null;
  const retSegments = isRoundTrip ? flight.itineraries[1].segments : null;

  return (
    <div className={`bg-white border-b border-gray-100 last:border-b-0 transition-all hover:bg-blue-50/30 ${isLowest ? 'bg-blue-50/20' : ''}`}>
      {(isLowest || isFastest) && (
        <div className="px-4 pt-2 flex space-x-2">
          {isLowest && <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">Best Price</span>}
          {isFastest && <span className="bg-green-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">Fastest</span>}
        </div>
      )}
      <div className="p-4 sm:p-5">
        <FlightLeg seg={seg} lastSeg={lastSeg} stops={stops} duration={duration} segments={segments} />

        {isRoundTrip && (
          <>
            <div className="border-t border-dashed border-gray-200 my-3 flex items-center">
              <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Return</span>
            </div>
            <FlightLeg seg={retSeg} lastSeg={retLastSeg} stops={retStops} duration={retDuration} segments={retSegments} />
          </>
        )}

        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full font-medium">{cabin?.replace('_', ' ')}</span>
          {includedCabinBags && (
            <span className="flex items-center space-x-1 text-xs text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full font-medium">
              <Check className="w-3 h-3 flex-shrink-0" /><span>Cabin bag</span>
            </span>
          )}
          {includedBags ? (
            <span className="flex items-center space-x-1 text-xs text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full font-medium">
              <Check className="w-3 h-3 flex-shrink-0" /><span>{includedBags.quantity} checked bag{includedBags.quantity > 1 ? 's' : ''}</span>
            </span>
          ) : (
            <span className="text-xs text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full font-medium">No checked bag</span>
          )}
          <button onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 font-semibold ml-auto">
            <span>{isExpanded ? 'Less' : 'Details'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Flight Segments</p>
                {segments.map((s, i) => (
                  <div key={i} className="text-xs text-gray-500 space-y-1 mb-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="font-bold text-gray-800 text-sm">{s.departure.iataCode} → {s.arrival.iataCode}</p>
                    <p>{AIRLINE_NAMES[s.carrierCode] || s.carrierCode} · {s.carrierCode}{s.number}</p>
                    <p>Dep: {formatTime(s.departure.at)}{s.departure.terminal ? ` · T${s.departure.terminal}` : ''}</p>
                    <p>Arr: {formatTime(s.arrival.at)}{s.arrival.terminal ? ` · T${s.arrival.terminal}` : ''}</p>
                    <p>Duration: {formatDuration(s.duration)}</p>
                    {s.aircraft?.code && <p>Aircraft: {s.aircraft.code}</p>}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Fare Breakdown</p>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs text-gray-500 space-y-2.5">
                  <div className="flex justify-between"><span>Cabin Class</span><span className="font-semibold text-gray-700">{cabin?.replace('_', ' ')}</span></div>
                  <div className="flex justify-between"><span>Cabin Bag</span><span className={`font-semibold ${includedCabinBags ? 'text-green-600' : 'text-gray-400'}`}>{includedCabinBags ? `${includedCabinBags.quantity} included` : 'Not included'}</span></div>
                  <div className="flex justify-between"><span>Checked Bag</span><span className={`font-semibold ${includedBags ? 'text-green-600' : 'text-orange-500'}`}>{includedBags ? `${includedBags.quantity}x ${includedBags.weight ? `${includedBags.weight}${includedBags.weightUnit}` : 'included'}` : 'Not included'}</span></div>
                  <div className="border-t border-gray-200 pt-2 space-y-2">
                    <div className="flex justify-between"><span>Base Fare</span><span className="font-semibold text-gray-700">{formatPrice(flight.price.base)}</span></div>
                    <div className="flex justify-between"><span>Taxes & Fees</span><span className="font-semibold text-gray-700">{formatPrice(parseFloat(flight.price.grandTotal) - parseFloat(flight.price.base))}</span></div>
                    <div className="flex justify-between border-t border-gray-200 pt-2"><span className="font-bold text-gray-800">Total</span><span className="font-black text-blue-600 text-sm">{formatPrice(flight.price.grandTotal)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 gap-3">
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight leading-none">{formatPrice(flight.price.grandTotal)}</p>
            <p className="text-xs text-gray-400 mt-1">per person · {isRoundTrip ? 'round trip' : 'one way'}</p>
            <p className="text-xs text-gray-400">{formatDate(seg.departure.at)}</p>
          </div>
          <div className="flex flex-col items-end space-y-1.5 flex-shrink-0">
            <button onClick={() => onSelect(flight)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-7 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm hover:shadow-md whitespace-nowrap">
              Select
            </button>
            {flight.numberOfBookableSeats && (
              <p className={`text-xs font-semibold whitespace-nowrap ${flight.numberOfBookableSeats <= 4 ? 'text-red-500' : 'text-orange-500'}`}>
                {flight.numberOfBookableSeats <= 4 ? `Only ${flight.numberOfBookableSeats} left` : `${flight.numberOfBookableSeats} seats`}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Airline group card — shows cheapest flight by default, expandable to show all
const AirlineGroup = ({ airlineCode, flights, cheapestFlight, fastestFlight, onSelect, defaultExpanded }) => {
  const [expanded, setExpanded] = useState(defaultExpanded || false);
  const cheapestPrice = Math.min(...flights.map(f => parseFloat(f.price.grandTotal)));
  const airlineName = AIRLINE_NAMES[airlineCode] || airlineCode;
  const shownFlights = expanded ? flights : [flights[0]];

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${defaultExpanded ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-100'}`}>
      {/* Airline header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
            <img src={getAirlineLogo(airlineCode)} alt={airlineCode}
              className="w-7 h-7 object-contain"
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span class="text-xs font-black text-blue-700">${airlineCode}</span>`; }} />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">{airlineName}</p>
            <p className="text-xs text-gray-400">{flights.length} option{flights.length !== 1 ? 's' : ''} · from {formatPrice(cheapestPrice)}</p>
          </div>
        </div>
        {flights.length > 1 && (
          <button onClick={() => setExpanded(!expanded)}
            className="flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
            <span>{expanded ? 'Show less' : `Show all ${flights.length}`}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Flight cards */}
      {shownFlights.map((flight, index) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          index={index}
          isLowest={flight.id === cheapestFlight?.id}
          isFastest={flight.id === fastestFlight?.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

const FlightsPage = () => {
  const navigate = useNavigate();
  const { searchResults, searchParams, setSelectedFlight, setSearchResults, setSearchParams } = useFlightStore();
  const [sortBy, setSortBy] = useState('price');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ stops: 'all', maxPrice: '', airlines: [] });

  useEffect(() => {
    if (searchResults.length > 0) {
      sessionStorage.setItem('aerwiz_results', JSON.stringify(searchResults));
      sessionStorage.setItem('aerwiz_params', JSON.stringify(searchParams));
    }
  }, [searchResults, searchParams]);

  useEffect(() => {
    if (searchResults.length === 0) {
      const saved = sessionStorage.getItem('aerwiz_results');
      const savedParams = sessionStorage.getItem('aerwiz_params');
      if (saved && savedParams) {
        try { setSearchResults(JSON.parse(saved)); setSearchParams(JSON.parse(savedParams)); } catch (e) {}
      }
    }
  }, []);

  const airlines = useMemo(() => {
    return [...new Set(searchResults.map(f => f.itineraries[0].segments[0].carrierCode))];
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
      if (sortBy === 'duration') return getDurationMinutes(a.itineraries[0].duration) - getDurationMinutes(b.itineraries[0].duration);
      if (sortBy === 'departure') return new Date(a.itineraries[0].segments[0].departure.at) - new Date(b.itineraries[0].segments[0].departure.at);
      return 0;
    });
    return results;
  }, [searchResults, filters, sortBy]);

  const cheapestFlight = useMemo(() => {
    if (!filtered.length) return null;
    return [...filtered].sort((a, b) => parseFloat(a.price.grandTotal) - parseFloat(b.price.grandTotal))[0];
  }, [filtered]);

  const fastestFlight = useMemo(() => {
    if (!filtered.length) return null;
    return [...filtered].sort((a, b) => getDurationMinutes(a.itineraries[0].duration) - getDurationMinutes(b.itineraries[0].duration))[0];
  }, [filtered]);

  // Group flights by airline
  const groupedByAirline = useMemo(() => {
    const groups = {};
    filtered.forEach(flight => {
      const code = flight.itineraries[0].segments[0].carrierCode;
      if (!groups[code]) groups[code] = [];
      groups[code].push(flight);
    });
    // Sort groups by cheapest flight in each group
    return Object.entries(groups).sort((a, b) => {
      const minA = Math.min(...a[1].map(f => parseFloat(f.price.grandTotal)));
      const minB = Math.min(...b[1].map(f => parseFloat(f.price.grandTotal)));
      return minA - minB;
    });
  }, [filtered]);

  const toggleAirline = (code) => {
    setFilters(f => ({
      ...f,
      airlines: f.airlines.includes(code) ? f.airlines.filter(a => a !== code) : [...f.airlines, code]
    }));
  };

  const activeFiltersCount = (filters.stops !== 'all' ? 1 : 0) + (filters.maxPrice ? 1 : 0) + filters.airlines.length;

  const handleSelect = (flight) => {
    setSelectedFlight(flight);
    navigate('/book');
  };

  if (!searchResults.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plane className="w-10 h-10 text-blue-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-600 mb-2">No flights to show</h2>
          <p className="text-gray-400 mb-5">Search for flights from the homepage</p>
          <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Search Flights
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center space-x-2 text-sm font-bold text-gray-800">
              <span>
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex gap-5">

          {/* Sidebar filters — desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span>Filters</span>
                </h3>
                {activeFiltersCount > 0 && (
                  <button onClick={() => setFilters({ stops: 'all', maxPrice: '', airlines: [] })}
                    className="text-xs text-red-500 font-semibold hover:text-red-600">Reset all</button>
                )}
              </div>

              <div className="mb-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Stops</p>
                <div className="space-y-2">
                  {[['all', 'Any stops'], ['direct', 'Nonstop only'], ['1stop', 'Max 1 stop']].map(([val, label]) => (
                    <label key={val} className="flex items-center space-x-3 cursor-pointer group">
                      <div onClick={() => setFilters(f => ({ ...f, stops: val }))}
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${filters.stops === val ? 'border-blue-600 bg-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                        {filters.stops === val && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                      </div>
                      <span className="text-sm text-gray-600">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Max Price</p>
                <input type="number" placeholder="e.g. 500000" value={filters.maxPrice}
                  onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Airlines</p>
                <div className="space-y-2.5">
                  {airlines.map(code => (
                    <label key={code} className="flex items-center space-x-3 cursor-pointer group">
                      <div onClick={() => toggleAirline(code)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${filters.airlines.includes(code) ? 'border-blue-600 bg-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                        {filters.airlines.includes(code) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-6 h-6 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                          <img src={getAirlineLogo(code)} alt={code} className="w-5 h-5 object-contain"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
                        <span className="text-sm text-gray-600 truncate">{AIRLINE_NAMES[code] || code}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Flight list */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3 gap-2">
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-gray-800">
                  {groupedByAirline.length} airline{groupedByAirline.length !== 1 ? 's' : ''} · {filtered.length} flight{filtered.length !== 1 ? 's' : ''}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {searchParams.origin} to {searchParams.destination} · {searchParams.departureDate}
                </p>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center space-x-1.5 border border-gray-200 bg-white px-3 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:border-blue-400 transition-colors">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filter</span>
                  {activeFiltersCount > 0 && <span className="bg-blue-600 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">{activeFiltersCount}</span>}
                </button>
                <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {['price', 'duration', 'departure'].map(s => (
                    <button key={s} onClick={() => setSortBy(s)}
                      className={`px-2 sm:px-3 py-2 text-xs font-semibold transition-colors ${sortBy === s ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                      {s === 'price' ? 'Price' : s === 'duration' ? 'Duration' : 'Time'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile filters */}
            {showFilters && (
              <div className="lg:hidden bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Stops</p>
                    <div className="space-y-1.5">
                      {[['all', 'Any'], ['direct', 'Nonstop'], ['1stop', '1 Stop']].map(([val, label]) => (
                        <label key={val} className="flex items-center space-x-2 cursor-pointer">
                          <input type="radio" name="stops" checked={filters.stops === val}
                            onChange={() => setFilters(f => ({ ...f, stops: val }))} className="accent-blue-600" />
                          <span className="text-sm text-gray-600">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Airlines</p>
                    <div className="space-y-1.5">
                      {airlines.map(code => (
                        <label key={code} className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" checked={filters.airlines.includes(code)}
                            onChange={() => toggleAirline(code)} className="accent-blue-600" />
                          <span className="text-sm text-gray-600 truncate">{AIRLINE_NAMES[code] || code}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 gap-2">
                  <input type="number" placeholder="Max price (NGN)" value={filters.maxPrice}
                    onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none flex-1 min-w-0" />
                  <button onClick={() => setFilters({ stops: 'all', maxPrice: '', airlines: [] })}
                    className="flex items-center space-x-1 text-sm text-red-500 font-medium flex-shrink-0">
                    <X className="w-4 h-4" /><span>Reset</span>
                  </button>
                </div>
              </div>
            )}

            {/* Airline groups */}
            <div className="space-y-4">
              {groupedByAirline.map(([airlineCode, airlineFlights], groupIndex) => (
                <AirlineGroup
                  key={airlineCode}
                  airlineCode={airlineCode}
                  flights={airlineFlights}
                  cheapestFlight={cheapestFlight}
                  fastestFlight={fastestFlight}
                  onSelect={handleSelect}
                  defaultExpanded={groupIndex === 0}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                <Plane className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-semibold">No flights match your filters</p>
                <button onClick={() => setFilters({ stops: 'all', maxPrice: '', airlines: [] })}
                  className="mt-3 text-blue-600 text-sm font-semibold hover:underline">Clear all filters</button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
    </div>
    </div>
  );
};

export default FlightsPage;
