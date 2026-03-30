import useAuthStore from '../store/authStore';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { flightsAPI } from '../services/api';
import useFlightStore from '../store/flightStore';
import toast from 'react-hot-toast';
import { Plane, Search, Calendar, Users, Plus, Trash2, FileSearch } from 'lucide-react';
import AirportSearch from '../components/AirportSearch';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://aerwiz-production.up.railway.app/api';

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { searchParams, setSearchParams, setSearchResults, setIsSearching, setMultiCityLeg, addMultiCityLeg, removeMultiCityLeg } = useFlightStore();
  const [loading, setLoading] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [lastName, setLastName] = useState('');
  const [manageLoading, setManageLoading] = useState(false);
  const [foundBooking, setFoundBooking] = useState(null);

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

  const handleManageBooking = async (e) => {
    e.preventDefault();
    if (!bookingRef.trim() || !lastName.trim()) {
      return toast.error('Please enter your booking reference and last name');
    }
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

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-NG', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });

  const formatPrice = (amount) => new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', maximumFractionDigits: 0
  }).format(amount);

  const STATUS_COLORS = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PAYMENT_PENDING: 'bg-orange-100 text-orange-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    COMPLETED: 'bg-blue-100 text-blue-700',
    FAILED: 'bg-red-100 text-red-700'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-2">
          <Plane className="text-white w-8 h-8" />
          <span className="text-white text-2xl font-bold">Aerwiz</span>
        </div>
        <div className="flex space-x-4">
          {isAuthenticated ? (
            <button onClick={() => navigate('/dashboard')} className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-50">My Account</button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="text-white hover:text-blue-200 font-medium">Login</button>
              <button onClick={() => navigate('/register')} className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-50">Sign Up</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="text-center py-16 px-4">
        <h1 className="text-5xl font-bold text-white mb-4">Fly Anywhere, Anytime</h1>
        <p className="text-blue-100 text-xl mb-12">Search and book flights across the world at the best prices</p>

        {/* Search Form */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
          <div className="flex space-x-4 mb-6">
            {['ONE_WAY', 'ROUND_TRIP', 'MULTI_CITY'].map((type) => (
              <button key={type} onClick={() => setSearchParams({ tripType: type })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${searchParams.tripType === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
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
                      <AirportSearch label="From" value={leg.origin}
                        onChange={(code) => setMultiCityLeg(index, { origin: code })} placeholder="City or airport" />
                      <AirportSearch label="To" value={leg.destination}
                        onChange={(code) => setMultiCityLeg(index, { destination: code })} placeholder="City or airport" />
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
                      <select value={searchParams.adults} onChange={(e) => setSearchParams({ adults: parseInt(e.target.value) })}
                        className="w-full outline-none text-gray-700">
                        {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cabin Class</label>
                    <select value={searchParams.cabinClass} onChange={(e) => setSearchParams({ cabinClass: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none text-gray-700">
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
                <AirportSearch label="From" value={searchParams.origin}
                  onChange={(code) => setSearchParams({ origin: code })} placeholder="City or airport e.g. Lagos" />
                <AirportSearch label="To" value={searchParams.destination}
                  onChange={(code) => setSearchParams({ destination: code })} placeholder="City or airport e.g. London" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
                  <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <input type="date" value={searchParams.departureDate}
                      onChange={(e) => setSearchParams({ departureDate: e.target.value })}
                      className="w-full outline-none text-gray-700"
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
                        className="w-full outline-none text-gray-700"
                        min={searchParams.departureDate || new Date().toISOString().split('T')[0]} />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
                  <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                    <Users className="w-4 h-4 text-gray-400 mr-2" />
                    <select value={searchParams.adults} onChange={(e) => setSearchParams({ adults: parseInt(e.target.value) })}
                      className="w-full outline-none text-gray-700">
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cabin Class</label>
                  <select value={searchParams.cabinClass} onChange={(e) => setSearchParams({ cabinClass: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none text-gray-700">
                    <option value="ECONOMY">Economy</option>
                    <option value="PREMIUM_ECONOMY">Premium Economy</option>
                    <option value="BUSINESS">Business</option>
                    <option value="FIRST">First Class</option>
                  </select>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50">
              <Search className="w-5 h-5" />
              <span>{loading ? 'Searching...' : 'Search Flights'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-4 pb-8 grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        {[
          { title: 'Best Prices', desc: 'Compare hundreds of airlines to find the lowest fares', icon: '💰' },
          { title: 'Easy Booking', desc: 'Book your flight in minutes with our simple process', icon: '✈️' },
          { title: 'Pay in Naira', desc: 'Pay securely with Paystack in NGN', icon: '🇳🇬' },
          { title: 'Baggage Calculator', desc: 'Estimate baggage fees before you fly', icon: '🧳', link: '/baggage' }
        ].map((f) => (
          <div key={f.title}
            onClick={() => f.link && navigate(f.link)}
            className={`bg-white bg-opacity-10 rounded-xl p-6 text-center text-white ${f.link ? 'cursor-pointer hover:bg-opacity-20 transition-all' : ''}`}>
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-blue-100 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Manage My Booking */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-white bg-opacity-10 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <FileSearch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">Manage My Booking</h2>
              <p className="text-blue-200 text-sm">Retrieve your booking using your reference number</p>
            </div>
          </div>

          <form onSubmit={handleManageBooking} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-blue-200 text-xs font-medium mb-1">Booking Reference</label>
              <input
                type="text"
                value={bookingRef}
                onChange={(e) => setBookingRef(e.target.value.toUpperCase())}
                placeholder="e.g. AWZ1A2B3C"
                className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-blue-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-sm uppercase tracking-widest"
              />
            </div>
            <div>
              <label className="block text-blue-200 text-xs font-medium mb-1">Passenger Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Edewi"
                className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-blue-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={manageLoading}
                className="w-full bg-white text-blue-700 font-bold py-2.5 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2">
                <Search className="w-4 h-4" />
                <span>{manageLoading ? 'Searching...' : 'Find Booking'}</span>
              </button>
            </div>
          </form>

          {/* Found Booking Result */}
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
                <div>
                  <p className="text-xs text-gray-400">Route</p>
                  <p className="font-bold text-gray-800">{foundBooking.origin} → {foundBooking.destination}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Departure</p>
                  <p className="font-medium text-gray-700 text-sm">{formatDate(foundBooking.departureDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Flight</p>
                  <p className="font-medium text-gray-700 text-sm">{foundBooking.flightNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Paid</p>
                  <p className="font-bold text-blue-600">{formatPrice(foundBooking.totalAmount)}</p>
                </div>
              </div>

              {foundBooking.passengers && foundBooking.passengers.length > 0 && (
                <div className="border-t pt-3 mb-4">
                  <p className="text-xs text-gray-400 mb-2">Passengers</p>
                  <div className="space-y-1">
                    {foundBooking.passengers.map((p, i) => (
                      <p key={i} className="text-sm text-gray-700 font-medium">
                        {p.title} {p.firstName} {p.lastName}
                        <span className="text-xs text-gray-400 ml-2">{p.type}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {foundBooking.status === 'PENDING' && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Complete Payment
                  </button>
                )}
                {['CONFIRMED', 'PAYMENT_PENDING'].includes(foundBooking.status) && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                    View Full Booking
                  </button>
                )}
                <button
                  onClick={() => { setFoundBooking(null); setBookingRef(''); setLastName(''); }}
                  className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default HomePage;