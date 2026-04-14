import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, TrendingDown } from 'lucide-react';
import useFlightStore from '../store/flightStore';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.aerwiz.com/api';

const formatPriceShort = (amount) => {
  if (!amount) return '—';
  if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `₦${(amount / 1000).toFixed(0)}K`;
  return `₦${amount}`;
};

const formatDayLabel = (dateStr) => {
  const d = new Date(dateStr);
  return {
    day: d.toLocaleDateString('en-NG', { weekday: 'short' }),
    date: d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
  };
};

const getPriceColor = (price, minPrice, maxPrice) => {
  if (!price) return { bg: 'bg-gray-50', text: 'text-gray-300', border: 'border-gray-100' };
  const range = maxPrice - minPrice;
  if (range === 0) return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
  const ratio = (price - minPrice) / range;
  if (ratio <= 0.25) return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
  if (ratio <= 0.5) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
  if (ratio <= 0.75) return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' };
  return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' };
};

const FareCalendar = ({ origin, destination, adults = 1 }) => {
  const navigate = useNavigate();
  const { setSearchParams } = useFlightStore();
  const scrollRef = useRef(null);
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const monthStr = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}`;

  useEffect(() => {
    if (!origin || !destination) return;
    fetchCalendar();
  }, [origin, destination, currentMonth]);

  useEffect(() => {
    // Scroll to today or first available date
    setTimeout(() => {
      if (scrollRef.current) {
        const today = scrollRef.current.querySelector('[data-today="true"]');
        if (today) today.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 300);
  }, [calendarData]);

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/flights/calendar`, {
        params: { origin, destination, month: monthStr }
      });
      setCalendarData(res.data.data);
    } catch (e) {
      setCalendarData({ priceMap: {}, minPrice: 0, maxPrice: 0 });
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
    scrollRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  const prevMonth = () => {
    setCurrentMonth(prev => prev.month === 1 ? { year: prev.year - 1, month: 12 } : { ...prev, month: prev.month - 1 });
  };

  const nextMonth = () => {
    setCurrentMonth(prev => prev.month === 12 ? { year: prev.year + 1, month: 1 } : { ...prev, month: prev.month + 1 });
  };

  const handleDayClick = (dateStr, price) => {
    if (!price) return;
    setSelectedDate(dateStr);
    setSearchParams({
      origin, destination,
      departureDate: dateStr,
      adults,
      tripType: 'ONE_WAY',
      cabinClass: 'ECONOMY'
    });
    navigate('/flights');
  };

  const today = new Date().toISOString().split('T')[0];
  const daysInMonth = new Date(currentMonth.year, currentMonth.month, 0).getDate();
  const isPrevDisabled = currentMonth.year === now.getFullYear() && currentMonth.month <= now.getMonth() + 1;
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (!origin || !destination) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-4 overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center space-x-2">
          <TrendingDown className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-gray-700">Fare Calendar</span>
          {calendarData?.minPrice > 0 && (
            <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-semibold">
              From {formatPriceShort(calendarData.minPrice)}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={prevMonth} disabled={isPrevDisabled}
            className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-blue-600 disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-semibold text-gray-600 min-w-16 text-center">
            {MONTH_NAMES[currentMonth.month - 1]} {currentMonth.year}
          </span>
          <button onClick={nextMonth}
            className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

        {/* Scrollable date strip */}
        <div className="relative flex items-center">
          {/* Left arrow */}
          <button
            onClick={() => scroll(-1)}
            className={`absolute left-0 z-10 w-7 h-full flex items-center justify-center bg-gradient-to-r from-white via-white to-transparent transition-opacity ${canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
              <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
            </div>
          </button>

          {/* Date cards */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto scrollbar-hide gap-1.5 py-2 px-1 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

            {loading ? (
              Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-16 h-14 bg-gray-100 rounded-xl animate-pulse"></div>
              ))
            ) : (
              Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${monthStr}-${String(day).padStart(2, '0')}`;
                const isPast = dateStr < today;
                const isToday = dateStr === today;
                const priceData = calendarData?.priceMap?.[dateStr];
                const price = priceData?.price;
                const colors = getPriceColor(price, calendarData?.minPrice, calendarData?.maxPrice);
                const isSelected = selectedDate === dateStr;
                const isCheapest = price && price === calendarData?.minPrice;
                const { day: dayLabel, date: dateLabel } = formatDayLabel(dateStr);

                return (
                  <button
                    key={dateStr}
                    data-today={isToday}
                    onClick={() => handleDayClick(dateStr, price)}
                    disabled={isPast || !price}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl border flex flex-col items-center justify-center transition-all relative
                      ${isSelected ? 'ring-2 ring-blue-600 border-blue-600 bg-blue-600 text-white' :
                        isPast ? 'opacity-30 cursor-not-allowed bg-gray-50 border-gray-100' :
                        price ? `cursor-pointer ${colors.bg} ${colors.border} border hover:scale-105 hover:shadow-sm` :
                        'bg-gray-50 border-gray-100 cursor-not-allowed'
                      }
                      ${isToday && !isSelected ? 'ring-2 ring-blue-400' : ''}
                    `}
                  >
                    {isCheapest && !isSelected && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                    )}
                    <span className={`text-xs font-semibold leading-none ${isSelected ? 'text-white' : isPast ? 'text-gray-300' : 'text-gray-500'}`}>
                      {dayLabel}
                    </span>
                    <span className={`text-xs font-bold leading-none mt-0.5 ${isSelected ? 'text-white' : isPast ? 'text-gray-300' : 'text-gray-700'}`}>
                      {day}
                    </span>
                    <span className={`text-xs font-bold leading-none mt-1 ${isSelected ? 'text-white' : !price || isPast ? 'text-gray-300' : colors.text}`}>
                      {price ? formatPriceShort(price) : '—'}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll(1)}
            className={`absolute right-0 z-10 w-7 h-full flex items-center justify-center bg-gradient-to-l from-white via-white to-transparent transition-opacity ${canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            </div>
          </button>
        </div>
    </div>
  );
};

export default FareCalendar;