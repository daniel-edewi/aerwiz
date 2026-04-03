import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { flightsAPI } from '../services/api';
import useFlightStore from '../store/flightStore';
import toast from 'react-hot-toast';
import { Plane, Search, Calendar, Users, Plus, Trash2, FileSearch, ChevronRight, Star, Shield, Globe, Mail, TrendingDown, ArrowRight } from 'lucide-react';
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

// Trending deals — real popular routes from Lagos with landmark images
// Prices are approximate economy fares (NGN). Update as needed.
const TRENDING_DEALS = [
  {
    from: 'LOS', to: 'LHR',
    fromCity: 'Lagos', toCity: 'London',
    country: 'United Kingdom',
    price: 780000,
    departureDate: '2025-07-15',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80',
    landmark: 'Tower Bridge, London',
    tag: 'Most Popular',
    tagColor: 'bg-blue-600',
  },
  {
    from: 'LOS', to: 'DXB',
    fromCity: 'Lagos', toCity: 'Dubai',
    country: 'UAE',
    price: 520000,
    departureDate: '2025-07-20',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
    landmark: 'Burj Khalifa, Dubai',
    tag: 'Best Value',
    tagColor: 'bg-green-600',
  },
  {
    from: 'LOS', to: 'JFK',
    fromCity: 'Lagos', toCity: 'New York',
    country: 'United States',
    price: 950000,
    departureDate: '2025-08-01',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80',
    landmark: 'Manhattan Skyline',
    tag: 'Hot Deal',
    tagColor: 'bg-red-500',
  },
  {
    from: 'ABV', to: 'DOH',
    fromCity: 'Abuja', toCity: 'Doha',
    country: 'Qatar',
    price: 490000,
    departureDate: '2025-07-25',
    image: 'https://images.unsplash.com/photo-1637573048046-29c0aeb60413?w=600&q=80',
    landmark: 'Doha Skyline',
    tag: 'Low Fare',
    tagColor: 'bg-purple-600',
  },
  {
    from: 'LOS', to: 'CDG',
    fromCity: 'Lagos', toCity: 'Paris',
    country: 'France',
    price: 720000,
    departureDate: '2025-08-10',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
    landmark: 'Eiffel Tower, Paris',
    tag: 'Trending',
    tagColor: 'bg-pink-500',
  },
  {
    from: 'LOS', to: 'NBO',
    fromCity: 'Lagos', toCity: 'Nairobi',
    country: 'Kenya',
    price: 185000,
    departureDate: '2025-07-18',
    image: 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=600&q=80',
    landmark: 'Nairobi National Park',
    tag: 'Africa Deal',
    tagColor: 'bg-orange-500',
  },
];

const formatPrice = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

