import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Plane, Calendar, TrendingDown } from 'lucide-react';
import useFlightStore from '../store/flightStore';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.aerwiz.com/api';

const formatPrice = (amount) => {
  if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `₦${(amount / 1000).toFixed(0)}K`;
  return `₦${amount}`;
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getPriceColor = (price, minPrice, maxPrice) => {
  if (!price || !minPrice || !maxPrice) return '';
  const range = maxPrice - minPrice;
  if (range === 0) return 'bg-green-100 text-green-800 border-green-200';
  const ratio = (price - minPrice) / range;
  if (ratio <= 0.25) return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
  if (ratio <= 0.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
  if (ratio <= 0.75) return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200';
  return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
};

const FareCalendar = ({ origin, destination, adults = 1 }) => {
  const navigate = useNavigate();
  const { setSearchParams } = useFlightStore();
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const monthStr = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}`;

  useEffect(() => {
    if (!origin || !destination) return;
    fetchCalendar();
  }, [origin, destination, currentMonth]);

  const fetchCalendar = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/flights/calendar`, {
        params: { origin, destination, month: monthStr }
      });
      setCalendarData(res.data.data);
    } catch (e) {
      setError('Could not load fare calendar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 1) return { year: prev.year - 1, month: 12 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 12) return { year: prev.year + 1, month: 1 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  const handleDayClick = (dateStr, price) => {
    if (!price) return;
    setSearchParams({
      origin,
      destination,
      departureDate: dateStr,
      adults,
      tripType: 'ONE_WAY',
      cabinClass: 'ECONOMY'
    });
    navigate('/flights');
  };

  // Build calendar grid
  const daysInMonth = new Date(currentMonth.year, currentMonth.month, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.year, currentMonth.month - 1, 1).getDay();
  const today = new Date().toISOString().split('T')[0];

  const isPrevDisabled = currentMonth.year === now.getFullYear() && currentMonth.month <= now.getMonth() + 1;

  if (!origin || !destination) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-white" />
          <div>
            <h3 className="text-white font-bold">Fare Calendar</h3>
            <p className="text-blue-200 text-xs">{origin} → {destination} · Cheapest fares by day</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={prevMonth} disabled={isPrevDisabled}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-white font-semibold text-sm px-3 min-w-32 text-center">
            {MONTH_NAMES[currentMonth.month - 1]} {currentMonth.year}
          </span>
          <button onClick={nextMonth}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded bg-green-200"></div><span className="text-gray-500">Cheapest</span></div>
          <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded bg-yellow-200"></div><span className="text-gray-500">Low</span></div>
          <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded bg-orange-200"></div><span className="text-gray-500">Medium</span></div>
          <div className="flex items-center space-x-1"><div className="w-3 h-3 rounded bg-red-200"></div><span className="text-gray-500">High</span></div>
        </div>
        {calendarData?.minPrice > 0 && (
          <div className="flex items-center space-x-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-lg">
            <TrendingDown className="w-3 h-3" />
            <span>From {formatPrice(calendarData.minPrice)}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-400 text-sm">Loading fares...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-gray-400">
            <Plane className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{error}</p>
            <button onClick={fetchCalendar} className="text-blue-600 text-sm mt-2 hover:underline">Try again</button>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16"></div>
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${monthStr}-${String(day).padStart(2, '0')}`;
              const isPast = dateStr < today;
              const priceData = calendarData?.priceMap?.[dateStr];
              const price = priceData?.price;
              const colorClass = price ? getPriceColor(price, calendarData.minPrice, calendarData.maxPrice) : '';
              const isCheapest = price && price === calendarData?.minPrice;

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDayClick(dateStr, price)}
                  disabled={isPast || !price}
                  className={`h-16 rounded-xl border text-center flex flex-col items-center justify-center transition-all relative
                    ${isPast ? 'opacity-30 cursor-not-allowed bg-gray-50 border-gray-100' :
                      price ? `cursor-pointer ${colorClass} border` :
                      'bg-gray-50 border-gray-100 cursor-not-allowed'}`}
                >
                  {isCheapest && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">★</span>
                    </div>
                  )}
                  <span className={`text-xs font-bold ${price && !isPast ? '' : 'text-gray-400'}`}>{day}</span>
                  {price && !isPast ? (
                    <span className="text-xs font-semibold mt-0.5 leading-tight">{formatPrice(price)}</span>
                  ) : (
                    <span className="text-xs text-gray-300 mt-0.5">—</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* No fares message */}
        {!loading && !error && calendarData && Object.keys(calendarData.priceMap).length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <Plane className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No fares available for this month</p>
            <p className="text-xs mt-1">Try a different month or route</p>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-3">
          Click any date to search available flights · Prices are indicative and may change
        </p>
      </div>
    </div>
  );
};

export default FareCalendar;
