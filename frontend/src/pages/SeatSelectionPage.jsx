import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFlightStore from '../store/flightStore';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plane, ArrowRight, Clock, Info } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'https://aerwiz-production.up.railway.app/api';
const formatPrice = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const formatDuration = (dur) => dur?.replace('PT', '').replace('H', 'h ').replace('M', 'm') || '';

const AIRLINE_NAMES = {
  AT: 'Royal Air Maroc', KQ: 'Kenya Airways', MS: 'EgyptAir',
  ET: 'Ethiopian Airlines', EK: 'Emirates', QR: 'Qatar Airways',
  LH: 'Lufthansa', AF: 'Air France', KL: 'KLM', WB: 'RwandAir',
  BA: 'British Airways', TK: 'Turkish Airlines', DL: 'Delta',
  UA: 'United Airlines', AA: 'American Airlines', TC: 'Air Tanzania'
};

// Aircraft image mapping by IATA aircraft code
const AIRCRAFT_IMAGES = {
  '77W': 'https://www.gstatic.com/flights/airline_logos/70px/QR.png',
  '77L': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Boeing_777-300ER_Emirates.jpg/640px-Boeing_777-300ER_Emirates.jpg',
  '789': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Boeing_787_Ethiopian_Airlines.jpg/640px-Boeing_787_Ethiopian_Airlines.jpg',
  '788': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Boeing_787_Ethiopian_Airlines.jpg/640px-Boeing_787_Ethiopian_Airlines.jpg',
  '333': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Airbus_A330-300_Air_France.jpg/640px-Airbus_A330-300_Air_France.jpg',
  '332': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Airbus_A330-300_Air_France.jpg/640px-Airbus_A330-300_Air_France.jpg',
  '359': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Airbus_A350-900_Qatar_Airways.jpg/640px-Airbus_A350-900_Qatar_Airways.jpg',
  '351': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Airbus_A350-900_Qatar_Airways.jpg/640px-Airbus_A350-900_Qatar_Airways.jpg',
  '738': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Boeing_737-800_Kenya_Airways.jpg/640px-Boeing_737-800_Kenya_Airways.jpg',
  '73H': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Boeing_737-800_Kenya_Airways.jpg/640px-Boeing_737-800_Kenya_Airways.jpg',
  '320': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Airbus_A320_Lufthansa.jpg/640px-Airbus_A320_Lufthansa.jpg',
  '321': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Airbus_A320_Lufthansa.jpg/640px-Airbus_A320_Lufthansa.jpg',
  '319': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Airbus_A320_Lufthansa.jpg/640px-Airbus_A320_Lufthansa.jpg',
  'DEFAULT': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Boeing_787_Ethiopian_Airlines.jpg/640px-Boeing_787_Ethiopian_Airlines.jpg'
};

const AIRCRAFT_NAMES = {
  '77W': 'Boeing 777-300ER', '77L': 'Boeing 777-200LR',
  '789': 'Boeing 787-9 Dreamliner', '788': 'Boeing 787-8 Dreamliner',
  '333': 'Airbus A330-300', '332': 'Airbus A330-200',
  '359': 'Airbus A350-900', '351': 'Airbus A350-1000',
  '738': 'Boeing 737-800', '73H': 'Boeing 737-800',
  '320': 'Airbus A320', '321': 'Airbus A321', '319': 'Airbus A319',
  '744': 'Boeing 747-400', '748': 'Boeing 747-8',
  '380': 'Airbus A380', '388': 'Airbus A380-800',
};