const HomePage = () => {
  const navigate = useNavigate();
  const { searchParams, setSearchParams, setSearchResults, setIsSearching, setMultiCityLeg, addMultiCityLeg, removeMultiCityLeg } = useFlightStore();
  const [loading, setLoading] = useState(false);
  const [dealLoading, setDealLoading] = useState(null);
  const [bookingRef, setBookingRef] = useState('');
  const [lastName, setLastName] = useState('');
  const [manageLoading, setManageLoading] = useState(false);
  const [foundBooking, setFoundBooking] = useState(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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
          legs.map(leg => flightsAPI.search({
            origin: leg.origin.toUpperCase(),
            destination: leg.destination.toUpperCase(),
            departureDate: leg.departureDate,
            adults: searchParams.adults,
            cabinClass: searchParams.cabinClass
          }).then(r => r.data.data).catch(() => []))
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
          cabinClass: searchParams.cabinClass
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

  // Click trending deal → search flights for that route + date and navigate
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
        cabinClass: 'ECONOMY'
      });
      const response = await flightsAPI.search({
        origin: deal.from,
        destination: deal.to,
        departureDate: deal.departureDate,
        adults: 1,
        cabinClass: 'ECONOMY'
      });
      setSearchResults(response.data.data);
      navigate('/flights');
    } catch (error) {
      // Even if search fails, navigate to flights page with params pre-filled
      toast('Showing available flights for this route');
      navigate('/flights');
    } finally {
      setDealLoading(null);
      setIsSearching(false);
    }
  };

  const handleManageBooking = async (e) => {
    e.preventDefault();
    if (!bookingRef.trim() || !lastName.trim()) return toast.error('Please enter your booking reference and last name');
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

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const STATUS_COLORS = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PAYMENT_PENDING: 'bg-orange-100 text-orange-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    COMPLETED: 'bg-blue-100 text-blue-700',
    FAILED: 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-white">

      {/* Hero Section */}
      <div className="relative">
        <div className="relative h-[420px] sm:h-[500px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=80"
            alt="Aircraft flying"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=1600&q=80'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 via-blue-800/50 to-white/90"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pb-24">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 drop-shadow-lg">Going somewhere?</h1>
            <p className="text-blue-100 text-lg sm:text-xl drop-shadow">We offer the best flight deals in the industry!</p>
          </div>
        </div>

        {/* Search Form */}
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 -mt-24 relative z-10 pb-8">
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-70 text-base shadow-lg">
                {loading ? <AirplaneLoader /> : (<><Search className="w-5 h-5" /><span>Search Flights</span></>)}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Features Strip */}
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: <Star className="w-7 h-7 text-blue-600" />, title: 'Best Prices Guaranteed', desc: 'We search hundreds of airlines to find you the lowest fares available.' },
            { icon: <Shield className="w-7 h-7 text-blue-600" />, title: 'Secure Payments', desc: 'Pay safely in Naira with Paystack. Your data is always protected.' },
            { icon: <Globe className="w-7 h-7 text-blue-600" />, title: 'Worldwide Coverage', desc: 'Fly to over 500 destinations across Africa, Europe, Asia and beyond.' },
          ].map(f => (
            <div key={f.title} className="flex items-start space-x-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">{f.icon}</div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== TRENDING FLIGHT DEALS ===== */}
      <div className="bg-gray-50 py-14 px-4">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <TrendingDown className="w-5 h-5 text-blue-600" />
                <span className="text-blue-600 text-sm font-bold uppercase tracking-wide">Trending Now</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Flight Deals You'll Love</h2>
              <p className="text-gray-500 mt-1">Real fares on popular routes from Nigeria — click to see live prices</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
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
                    onError={(e) => {
                      e.target.src = `https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

                  {/* Tag */}
                  <div className={`absolute top-3 left-3 ${deal.tagColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                    {deal.tag}
                  </div>

                  {/* Destination name overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-bold text-lg leading-tight">{deal.toCity}</p>
                    <p className="text-white/80 text-xs">{deal.landmark}</p>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 text-gray-600 text-sm">
                      <span className="font-semibold text-gray-800">{deal.fromCity}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-semibold text-gray-800">{deal.toCity}</span>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{deal.from} – {deal.to}</span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">From</p>
                      <p className="text-xl font-bold text-blue-600">{formatPrice(deal.price)}</p>
                      <p className="text-xs text-gray-400">Economy · One Way</p>
                    </div>
                    <button
                      disabled={dealLoading === deal.to}
                      className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-70"
                    >
                      {dealLoading === deal.to ? (
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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

      {/* Popular Routes */}
      <div className="bg-white py-12 px-4">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Popular Routes</h2>
          <p className="text-gray-500 mb-6">Most searched flights from Nigeria</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { from: 'LOS', to: 'LHR', fromCity: 'Lagos', toCity: 'London' },
              { from: 'LOS', to: 'DXB', fromCity: 'Lagos', toCity: 'Dubai' },
              { from: 'LOS', to: 'JFK', fromCity: 'Lagos', toCity: 'New York' },
              { from: 'ABV', to: 'DOH', fromCity: 'Abuja', toCity: 'Doha' },
              { from: 'LOS', to: 'CDG', fromCity: 'Lagos', toCity: 'Paris' },
              { from: 'LOS', to: 'NBO', fromCity: 'Lagos', toCity: 'Nairobi' },
              { from: 'ABV', to: 'DXB', fromCity: 'Abuja', toCity: 'Dubai' },
              { from: 'LOS', to: 'ADD', fromCity: 'Lagos', toCity: 'Addis Ababa' },
            ].map((route, index) => (
              <div key={index}
                onClick={() => {
                  setSearchParams({ origin: route.from, destination: route.to, tripType: 'ONE_WAY' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-2">
                  <Plane className="w-4 h-4 text-blue-600" />
                </div>
                <p className="font-bold text-gray-800 text-sm group-hover:text-blue-600">{route.fromCity} to {route.toCity}</p>
                <p className="text-xs text-gray-400 mt-1">{route.from} – {route.to}</p>
                <div className="flex items-center text-blue-600 text-xs mt-2 font-medium">
                  <span>Search</span>
                  <ChevronRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manage My Booking */}
      <div id="manage-booking-section" className="bg-blue-700 py-12 px-4">
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center space-x-3 mb-6">
            <FileSearch className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-white text-xl font-bold">Manage My Booking</h2>
              <p className="text-blue-200 text-sm">Retrieve your booking using your reference number</p>
            </div>
          </div>
          <form onSubmit={handleManageBooking} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-blue-200 text-xs font-medium mb-1">Booking Reference</label>
              <input type="text" value={bookingRef} onChange={(e) => setBookingRef(e.target.value.toUpperCase())}
                placeholder="e.g. AWZABC123"
                className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-blue-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-white text-sm uppercase tracking-widest" />
            </div>
            <div>
              <label className="block text-blue-200 text-xs font-medium mb-1">Passenger Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Edewi"
                className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-blue-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-white text-sm" />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={manageLoading}
                className="w-full bg-white text-blue-700 font-bold py-2.5 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-70 flex items-center justify-center space-x-2">
                {manageLoading ? <AirplaneLoader /> : (<><Search className="w-4 h-4" /><span>Find Booking</span></>)}
              </button>
            </div>
          </form>

          {foundBooking && (
            <div className="mt-6 bg-white rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400">Booking Reference</p>
                  <p className="text-xl font-bold text-blue-600 font-mono tracking-widest">{foundBooking.bookingReference}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[foundBooking.status] || 'bg-gray-100 text-gray-600'}`}>
                  {foundBooking.status.replace('_', ' ')}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div><p className="text-xs text-gray-400">Route</p><p className="font-bold text-gray-800">{foundBooking.origin} to {foundBooking.destination}</p></div>
                <div><p className="text-xs text-gray-400">Departure</p><p className="font-medium text-gray-700 text-sm">{formatDate(foundBooking.departureDate)}</p></div>
                <div><p className="text-xs text-gray-400">Flight</p><p className="font-medium text-gray-700 text-sm">{foundBooking.flightNumber}</p></div>
                <div><p className="text-xs text-gray-400">Total</p><p className="font-bold text-blue-600">{formatPrice(foundBooking.totalAmount)}</p></div>
              </div>
              <div className="flex flex-wrap gap-2">
                {foundBooking.status === 'PENDING' && (
                  <button onClick={() => navigate('/dashboard')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Complete Payment</button>
                )}
                {['CONFIRMED', 'PAYMENT_PENDING'].includes(foundBooking.status) && (
                  <button onClick={() => navigate('/dashboard')} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">View Full Booking</button>
                )}
                <button onClick={() => { setFoundBooking(null); setBookingRef(''); setLastName(''); }}
                  className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">Clear</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trust Partners */}
      <div className="bg-white py-10 px-4 border-y border-gray-100">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6">
          <p className="text-center text-gray-400 text-sm font-medium mb-6 uppercase tracking-wide">Trusted Partners</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {[
              { name: 'Amadeus', color: '#0077BE' },
              { name: 'Paystack', color: '#00C3F7' },
              { name: 'IATA', color: '#003366' },
              { name: 'Visa', color: '#1A1F71' },
              { name: 'Mastercard', color: '#EB001B' },
            ].map(p => (
              <div key={p.name}>
                <span className="text-lg font-bold" style={{ color: p.color }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-gray-50 py-12 px-4">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Get the latest travel deals</h2>
          <p className="text-gray-500 mb-6">Subscribe to our newsletter and never miss a great deal</p>
          {subscribed ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 font-medium">
              Thank you for subscribing! You'll receive the best deals in your inbox.
            </div>
          ) : (
            <div className="flex space-x-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              <button onClick={() => { if (email) { setSubscribed(true); toast.success('Subscribed successfully!'); } }}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm whitespace-nowrap">
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