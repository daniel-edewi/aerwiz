import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useFlightStore from '../store/flightStore';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.aerwiz.com/api';

const fmt = (amount) => {
  if (!amount) return null;
  if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `₦${(amount / 1000).toFixed(0)}K`;
  return `₦${amount}`;
};

const FareCalendar = ({ origin, destination, adults = 1 }) => {
  const navigate = useNavigate();
  const { setSearchParams } = useFlightStore();
  const scrollRef = useRef(null);
  const [priceMap, setPriceMap] = useState({});
  const [minPrice, setMinPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const dates = Array.from({ length: 60 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
    if (!origin || !destination) return;
    setLoading(true);
    const now = new Date();
    const months = [
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}`,
    ];
    Promise.all(months.map(month =>
      axios.get(`${API_URL}/flights/calendar`, { params: { origin, destination, month } })
        .then(r => r.data.data?.priceMap || {}).catch(() => ({}))
    )).then(results => {
      const combined = Object.assign({}, ...results);
      const prices = Object.values(combined).map(p => p.price).filter(Boolean);
      setPriceMap(combined);
      setMinPrice(prices.length ? Math.min(...prices) : 0);
    }).finally(() => setLoading(false));
  }, [origin, destination]);

  const handleClick = (dateStr) => {
    setSelected(dateStr);
    setSearchParams({ origin, destination, departureDate: dateStr, adults, tripType: 'ONE_WAY', cabinClass: 'ECONOMY' });
    navigate('/flights');
  };

  if (!origin || !destination) return null;

  return (
    <div className="relative flex items-center bg-white border-b border-gray-200" style={{ height: '56px' }}>
      <button onClick={() => scrollRef.current?.scrollBy({ left: -280, behavior: 'smooth' })}
        className="absolute left-0 z-10 h-full px-1 bg-gradient-to-r from-white via-white to-transparent flex items-center">
        <ChevronLeft className="w-4 h-4 text-gray-400" />
      </button>

      <div ref={scrollRef} className="flex overflow-x-auto h-full items-center px-6 gap-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {loading ? (
          Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-14 h-10 bg-gray-100 rounded animate-pulse" />
          ))
        ) : (
          dates.map(dateStr => {
            const d = new Date(dateStr);
            const price = priceMap[dateStr]?.price;
            const isCheapest = price && price === minPrice;
            const isSelected = selected === dateStr;
            return (
              <button key={dateStr} onClick={() => handleClick(dateStr)}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-10 rounded-lg text-center transition-all border
                  ${isSelected ? 'bg-blue-600 border-blue-600' :
                    isCheapest ? 'bg-green-50 border-green-300' :
                    'border-transparent hover:border-blue-200 hover:bg-blue-50'}`}>
                <span className={`text-xs leading-none ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                  {d.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </span>
                <span className={`text-xs font-bold leading-none mt-0.5 ${isSelected ? 'text-white' : isCheapest ? 'text-green-600' : price ? 'text-blue-600' : 'text-gray-200'}`}>
                  {price ? fmt(price) : '—'}
                </span>
              </button>
            );
          })
        )}
      </div>

      <button onClick={() => scrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' })}
        className="absolute right-0 z-10 h-full px-1 bg-gradient-to-l from-white via-white to-transparent flex items-center">
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
};

export default FareCalendar;
