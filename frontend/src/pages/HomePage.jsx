import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { flightsAPI } from '../services/api';
import useFlightStore from '../store/flightStore';
import toast from 'react-hot-toast';
import {
  Plane, Search, Calendar, Users, Plus, Trash2,
  FileSearch, ChevronRight, Mail, TrendingDown, ArrowRight,
  Tag, X, Lock, CheckCircle
} from 'lucide-react';
import AirportSearch from '../components/AirportSearch';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://aerwiz-production.up.railway.app/api';

const AirplaneLoader = () => (
  <span className="inline-flex items-center space-x-2">
    <span className="relative flex items-center justify-center w-5 h-5">
      <span className="animate-spin absolute w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
      <Plane className="w-2.5 h-2.5 text-white" />
    </span>
    <span>Please wait...</span>
  </span>
);

// Always returns a date N days from TODAY — never in the past
const futureDate = (daysFromNow) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
};

const getTrendingDeals = () => [
  {
    from: 'LOS', to: 'LHR',
    fromCity: 'Lagos', toCity: 'London',
    price: 780000,
    departureDate: futureDate(21),
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80',
    landmark: 'Tower Bridge, London',
    tag: 'Most Popular',
    tagColor: 'bg-blue-600',
  },
  {
    from: 'LOS', to: 'DXB',
    fromCity: 'Lagos', toCity: 'Dubai',
    price: 520000,
    departureDate: futureDate(14),
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
    landmark: 'Burj Khalifa, Dubai',
    tag: 'Best Value',
    tagColor: 'bg-green-600',
  },
  {
    from: 'LOS', to: 'JFK',
    fromCity: 'Lagos', toCity: 'New York',
    price: 950000,
    departureDate: futureDate(30),
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80',
    landmark: 'Manhattan Skyline',
    tag: 'Hot Deal',
    tagColor: 'bg-red-500',
  },
  {
    from: 'ABV', to: 'DOH',
    fromCity: 'Abuja', toCity: 'Doha',
    price: 490000,
    departureDate: futureDate(18),
    image: 'https://images.unsplash.com/photo-1537511446984-935f663eb1f4?w=600&q=80',
    landmark: 'Doha Skyline, Qatar',
    tag: 'Low Fare',
    tagColor: 'bg-purple-600',
  },
  {
    from: 'LOS', to: 'CDG',
    fromCity: 'Lagos', toCity: 'Paris',
    price: 720000,
    departureDate: futureDate(25),
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
    landmark: 'Eiffel Tower, Paris',
    tag: 'Trending',
    tagColor: 'bg-pink-500',
  },
  {
    from: 'LOS', to: 'NBO',
    fromCity: 'Lagos', toCity: 'Nairobi',
    price: 185000,
    departureDate: futureDate(10),
    image: 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=600&q=80',
    landmark: 'Nairobi National Park',
    tag: 'Africa Deal',
    tagColor: 'bg-orange-500',
  },
];

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

const formatDisplayDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAYMENT_PENDING: 'bg-orange-100 text-orange-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  FAILED: 'bg-red-100 text-red-700',
};

