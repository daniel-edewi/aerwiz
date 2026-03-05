import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFlightStore from '../store/flightStore';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plane, ArrowRight } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const formatPrice = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

const SeatSelectionPage = () => {
  const navigate = useNavigate();
  const { selectedFlight, searchParams } = useFlightStore();
  const [seatMap, setSeatMap] = useState([]);
  const [cols, setCols] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);

  const cabinClass = selectedFlight?.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY';

  useEffect(() => {
    if (!selectedFlight) { navigate('/'); return; }
    fetchSeatMap();
  }, []);

  const fetchSeatMap = async () => {
    try {
      const res = await axios.get(`${API_URL}/flights/seats?cabinClass=${cabinClass}`);
      setSeatMap(res.data.data.seatMap);
      setCols(res.data.data.cols);
    } catch (e) {
      toast.error('Failed to load seat map');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.occupied) return;
    setSelectedSeat(seat.id === selectedSeat?.id ? null : seat);
  };

  const handleContinue = () => {
    if (!selectedSeat) {
      toast.error('Please select a seat to continue');
      return;
    }
    navigate('/book', { state: { selectedSeat } });
  };

  const getSeatColor = (seat) => {
    if (seat.occupied) return 'bg-gray-300 cursor-not-allowed border-gray-400';
    if (selectedSeat?.id === seat.id) return 'bg-blue-600 border-blue-700 text-white cursor-pointer';
    if (seat.extraLegroom) return 'bg-green-100 border-green-400 text-green-800 cursor-pointer hover:bg-green-200';
    return 'bg-blue-50 border-blue-200 text-blue-800 cursor-pointer hover:bg-blue-100';
  };

  const segment = selectedFlight?.itineraries?.[0]?.segments?.[0];
  const lastSegment = selectedFlight?.itineraries?.[0]?.segments?.[selectedFlight.itineraries[0].segments.length - 1];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-700 text-white py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <Plane className="w-6 h-6" />
            <span className="text-xl font-bold">Aerwiz</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-200">
            <span className="uppercase font-bold">{segment?.departure?.iataCode}</span>
            <ArrowRight className="w-4 h-4" />
            <span className="uppercase font-bold">{lastSegment?.arrival?.iataCode}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Select Your Seat</h1>
        <p className="text-gray-500 mb-6">{cabinClass} class · {segment?.carrierCode}{segment?.number}</p>

        {/* Legend */}
        <div className="flex items-center space-x-6 mb-6 bg-white rounded-xl p-4 shadow-sm">
          {[
            { color: 'bg-blue-50 border border-blue-200', label: 'Available' },
            { color: 'bg-green-100 border border-green-400', label: 'Extra Legroom' },
            { color: 'bg-blue-600', label: 'Selected' },
            { color: 'bg-gray-300', label: 'Occupied' }
          ].map(item => (
            <div key={item.label} className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded ${item.color}`}></div>
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seat Map */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="overflow-auto">
                {/* Plane nose */}
                <div className="text-center mb-4">
                  <div className="inline-block bg-gray-100 rounded-t-full px-8 py-2 text-gray-500 text-sm font-medium">
                    ✈️ Front of Plane
                  </div>
                </div>

                {/* Column headers */}
                <div className="flex items-center mb-2 px-8">
                  <div className="w-8"></div>
                  {cols.map((col, i) => {
                    const isAisle = (cols.length === 6 && (i === 2)) || (cols.length === 4 && i === 1);
                    return (
                      <React.Fragment key={col}>
                        {isAisle && <div className="w-6"></div>}
                        <div className="w-8 text-center text-xs font-bold text-gray-400">{col}</div>
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Rows */}
                <div className="space-y-1 max-h-96 overflow-y-auto px-2">
                  {seatMap.map(({ row, seats }) => (
                    <div key={row} className="flex items-center">
                      <div className="w-8 text-xs text-gray-400 text-right pr-2 font-mono">{row}</div>
                      {seats.map((seat, i) => {
                        const isAisle = (cols.length === 6 && (i === 3)) || (cols.length === 4 && i === 2);
                        return (
                          <React.Fragment key={seat.id}>
                            {isAisle && <div className="w-6"></div>}
                            <div
                              onClick={() => handleSeatClick(seat)}
                              className={`w-8 h-7 rounded text-xs flex items-center justify-center border font-medium transition-all mx-0.5 ${getSeatColor(seat)}`}
                              title={seat.occupied ? 'Occupied' : `Seat ${seat.id}${seat.extraLegroom ? ' - Extra Legroom' : ''}`}
                            >
                              {seat.occupied ? '×' : selectedSeat?.id === seat.id ? '✓' : ''}
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected Seat Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h3 className="font-bold text-gray-800 mb-4">Your Selection</h3>

              {selectedSeat ? (
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-4xl font-bold text-blue-600">{selectedSeat.id}</p>
                    <p className="text-sm text-gray-500 mt-1">Seat Number</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Row</span>
                      <span className="font-medium">{selectedSeat.row}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Column</span>
                      <span className="font-medium">{selectedSeat.col}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type</span>
                      <span className="font-medium">{selectedSeat.extraLegroom ? '🟢 Extra Legroom' : 'Standard'}</span>
                    </div>
                    {selectedSeat.price > 0 && (
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-500">Seat Fee</span>
                        <span className="font-bold text-blue-600">+{formatPrice(selectedSeat.price)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">💺</div>
                  <p className="text-sm">Click a seat on the map to select it</p>
                </div>
              )}

              <div className="mt-6 space-y-2">
                <button onClick={handleContinue}
                  disabled={!selectedSeat}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Continue to Booking
                </button>
                <button onClick={() => navigate('/book')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2 rounded-lg text-sm transition-colors">
                  Skip Seat Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;