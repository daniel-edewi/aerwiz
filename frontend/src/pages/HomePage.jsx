import useAuthStore from '../store/authStore';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { flightsAPI } from '../services/api';
import useFlightStore from '../store/flightStore';
import toast from 'react-hot-toast';
import { Plane, Search, Calendar, Users, Plus, Trash2, ExternalLink } from 'lucide-react';
import AirportSearch from '../components/AirportSearch';

const TRIP_COM_AFFILIATE_ID = 'S13579379';
const TRIP_COM_ALLIANCE_ID = '7918030';
const TRIP_COM_SID = '297501611';

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { searchParams, setSearchParams, setSearchResults, setIsSearching, setMultiCityLeg, addMultiCityLeg, removeMultiCityLeg } = useFlightStore();
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
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

      <div className="text-center py-16 px-4">
        <h1 className="text-5xl font-bold text-white mb-4">Fly Anywhere, Anytime</h1>
        <p className="text-blue-100 text-xl mb-12">Search and book flights across the world at the best prices</p>

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

      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-white bg-opacity-10 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white text-xl font-bold">Can't find your flight?</h2>
              <p className="text-blue-100 text-sm mt-1">Search millions of flights worldwide on Trip.com</p>
            </div>
            <div className="bg-white rounded-xl px-3 py-1.5 flex-shrink-0">
              <span className="text-blue-600 font-bold text-sm">Trip.com</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { from: 'LOS', to: 'LHR', label: 'Lagos to London' },
              { from: 'LOS', to: 'DXB', label: 'Lagos to Dubai' },
              { from: 'LOS', to: 'JFK', label: 'Lagos to New York' },
              { from: 'ABV', to: 'DOH', label: 'Abuja to Doha' },
            ].map((route) => (
              <a key={route.label}
                href={'https://www.trip.com/flights/showfareflight?dcity=' + route.from + '&acity=' + route.to + '&Allianceid=' + TRIP_COM_ALLIANCE_ID + '&SID=' + TRIP_COM_SID + '&trip_sub1=aerwiz'}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white bg-opacity-15 hover:bg-opacity-25 transition-all rounded-xl p-3 text-center group">
                <p className="text-white text-xs font-medium truncate">{route.label}</p>
                <p className="text-blue-200 text-xs mt-1 group-hover:text-white">Search</p>
              </a>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <iframe
                src={'https://www.trip.com/partners/ad/' + TRIP_COM_AFFILIATE_ID + '?Allianceid=' + TRIP_COM_ALLIANCE_ID + '&SID=' + TRIP_COM_SID + '&trip_sub1=aerwiz'}
                style={{ width: '100%', height: '120px', border: 'none', borderRadius: '12px' }}
                scrolling="no"
                title="Trip.com Flights"
              />
            </div>
            <a href={'https://www.trip.com/flights/?Allianceid=' + TRIP_COM_ALLIANCE_ID + '&SID=' + TRIP_COM_SID + '&trip_sub1=aerwiz'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap flex-shrink-0">
              <span>Search on Trip.com</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