// Official coloured logos — same CDN used by Travelbeta
const PARTNERS = [
  {
    name: 'IATA',
    logo: 'https://res.cloudinary.com/diapyzzws/image/upload/v1682565809/Website%20Images/iataLogoColoured.svg',
  },
  {
    name: 'Paystack',
    logo: 'https://res.cloudinary.com/diapyzzws/image/upload/v1682565809/Website%20Images/paystackLogoColoured.svg',
  },
  {
    name: 'Amadeus',
    logo: 'https://res.cloudinary.com/diapyzzws/image/upload/v1682565809/Website%20Images/amadeusLogoColoured.svg',
  },
  {
    name: 'Flutterwave',
    logo: 'https://res.cloudinary.com/diapyzzws/image/upload/v1682565809/Website%20Images/flutterwaveLogoColoured.svg',
  },
  {
    name: 'Interswitch',
    logo: 'https://res.cloudinary.com/diapyzzws/image/upload/v1682565809/Website%20Images/InterswitchLogoColoured.svg',
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const {
    searchParams, setSearchParams, setSearchResults,
    setIsSearching, setMultiCityLeg, addMultiCityLeg, removeMultiCityLeg,
  } = useFlightStore();

  const [loading, setLoading] = useState(false);
  const [dealLoading, setDealLoading] = useState(null);
  const [bookingRef, setBookingRef] = useState('');
  const [lastName, setLastName] = useState('');
  const [manageLoading, setManageLoading] = useState(false);
  const [foundBooking, setFoundBooking] = useState(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const TRENDING_DEALS = getTrendingDeals();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsSearching(true);
    try {
      let results = [];
      if (searchParams.tripType === 'MULTI_CITY') {
        const legs = searchParams.multiCityLegs;
        if (legs.some(l => !l.origin || !l.destination || !l.departureDate)) {
          toast.error('Please fill in all flight legs');
          setLoading(false); setIsSearching(false); return;
        }
        const allResults = await Promise.all(
          legs.map(leg =>
            flightsAPI.search({
              origin: leg.origin.toUpperCase(),
              destination: leg.destination.toUpperCase(),
              departureDate: leg.departureDate,
              adults: searchParams.adults,
              cabinClass: searchParams.cabinClass,
            }).then(r => r.data.data).catch(() => [])
          )
        );
        results = allResults.flat();
      } else {
        if (!searchParams.origin || !searchParams.destination || !searchParams.departureDate) {
          toast.error('Please fill in all required fields');
          setLoading(false); setIsSearching(false); return;
        }
        const response = await flightsAPI.search({
          origin: searchParams.origin.toUpperCase(),
          destination: searchParams.destination.toUpperCase(),
          departureDate: searchParams.departureDate,
          returnDate: searchParams.tripType === 'ROUND_TRIP' ? searchParams.returnDate : undefined,
          adults: searchParams.adults,
          cabinClass: searchParams.cabinClass,
        });
        results = response.data.data;
      }
      setSearchResults(results);
      navigate('/flights');
    } catch (error) {
      toast.error('No flights found. Please try different dates or destinations.');
    } finally {
      setLoading(false); setIsSearching(false);
    }
  };

  const handleDealClick = async (deal) => {
    setDealLoading(deal.to);
    setIsSearching(true);
    try {
      setSearchParams({
        origin: deal.from,
        destination: deal.to,
        departureDate: deal.departureDate,
        tripType: 'ONE_WAY',
        adults: 1,
        cabinClass: 'ECONOMY',
      });
      const response = await flightsAPI.search({
        origin: deal.from,
        destination: deal.to,
        departureDate: deal.departureDate,
        adults: 1,
        cabinClass: 'ECONOMY',
      });
      setSearchResults(response.data.data);
      navigate('/flights');
    } catch (error) {
      toast('Showing available flights for this route');
      navigate('/flights');
    } finally {
      setDealLoading(null);
      setIsSearching(false);
    }
  };

  const handleManageBooking = async (e) => {
    e.preventDefault();
    if (!bookingRef.trim() || !lastName.trim())
      return toast.error('Please enter your booking reference and last name');
    setManageLoading(true);
    setFoundBooking(null);
    try {
      const res = await axios.get(`${API_URL}/bookings/reference/${bookingRef.trim().toUpperCase()}`);
      const booking = res.data.data;
      const passengerLastName = booking.passengers?.[0]?.lastName?.toLowerCase();
      if (passengerLastName !== lastName.trim().toLowerCase()) {
        toast.error('Last name does not match our records');
        setManageLoading(false);
        return;
      }
      setFoundBooking(booking);
    } catch (e) {
      toast.error('Booking not found. Please check your reference number.');
    } finally {
      setManageLoading(false);
    }
  };

  return (
    <div className="bg-white">

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <div className="relative">
        <div className="relative h-[440px] sm:h-[540px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=80"
            alt="Aircraft flying"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=1600&q=80'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/85 via-blue-900/65 to-white/95"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pb-32">
            <p className="text-blue-300 text-xs sm:text-sm font-bold uppercase tracking-widest mb-4 drop-shadow">
              Nigeria's Smartest Flight Booking Platform
            </p>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-4 drop-shadow-lg leading-tight tracking-tight">
              Better Flights.<br />Lower Prices.
            </h1>
            <p className="text-blue-100 text-base sm:text-xl drop-shadow font-medium">
              Skip the Agent. Keep the Savings.
            </p>
          </div>
        </div>

        {/* Search card */}
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 -mt-28 relative z-10 pb-10">
          <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 border border-gray-100">
            <div className="flex space-x-1 mb-5 bg-gray-100 rounded-xl p-1">
              {['ONE_WAY', 'ROUND_TRIP', 'MULTI_CITY'].map((type) => (
                <button key={type} onClick={() => setSearchParams({ tripType: type })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${searchParams.tripType === type ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
                  {type === 'ONE_WAY' ? 'One Way' : type === 'ROUND_TRIP' ? 'Round Trip' : 'Multi-City'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch}>
              {searchParams.tripType === 'MULTI_CITY' ? (
                <div className="space-y-3 mb-4">
                  {searchParams.multiCityLegs.map((leg, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-blue-600">Flight {index + 1}</span>
                        {index > 1 && (
                          <button type="button" onClick={() => removeMultiCityLeg(index)} className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <AirportSearch label="From" value={leg.origin} onChange={(code) => setMultiCityLeg(index, { origin: code })} placeholder="City or airport" />
                        <AirportSearch label="To" value={leg.destination} onChange={(code) => setMultiCityLeg(index, { destination: code })} placeholder="City or airport" />
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <input type="date" value={leg.departureDate}
                              onChange={(e) => setMultiCityLeg(index, { departureDate: e.target.value })}
                              className="w-full outline-none text-gray-700 text-sm"
                              min={new Date().toISOString().split('T')[0]} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {searchParams.multiCityLegs.length < 5 && (
                    <button type="button" onClick={addMultiCityLeg}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm px-4 py-2 border border-dashed border-blue-300 rounded-lg w-full justify-center hover:bg-blue-50 transition-colors">
                      <Plus className="w-4 h-4" />
                      <span>Add Another Flight</span>
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
                      <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <select value={searchParams.adults} onChange={(e) => setSearchParams({ adults: parseInt(e.target.value) })} className="w-full outline-none text-gray-700 text-sm">
                          {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cabin Class</label>
                      <select value={searchParams.cabinClass} onChange={(e) => setSearchParams({ cabinClass: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none text-gray-700 text-sm">
                        <option value="ECONOMY">Economy</option>
                        <option value="PREMIUM_ECONOMY">Premium Economy</option>
                        <option value="BUSINESS">Business</option>
                        <option value="FIRST">First Class</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <AirportSearch label="From" value={searchParams.origin} onChange={(code) => setSearchParams({ origin: code })} placeholder="City or airport e.g. Lagos" />
                  <AirportSearch label="To" value={searchParams.destination} onChange={(code) => setSearchParams({ destination: code })} placeholder="City or airport e.g. London" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
                    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <input type="date" value={searchParams.departureDate}
                        onChange={(e) => setSearchParams({ departureDate: e.target.value })}
                        className="w-full outline-none text-gray-700 text-sm"
                        min={new Date().toISOString().split('T')[0]} />
                    </div>
                  </div>
                  {searchParams.tripType === 'ROUND_TRIP' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
                      <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <input type="date" value={searchParams.returnDate || ''}
                          onChange={(e) => setSearchParams({ returnDate: e.target.value })}
                          className="w-full outline-none text-gray-700 text-sm"
                          min={searchParams.departureDate || new Date().toISOString().split('T')[0]} />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
                    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                      <Users className="w-4 h-4 text-gray-400 mr-2" />
                      <select value={searchParams.adults} onChange={(e) => setSearchParams({ adults: parseInt(e.target.value) })} className="w-full outline-none text-gray-700 text-sm">
                        {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cabin Class</label>
                    <select value={searchParams.cabinClass} onChange={(e) => setSearchParams({ cabinClass: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none text-gray-700 text-sm">
                      <option value="ECONOMY">Economy</option>
                      <option value="PREMIUM_ECONOMY">Premium Economy</option>
                      <option value="BUSINESS">Business</option>
                      <option value="FIRST">First Class</option>
                    </select>
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-70 text-base shadow-lg shadow-blue-200">
                {loading ? <AirplaneLoader /> : (<><Search className="w-5 h-5" /><span>Search Flights</span></>)}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          TRUST STRIP — Transparent Pricing, Secure Checkout, Instant Confirmations
      ══════════════════════════════════════ */}
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              icon: <Tag className="w-6 h-6 text-blue-600" />,
              title: 'Transparent Pricing',
              desc: 'No hidden fees, no surprise charges. The price you see is exactly the price you pay — always.',
            },
            {
              icon: <Lock className="w-6 h-6 text-blue-600" />,
              title: 'Secure Checkout',
              desc: 'Pay safely in Naira with Paystack. Bank-grade SSL encryption protects every transaction.',
            },
            {
              icon: <CheckCircle className="w-6 h-6 text-blue-600" />,
              title: 'Instant Confirmations',
              desc: 'Receive your e-ticket and booking confirmation the moment your payment goes through.',
            },
          ].map(f => (
            <div key={f.title} className="flex items-start space-x-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">{f.icon}</div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          TRENDING FLIGHT DEALS
      ══════════════════════════════════════ */}
      <div className="bg-gray-50 py-14">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="w-5 h-5 text-blue-600" />
              <span className="text-blue-600 text-xs font-bold uppercase tracking-widest">Trending Now</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Flight Deals You'll Love</h2>
            <p className="text-gray-500 mt-1 text-sm">Popular routes from Nigeria — click any card to see live prices and book instantly</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TRENDING_DEALS.map((deal) => (
              <div
                key={deal.to}
                onClick={() => handleDealClick(deal)}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.toCity}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent"></div>
                  <span className={`absolute top-3 left-3 ${deal.tagColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow`}>
                    {deal.tag}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-bold text-xl leading-tight">{deal.toCity}</p>
                    <p className="text-white/75 text-xs mt-0.5">{deal.landmark}</p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5 text-sm text-gray-700">
                      <span className="font-semibold">{deal.fromCity}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-semibold">{deal.toCity}</span>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-mono">{deal.from}–{deal.to}</span>
                  </div>

                  <div className="flex items-center space-x-1 text-xs text-gray-400 mb-3">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>Departs {formatDisplayDate(deal.departureDate)}</span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-400">From</p>
                      <p className="text-xl font-extrabold text-blue-600">{formatPrice(deal.price)}</p>
                      <p className="text-xs text-gray-400">Economy · 1 Adult</p>
                    </div>
                    <button
                      disabled={dealLoading === deal.to}
                      className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-70 shadow-sm"
                    >
                      {dealLoading === deal.to ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <span>Book Now</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ MANAGE BOOKING — single line ══ */}
      <div id="manage-booking-section" className="bg-gray-50 border-t border-b border-gray-200 py-4">
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6">
          <form onSubmit={handleManageBooking} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <span className="text-sm font-semibold text-gray-600 whitespace-nowrap flex-shrink-0">Manage Booking</span>
            <div className="hidden sm:block w-px h-6 bg-gray-300 flex-shrink-0 mx-1"></div>
            <input
              type="text"
              value={bookingRef}
              onChange={(e) => setBookingRef(e.target.value.toUpperCase())}
              placeholder="Booking reference (e.g. AWZ123456)"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono tracking-wider bg-white"
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name (e.g. Johnson)"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            />
            <button
              type="submit"
              disabled={manageLoading}
              className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-70 flex items-center space-x-1.5"
            >
              {manageLoading ? <AirplaneLoader /> : <><Search className="w-4 h-4" /><span>Find</span></>}
            </button>
          </form>

          {/* Inline result */}
          {foundBooking && (
            <div className="mt-3 bg-white rounded-lg border border-gray-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="font-extrabold text-blue-600 font-mono tracking-widest">{foundBooking.bookingReference}</span>
                <span className="text-gray-300">|</span>
                <span className="font-semibold text-gray-800">{foundBooking.origin} → {foundBooking.destination}</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600">{formatDisplayDate(foundBooking.departureDate)}</span>
                <span className="text-gray-300">|</span>
                <span className="font-bold text-blue-600">{formatPrice(foundBooking.totalAmount)}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[foundBooking.status] || 'bg-gray-100 text-gray-600'}`}>
                  {foundBooking.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {foundBooking.status === 'PENDING' && (
                  <button onClick={() => navigate('/dashboard')} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700">Pay Now</button>
                )}
                {['CONFIRMED', 'PAYMENT_PENDING'].includes(foundBooking.status) && (
                  <button onClick={() => navigate('/dashboard')} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700">View Booking</button>
                )}
                <button onClick={() => { setFoundBooking(null); setBookingRef(''); setLastName(''); }} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          TRUSTED PARTNERS — official coloured logos
      ══════════════════════════════════════ */}
      <div className="bg-white py-10 border-t border-gray-100">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6">
          <p className="text-center text-gray-400 text-xs font-semibold mb-8 uppercase tracking-widest">
            Trusted &amp; Certified Partners
          </p>
          {/* Logo row — matches Travelbeta's style: coloured logos, dividers, generous spacing */}
          <div className="flex flex-wrap items-center justify-center">
            {PARTNERS.map((p, index) => (
              <React.Fragment key={p.name}>
                <div className="flex items-center justify-center px-6 sm:px-10 py-3">
                  <img
                    src={p.logo}
                    alt={p.name}
                    className="h-7 sm:h-9 w-auto object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  {/* Fallback text if image fails */}
                  <span className="text-sm font-bold text-gray-500 hidden">{p.name}</span>
                </div>
                {/* Vertical divider between logos — hidden on last item */}
                {index < PARTNERS.length - 1 && (
                  <div className="hidden sm:block w-px h-8 bg-gray-200 flex-shrink-0"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          NEWSLETTER
      ══════════════════════════════════════ */}
      <div className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-xl mx-auto text-center px-4">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Mail className="w-7 h-7 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Get the Latest Travel Deals</h2>
          <p className="text-gray-500 mb-6 text-sm">Subscribe and never miss a flight deal or exclusive promo offer again.</p>
          {subscribed ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 font-medium text-sm">
              Thank you for subscribing! You'll receive the best deals straight to your inbox.
            </div>
          ) : (
            <div className="flex space-x-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
              />
              <button
                onClick={() => { if (email) { setSubscribed(true); toast.success('Subscribed successfully!'); } }}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
              >
                Subscribe
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default HomePage;