const SeatSelectionPage = () => {
  const navigate = useNavigate();
  const { selectedFlight } = useFlightStore();
  const [seatMap, setSeatMap] = useState([]);
  const [cols, setCols] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAircraftInfo, setShowAircraftInfo] = useState(false);

  const cabinClass = selectedFlight?.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY';
  const segment = selectedFlight?.itineraries?.[0]?.segments?.[0];
  const lastSegment = selectedFlight?.itineraries?.[0]?.segments?.[selectedFlight.itineraries[0].segments.length - 1];
  const aircraftCode = segment?.aircraft?.code || 'DEFAULT';
  const aircraftName = AIRCRAFT_NAMES[aircraftCode] || `Aircraft ${aircraftCode}`;
  const aircraftImage = AIRCRAFT_IMAGES[aircraftCode] || AIRCRAFT_IMAGES['DEFAULT'];
  const duration = selectedFlight?.itineraries?.[0]?.duration;
  const stops = (selectedFlight?.itineraries?.[0]?.segments?.length || 1) - 1;

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
    if (seat.occupied) return 'bg-gray-300 cursor-not-allowed border-gray-400 text-gray-500';
    if (selectedSeat?.id === seat.id) return 'bg-blue-600 border-blue-700 text-white cursor-pointer shadow-md scale-110';
    if (seat.extraLegroom) return 'bg-green-100 border-green-400 text-green-800 cursor-pointer hover:bg-green-200';
    return 'bg-blue-50 border-blue-200 text-blue-800 cursor-pointer hover:bg-blue-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-700 text-white py-3 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <Plane className="w-5 h-5" />
            <span className="text-lg font-bold">Aerwiz</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-200 text-sm">
            <span className="font-bold text-white">{segment?.departure?.iataCode}</span>
            <ArrowRight className="w-4 h-4" />
            <span className="font-bold text-white">{lastSegment?.arrival?.iataCode}</span>
            <span className="text-blue-300">·</span>
            <span>{formatDuration(duration)}</span>
            {stops > 0 && <span className="text-orange-300">· {stops} stop{stops > 1 ? 's' : ''}</span>}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center space-x-2 text-xs sm:text-sm">
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">✓ 1. Passenger Details</span>
          <span className="text-gray-400">→</span>
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full font-medium">2. Seat Selection</span>
          <span className="text-gray-400">→</span>
          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full">3. Payment</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Aircraft Banner */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="relative h-40 sm:h-56">
            <img
              src={aircraftImage}
              alt={aircraftName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-300 uppercase tracking-wide">Aircraft</p>
                  <p className="text-lg font-bold">{aircraftName}</p>
                  <p className="text-sm text-gray-300">
                    {AIRLINE_NAMES[segment?.carrierCode] || segment?.carrierCode} · {segment?.carrierCode}{segment?.number} · {cabinClass}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-300">{formatTime(segment?.departure?.at)}</p>
                  <div className="flex items-center space-x-1 text-gray-300 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(duration)}</span>
                  </div>
                  <p className="text-xs text-gray-300">{formatTime(lastSegment?.arrival?.at)}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAircraftInfo(!showAircraftInfo)}
              className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 backdrop-blur-sm">
              <Info className="w-4 h-4" />
            </button>
          </div>
          {showAircraftInfo && (
            <div className="px-4 py-3 bg-blue-50 border-t border-blue-100 text-xs text-gray-600 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-gray-400">Aircraft Code</p>
                <p className="font-bold">{aircraftCode}</p>
              </div>
              <div>
                <p className="text-gray-400">Cabin Class</p>
                <p className="font-bold">{cabinClass}</p>
              </div>
              <div>
                <p className="text-gray-400">Departure Terminal</p>
                <p className="font-bold">{segment?.departure?.terminal ? `Terminal ${segment.departure.terminal}` : 'TBC'}</p>
              </div>
              <div>
                <p className="text-gray-400">Arrival Terminal</p>
                <p className="font-bold">{lastSegment?.arrival?.terminal ? `Terminal ${lastSegment.arrival.terminal}` : 'TBC'}</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seat Map */}
          <div className="lg:col-span-2 space-y-4">
            {/* Legend */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm font-bold text-gray-700 mb-3">Seat Legend</p>
              <div className="flex flex-wrap items-center gap-4">
                {[
                  { color: 'bg-blue-50 border border-blue-200', label: 'Available' },
                  { color: 'bg-green-100 border border-green-400', label: 'Extra Legroom' },
                  { color: 'bg-blue-600', label: 'Selected' },
                  { color: 'bg-gray-300', label: 'Occupied' }
                ].map(item => (
                  <div key={item.label} className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded ${item.color}`}></div>
                    <span className="text-xs text-gray-600">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Seat Map */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <p className="text-sm font-bold text-gray-700 mb-4">Select Your Seat</p>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="overflow-auto">
                  {/* Plane nose */}
                  <div className="text-center mb-6">
                    <div className="inline-flex flex-col items-center">
                      <div className="w-12 h-12 bg-blue-600 rounded-t-full flex items-center justify-center">
                        <Plane className="w-6 h-6 text-white transform -rotate-90" />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Front</p>
                    </div>
                  </div>

                  {/* Column headers */}
                  <div className="flex items-center mb-2 justify-center">
                    <div className="w-8"></div>
                    {cols.map((col, i) => {
                      const isAisle = (cols.length === 6 && i === 2) || (cols.length === 4 && i === 1);
                      return (
                        <React.Fragment key={col}>
                          {isAisle && <div className="w-6"></div>}
                          <div className="w-8 text-center text-xs font-bold text-gray-400">{col}</div>
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Rows */}
                  <div className="space-y-1 max-h-[420px] overflow-y-auto px-2">
                    {seatMap.map(({ row, seats }) => (
                      <div key={row} className="flex items-center justify-center">
                        <div className="w-8 text-xs text-gray-400 text-right pr-2 font-mono">{row}</div>
                        {seats.map((seat, i) => {
                          const isAisle = (cols.length === 6 && i === 3) || (cols.length === 4 && i === 2);
                          return (
                            <React.Fragment key={seat.id}>
                              {isAisle && <div className="w-6 text-center text-xs text-gray-200">|</div>}
                              <div
                                onClick={() => handleSeatClick(seat)}
                                className={`w-8 h-7 rounded-t-lg text-xs flex items-center justify-center border font-medium transition-all mx-0.5 ${getSeatColor(seat)}`}
                                title={seat.occupied ? 'Occupied' : `Seat ${seat.id}${seat.extraLegroom ? ' - Extra Legroom' : ''}`}
                              >
                                {seat.occupied ? '×' : selectedSeat?.id === seat.id ? '✓' : ''}
                              </div>
                            </React.Fragment>
                          );
                        })}
                        <div className="w-8 text-xs text-gray-400 text-left pl-2 font-mono">{row}</div>
                      </div>
                    ))}
                  </div>

                  {/* Plane tail */}
                  <div className="text-center mt-6">
                    <p className="text-xs text-gray-400 mb-1">Rear</p>
                    <div className="w-12 h-8 bg-gray-200 rounded-b-full mx-auto"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4 space-y-4">
              <h3 className="font-bold text-gray-800">Your Selection</h3>

              {selectedSeat ? (
                <div className="space-y-3">
                  <div className="bg-blue-600 rounded-xl p-4 text-center text-white">
                    <p className="text-4xl font-bold">{selectedSeat.id}</p>
                    <p className="text-sm text-blue-200 mt-1">Selected Seat</p>
                  </div>
                  <div className="space-y-2 text-sm border rounded-lg p-3">
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
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cabin</span>
                      <span className="font-medium">{cabinClass}</span>
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
                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <div className="text-5xl mb-3">💺</div>
                  <p className="text-sm font-medium text-gray-500">No seat selected</p>
                  <p className="text-xs text-gray-400 mt-1">Click a seat on the map</p>
                </div>
              )}

              {/* Flight Quick Info */}
              <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
                <div className="flex justify-between text-gray-500">
                  <span>Flight</span>
                  <span className="font-medium text-gray-700">{segment?.carrierCode}{segment?.number}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Aircraft</span>
                  <span className="font-medium text-gray-700">{aircraftName}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Duration</span>
                  <span className="font-medium text-gray-700">{formatDuration(duration)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleContinue}
                  disabled={!selectedSeat}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Continue to Payment →
                </button>
                <button
                  onClick={() => navigate('/book')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2.5 rounded-xl text-sm transition-colors">
                  ← Back to Details
                </button>
                <button
                  onClick={() => navigate('/book')}
                  className="w-full text-gray-400 hover:text-gray-600 text-xs py-1 transition-colors">
                  Skip seat selection
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