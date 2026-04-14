import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useFlightStore from '../store/flightStore';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.aerwiz.com/api';

const formatPriceShort = (amount) => {
  if (!amount) return null;
  if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `₦${(amount / 1000).toFixed(0)}K`;
  return `₦${amount}`;
};

const FareCalendar = ({ origin, destination, adults = 1 }) => {
  const navigate = useNavigate();
  const { setSearchParams } = useFlightStore();
  const scrollRef = useRef(null);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Build 60 days from today
  useEffect(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      list.push(d.toISOString().split('T')[0]);
    }
    setDates(list);
  }, []);

  const [priceMap, setPriceMap] = useState({});
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);

  useEffect(() => {
    if (!origin || !destination || dates.length === 0) return;
    fetchPrices();
  }, [origin, destination, dates]);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      // Fetch current month and next month
      const now = new Date();
      const months = [
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}`,
      ];
      const results = await Promise.all(
        months.map(month =>
          axios.get(`${API_URL}/flights/calendar`, { params: { origin, destination, month } })
            .then(r => r.data.data)
            .catch(() => ({ priceMap: {} }))
        )
      );
      const combined = {};
      results.forEach(r => Object.assign(combined, r.priceMap || {}));
      const prices = Object.values(combined).map(p => p.price).filter(Boolean);
      setPriceMap(combined);
      setMinPrice(prices.length ? Math.min(...prices) : 0);
      setMaxPrice(prices.length ? Math.max(...prices) : 0);
    } catch (e) {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  const handleClick = (dateStr) => {
    const price = priceMap[dateStr]?.price;
    setSelectedDate(dateStr);
    setSearchParams({ origin, destination, departureDate: dateStr, adults, tripType: 'ONE_WAY', cabinClass: 'ECONOMY' });
    navigate('/flights');
  };

  const getPriceStyle = (price) => {
    if (!price || !minPrice || !maxPrice) return 'text-gray-300';
    const range = maxPrice - minPrice;
    if (range === 0) return 'text-green-600 font-bold';
    const ratio = (price - minPrice) / range;
    if (ratio <= 0.33) return 'text-green-600 font-bold';
    if (ratio <= 0.66) return 'text-blue-600 font-semibold';
    return 'text-orange-500 font-semibold';
  };

  if (!origin || !destination) return null;

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="relative flex items-center">
        {/* Left scroll button */}
        {canScrollLeft && (
          <button onClick={() => scroll(-1)}
            className="absolute left-0 z-10 w-8 h-full flex items-center justify-center bg-gradient-to-r from-white via-white/90 to-transparent">
            <div className="w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
              <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
            </div>
          </button>
        )}

        {/* Scrollable strip */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto py-2 px-4 gap-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

          {loading ? (
            Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-16 h-12 bg-gray-100 rounded-lg animate-pulse"></div>
            ))
          ) : (
            dates.map(dateStr => {
              const d = new Date(dateStr);
              const dayNum = d.getDate();
              const mon = d.toLocaleDateString('en', { month: 'short' });
              const price = priceMap[dateStr]?.price;
              const isSelected = selectedDate === dateStr;
              const isCheapest = price && price === minPrice;

              return (
                <button
                  key={dateStr}
                  onClick={() => handleClick(dateStr)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center w-16 py-2 px-1 rounded-lg border transition-all
                    ${isSelected
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : isCheapest && price
                      ? 'bg-green-50 border-green-300 hover:bg-green-100'
                      : 'border-gray-100 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                >
                  <span className={`text-xs leading-none ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                    {mon} {dayNum}
                  </span>
                  <span className={`text-xs mt-1 leading-none ${isSelected ? 'text-white' : price ? getPriceStyle(price) : 'text-gray-200'}`}>
                    {price ? formatPriceShort(price) : '—'}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Right scroll button */}
        {canScrollRight && (
          <button onClick={() => scroll(1)}
            className="absolute right-0 z-10 w-8 h-full flex items-center justify-center bg-gradient-to-l from-white via-white/90 to-transparent">
            <div className="w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default FareCalendar;