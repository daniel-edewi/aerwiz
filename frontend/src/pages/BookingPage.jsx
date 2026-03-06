import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { bookingsAPI, paymentsAPI } from '../services/api';
import useFlightStore from '../store/flightStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Plane, ChevronDown } from 'lucide-react';

const formatPrice = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedFlight } = useFlightStore();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const selectedSeat = location.state?.selectedSeat;

  const [passenger, setPassenger] = useState({
    type: 'ADULT', title: 'MR', firstName: '', lastName: '',
    dateOfBirth: '', nationality: 'NG', passportNumber: '',
    passportExpiry: '', email: '', phone: '',
    seatNumber: selectedSeat?.id || ''
  });

  if (!selectedFlight) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">No flight selected</h2>
          <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Search Flights</button>
        </div>
      </div>
    );
  }

  const segment = selectedFlight.itineraries[0].segments[0];
  const lastSegment = selectedFlight.itineraries[0].segments[selectedFlight.itineraries[0].segments.length - 1];

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to book a flight');
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const bookingResponse = await bookingsAPI.create({
        flightOffer: selectedFlight,
        contactEmail: passenger.email,
        contactPhone: passenger.phone,
        passengers: [passenger]
      });
      const booking = bookingResponse.data.data;
      toast.success('Booking created! Redirecting to payment...');
      const paymentResponse = await paymentsAPI.initialize(booking.id);
      window.location.href = paymentResponse.data.data.authorizationUrl;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-700 text-white py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <Plane className="w-5 h-5" />
            <span className="text-lg font-bold">Aerwiz</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-200 text-sm">
            <span className="font-bold text-white">{segment.departure.iataCode}</span>
            <span>→</span>
            <span className="font-bold text-white">{lastSegment.arrival.iataCode}</span>
          </div>
        </div>
      </div>

      {/* Mobile Flight Summary Toggle */}
      <div className="lg:hidden bg-white border-b border-gray-200">
        <button onClick={() => setShowSummary(!showSummary)}
          className="w-full flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Flight Summary</span>
            <span className="font-bold text-blue-600 text-sm">{formatPrice(selectedFlight.price.grandTotal)}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showSummary ? 'rotate-180' : ''}`} />
        </button>
        {showSummary && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-center">
                <p className="text-lg font-bold">{formatTime(segment.departure.at)}</p>
                <p className="text-gray-500 text-xs">{segment.departure.iataCode}</p>
              </div>
              <Plane className="w-4 h-4 text-blue-500 mx-2" />
              <div className="text-center">
                <p className="text-lg font-bold">{formatTime(lastSegment.arrival.at)}</p>
                <p className="text-gray-500 text-xs">{lastSegment.arrival.iataCode}</p>
              </div>
            </div>
            <div className="space-y-1 text-sm border-t pt-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Base fare</span>
                <span>{formatPrice(selectedFlight.price.base)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Taxes and fees</span>
                <span>{formatPrice(parseFloat(selectedFlight.price.grandTotal) - parseFloat(selectedFlight.price.base))}</span>
              </div>
              <div className="flex justify-between font-bold text-blue-600 pt-1 border-t">
                <span>Total</span>
                <span>{formatPrice(selectedFlight.price.grandTotal)}</span>
              </div>
            </div>
            {selectedSeat && (
              <div className="mt-2 bg-blue-50 rounded-lg px-3 py-2 text-sm">
                <span className="text-gray-500">Seat: </span>
                <span className="font-bold text-blue-600">{selectedSeat.id}</span>
                {selectedSeat.extraLegroom && <span className="ml-2 text-green-600 text-xs">Extra Legroom</span>}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Complete Your Booking</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Passenger Details</h2>
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Title">
                    <select value={passenger.title} onChange={(e) => setPassenger({ ...passenger, title: e.target.value })} className={inputClass}>
                      <option value="MR">Mr</option>
                      <option value="MRS">Mrs</option>
                      <option value="MS">Ms</option>
                      <option value="DR">Dr</option>
                    </select>
                  </Field>
                  <Field label="Nationality">
                    <input type="text" value={passenger.nationality} onChange={(e) => setPassenger({ ...passenger, nationality: e.target.value })} className={inputClass} maxLength={2} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="First Name">
                    <input type="text" value={passenger.firstName} onChange={(e) => setPassenger({ ...passenger, firstName: e.target.value })} className={inputClass} required />
                  </Field>
                  <Field label="Last Name">
                    <input type="text" value={passenger.lastName} onChange={(e) => setPassenger({ ...passenger, lastName: e.target.value })} className={inputClass} required />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Date of Birth">
                    <input type="date" value={passenger.dateOfBirth} onChange={(e) => setPassenger({ ...passenger, dateOfBirth: e.target.value })} className={inputClass} required />
                  </Field>
                  <Field label="Passport Number">
                    <input type="text" value={passenger.passportNumber} onChange={(e) => setPassenger({ ...passenger, passportNumber: e.target.value })} className={inputClass} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Email">
                    <input type="email" value={passenger.email} onChange={(e) => setPassenger({ ...passenger, email: e.target.value })} className={inputClass} required />
                  </Field>
                  <Field label="Phone">
                    <input type="tel" value={passenger.phone} onChange={(e) => setPassenger({ ...passenger, phone: e.target.value })} className={inputClass} required />
                  </Field>
                </div>
                <Field label="Passport Expiry">
                  <input type="date" value={passenger.passportExpiry} onChange={(e) => setPassenger({ ...passenger, passportExpiry: e.target.value })} className={`${inputClass} max-w-xs`} />
                </Field>

                {selectedSeat && (
                  <div className="bg-blue-50 rounded-lg px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Selected Seat</span>
                    <span className="font-bold text-blue-600">{selectedSeat.id} {selectedSeat.extraLegroom ? '🟢' : ''}</span>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg disabled:opacity-50 text-base transition-colors">
                  {loading ? 'Processing...' : `Pay ${formatPrice(selectedFlight.price.grandTotal)}`}
                </button>
              </form>
            </div>
          </div>

          {/* Desktop Flight Summary */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Flight Summary</h2>
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <p className="text-xl font-bold">{formatTime(segment.departure.at)}</p>
                  <p className="text-gray-500 text-sm">{segment.departure.iataCode}</p>
                </div>
                <Plane className="w-4 h-4 text-blue-500 mx-2" />
                <div className="text-center">
                  <p className="text-xl font-bold">{formatTime(lastSegment.arrival.at)}</p>
                  <p className="text-gray-500 text-sm">{lastSegment.arrival.iataCode}</p>
                </div>
              </div>
              {selectedSeat && (
                <div className="bg-blue-50 rounded-lg px-3 py-2 mb-4 text-sm">
                  <span className="text-gray-500">Seat: </span>
                  <span className="font-bold text-blue-600">{selectedSeat.id}</span>
                  {selectedSeat.extraLegroom && <span className="ml-2 text-green-600 text-xs">Extra Legroom</span>}
                </div>
              )}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Base fare</span>
                  <span>{formatPrice(selectedFlight.price.base)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Taxes and fees</span>
                  <span>{formatPrice(parseFloat(selectedFlight.price.grandTotal) - parseFloat(selectedFlight.price.base))}</span>
                </div>
                <div className="flex justify-between font-bold text-blue-600 pt-2 border-t">
                  <span>Total</span>
                  <span>{formatPrice(selectedFlight.price.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;