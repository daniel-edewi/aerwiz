import React from 'react';
import { useNavigate } from 'react-router-dom';
import useFlightStore from '../store/flightStore';
import { Plane, Clock, ArrowRight } from 'lucide-react';

const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const formatDuration = (dur) => dur.replace('PT', '').replace('H', 'h ').replace('M', 'm');
const formatPrice = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

const FlightsPage = () => {
  const navigate = useNavigate();
  const { searchResults, searchParams, setSelectedFlight } = useFlightStore();

  if (!searchResults.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">No flights found</h2>
          <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2 rounded-lg mt-4">Search Again</button>
        </div>
      </div>
    );
  }

  const handleSelectFlight = (flight) => {
    setSelectedFlight(flight);
    navigate('/book');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-700 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-2xl font-bold">
              <span>{searchParams.origin}</span>
              <ArrowRight className="w-6 h-6" />
              <span>{searchParams.destination}</span>
            </div>
            <p className="text-blue-200 mt-1">{searchParams.departureDate} · {searchParams.adults} Adult · {searchParams.cabinClass}</p>
          </div>
          <button onClick={() => navigate('/')} className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium">Modify Search</button>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <p className="text-gray-600 mb-4">{searchResults.length} flights found</p>

        <div className="space-y-4">
          {searchResults.map((flight) => {
            const segment = flight.itineraries[0].segments[0];
            const lastSegment = flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1];
            const stops = flight.itineraries[0].segments.length - 1;
            const duration = flight.itineraries[0].duration;

            return (
              <div key={flight.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    {/* Airline */}
                    <div className="text-center w-16">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                        <span className="text-blue-700 font-bold text-sm">{segment.carrierCode}</span>
                      </div>
                      <p className="text-xs text-gray-500">{segment.carrierCode}{segment.number}</p>
                    </div>

                    {/* Flight Times */}
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800">{formatTime(segment.departure.at)}</p>
                        <p className="text-sm text-gray-500">{segment.departure.iataCode}</p>
                      </div>

                      <div className="text-center px-4">
                        <div className="flex items-center space-x-1 text-gray-400 mb-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">{formatDuration(duration)}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-px w-16 bg-gray-300"></div>
                          <Plane className="w-4 h-4 text-blue-500 mx-1" />
                          <div className="h-px w-16 bg-gray-300"></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}</p>
                      </div>

                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800">{formatTime(lastSegment.arrival.at)}</p>
                        <p className="text-sm text-gray-500">{lastSegment.arrival.iataCode}</p>
                      </div>
                    </div>
                  </div>

                  {/* Price & Book */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{formatPrice(flight.price.grandTotal)}</p>
                    <p className="text-xs text-gray-400 mb-3">per person</p>
                    <button
                      onClick={() => handleSelectFlight(flight)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Select
                    </button>
                  </div>
                </div>

                {/* Baggage info */}
                <div className="mt-4 pt-4 border-t border-gray-50 flex space-x-4 text-xs text-gray-500">
                  <span>✓ {flight.travelerPricings[0].fareDetailsBySegment[0].cabin}</span>
                  {flight.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags && (
                    <span>✓ {flight.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.quantity} checked bag included</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FlightsPage;