import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { flightsAPI } from '../services/api';
import useFlightStore from '../store/flightStore';
import toast from 'react-hot-toast';
import { Plane, Search, Calendar, Users } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { searchParams, setSearchParams, setSearchResults, setIsSearching } = useFlightStore();
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchParams.origin || !searchParams.destination || !searchParams.departureDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setIsSearching(true);

    try {
      const response = await flightsAPI.search({
        origin: searchParams.origin.toUpperCase(),
        destination: searchParams.destination.toUpperCase(),
        departureDate: searchParams.departureDate,
        adults: searchParams.adults,
        cabinClass: searchParams.cabinClass
      });
      setSearchResults(response.data.data);
      navigate('/flights');
    } catch (error) {
      toast.error('No flights found. Please try different dates or destinations.');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
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
          <button onClick={() => navigate('/login')} className="text-white hover:text-blue-200 font-medium">Login</button>
          <button onClick={() => navigate('/register')} className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-50">Sign Up</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="text-center py-16 px-4">
        <h1 className="text-5xl font-bold text-white mb-4">Fly Anywhere, Anytime</h1>
        <p className="text-blue-100 text-xl mb-12">Search and book flights across the world at the best prices</p>

        {/* Search Form */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
          {/* Trip Type */}
          <div className="flex space-x-4 mb-6">
            {['ONE_WAY', 'ROUND_TRIP'].map((type) => (
              <button
                key={type}
                onClick={() => setSearchParams({ tripType: type })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  searchParams.tripType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type === 'ONE_WAY' ? 'One Way' : 'Round Trip'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Origin */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                  <Plane className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="e.g. LOS"
                    value={searchParams.origin}
                    onChange={(e) => setSearchParams({ origin: e.target.value })}
                    className="w-full outline-none text-gray-700 uppercase"
                    maxLength={3}
                  />
                </div>
              </div>

              {/* Destination */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                  <Plane className="w-4 h-4 text-gray-400 mr-2 rotate-90" />
                  <input
                    type="text"
                    placeholder="e.g. LHR"
                    value={searchParams.destination}
                    onChange={(e) => setSearchParams({ destination: e.target.value })}
                    className="w-full outline-none text-gray-700 uppercase"
                    maxLength={3}
                  />
                </div>
              </div>

              {/* Departure Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type="date"
                    value={searchParams.departureDate}
                    onChange={(e) => setSearchParams({ departureDate: e.target.value })}
                    className="w-full outline-none text-gray-700"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Passengers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                  <Users className="w-4 h-4 text-gray-400 mr-2" />
                  <select
                    value={searchParams.adults}
                    onChange={(e) => setSearchParams({ adults: parseInt(e.target.value) })}
                    className="w-full outline-none text-gray-700"
                  >
                    {[1,2,3,4,5,6].map(n => (
                      <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Cabin Class */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cabin Class</label>
              <select
                value={searchParams.cabinClass}
                onChange={(e) => setSearchParams({ cabinClass: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 outline-none text-gray-700"
              >
                <option value="ECONOMY">Economy</option>
                <option value="PREMIUM_ECONOMY">Premium Economy</option>
                <option value="BUSINESS">Business</option>
                <option value="FIRST">First Class</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Search className="w-5 h-5" />
              <span>{loading ? 'Searching...' : 'Search Flights'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-4 pb-16 grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {[
          { title: 'Best Prices', desc: 'Compare hundreds of airlines to find the lowest fares', icon: '💰' },
          { title: 'Easy Booking', desc: 'Book your flight in minutes with our simple process', icon: '✈️' },
          { title: 'Pay in Naira', desc: 'Pay securely with Paystack in NGN', icon: '🇳🇬' }
        ].map((f) => (
          <div key={f.title} className="bg-white bg-opacity-10 rounded-xl p-6 text-center text-white">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-blue-100 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;