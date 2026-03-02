import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI, paymentsAPI } from '../services/api';
import useFlightStore from '../store/flightStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Plane } from 'lucide-react';

const formatPrice = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const BookingPage = () => {
  const navigate = useNavigate();
  const { selectedFlight } = useFlightStore();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [passenger, setPassenger] = useState({
    type: 'ADULT',
    title: 'MR',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: 'NG',
    passportNumber: '',
    passportExpiry: '',
    email: '',
    phone: ''
  });

  if (!selectedFlight) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
      const authorizationUrl = paymentResponse.data.data.authorizationUrl;
      window.location.href = authorizationUrl;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-700 text-white py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-2">
          <Plane className="w-6 h-6" />
          <span className="text-xl font-bold">Aerwiz</span>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Booking</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Passenger Details</h2>
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <select value={passenger.title} onChange={(e) => setPassenger({ ...passenger, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none">
                      <option value="MR">Mr</option>
                      <option value="MRS">Mrs</option>
                      <option value="MS">Ms</option>
                      <option value="DR">Dr</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                    <input type="text" value={passenger.nationality} onChange={(e) => setPassenger({ ...passenger, nationality: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none" maxLength={2} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input type="text" value={passenger.firstName} onChange={(e) => setPassenger({ ...passenger, firstName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input type="text" value={passenger.lastName} onChange={(e) => setPassenger({ ...passenger, lastName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input type="date" value={passenger.dateOfBirth} onChange={(e) => setPassenger({ ...passenger, dateOfBirth: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                    <input type="text" value={passenger.passportNumber} onChange={(e) => setPassenger({ ...passenger, passportNumber: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={passenger.email} onChange={(e) => setPassenger({ ...passenger, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" value={passenger.phone} onChange={(e) => setPassenger({ ...passenger, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passport Expiry</label>
                  <input type="date" value={passenger.passportExpiry} onChange={(e) => setPassenger({ ...passenger, passportExpiry: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:opacity-50">
                  {loading ? 'Processing...' : 'Pay Now'}
                </button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
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