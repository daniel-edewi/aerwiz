import React, { useState, useEffect, useRef } from 'react';
import { Plane, Loader } from 'lucide-react';
import { flightsAPI } from '../services/api';
import { searchLocalAirports } from '../data/airports';

const AirportSearch = ({ value, onChange, placeholder = 'City or airport', label }) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState(null);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const search = async (keyword) => {
    if (keyword.length < 2) { setResults([]); return; }
    setLoading(true);

    // Always show local results instantly
    const localResults = searchLocalAirports(keyword);
    if (localResults.length > 0) {
      setResults(localResults.map(a => ({
        iataCode: a.iataCode,
        name: a.name,
        subType: a.subType,
        address: { cityName: a.city, countryName: a.country }
      })));
      setShowDropdown(true);
    }

    // Also try Amadeus for additional results
    try {
      const res = await flightsAPI.searchAirports(keyword);
      const amadeusResults = res.data.data || [];
      if (amadeusResults.length > 0) {
        // Merge: local first, then Amadeus results not already in local
        const localCodes = new Set(localResults.map(a => a.iataCode));
        const uniqueAmadeus = amadeusResults.filter(a => !localCodes.has(a.iataCode));
        const merged = [
          ...localResults.map(a => ({
            iataCode: a.iataCode, name: a.name, subType: a.subType,
            address: { cityName: a.city, countryName: a.country }
          })),
          ...uniqueAmadeus
        ].slice(0, 10);
        setResults(merged);
        setShowDropdown(true);
      }
    } catch {
      // Local results already shown, ignore Amadeus error
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelected(null);
    onChange('');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const handleSelect = (airport) => {
    const code = airport.iataCode;
    const city = airport.address?.cityName || airport.name;
    setSelected({ code, city });
    setQuery(`${city} (${code})`);
    onChange(code);
    setShowDropdown(false);
    setResults([]);
  };

  const getTypeIcon = (subType) => subType === 'CITY' ? '🏙️' : '✈️';

  return (
    <div ref={wrapperRef} className="relative">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className={`flex items-center border rounded-lg px-3 py-2 bg-white transition-all ${showDropdown ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300'}`}>
        <Plane className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => query.length >= 2 && results.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full outline-none text-gray-700 text-sm bg-transparent"
          autoComplete="off"
        />
        {loading && <Loader className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />}
        {selected && !loading && (
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex-shrink-0">
            {selected.code}
          </span>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
          {results.map((airport, i) => (
            <button key={i} type="button" onClick={() => handleSelect(airport)}
              className="w-full flex items-start space-x-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-50 last:border-0">
              <span className="text-lg mt-0.5 flex-shrink-0">{getTypeIcon(airport.subType)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-800 text-sm truncate">
                    {airport.address?.cityName || airport.name}
                  </p>
                  <span className="font-bold text-blue-600 text-sm ml-2 flex-shrink-0 bg-blue-50 px-2 py-0.5 rounded">
                    {airport.iataCode}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{airport.name}</p>
                <p className="text-xs text-gray-400">{airport.address?.countryName}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl px-4 py-3">
          <p className="text-sm text-gray-500 text-center mb-1">No results for "{query}"</p>
          <p className="text-xs text-gray-400 text-center">Try airport code (e.g. DXB, LOS, DOH) or city name</p>
        </div>
      )}
    </div>
  );
};

export default AirportSearch;