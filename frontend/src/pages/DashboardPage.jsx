import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, bookingsAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Plane, User, LogOut, Calendar, CreditCard, MapPin, Clock } from 'lucide-react';

const formatPrice = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAYMENT_PENDING: 'bg-orange-100 text-orange-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700'
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingsAPI.getAll();
      setBookings(response.data.data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await authAPI.updateProfile(profileForm);
      updateUser(response.data.data);
      toast.success('Profile updated!');
      setEditMode(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const totalSpent = bookings.filter(b => b.status !== 'CANCELLED').reduce((sum, b) => sum + b.totalAmount, 0);
  const confirmedTrips = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-700 text-white py-4 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <Plane className="w-6 h-6" />
            <span className="text-xl font-bold">Aerwiz</span>
          </div>
          <button onClick={handleLogout} className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-800 px-3 py-2 rounded-lg text-sm">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-1 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h2>
            <p className="text-blue-200 text-sm mt-1">{user?.email}</p>
            {user?.phone && <p className="text-blue-200 text-sm">{user?.phone}</p>}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Plane className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{confirmedTrips}</p>
              <p className="text-gray-500 text-sm">Confirmed Trips</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{formatPrice(totalSpent)}</p>
              <p className="text-gray-500 text-sm">Total Spent</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          {['bookings', 'profile'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 font-medium text-sm capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab === 'bookings' ? 'My Bookings' : 'Profile Settings'}
            </button>
          ))}
          <button onClick={() => navigate('/alerts')}
            className="pb-3 px-1 font-medium text-sm text-gray-500 hover:text-gray-700">
            🔔 Price Alerts
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Loading your bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <Plane className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">No bookings yet</h3>
                <p className="text-gray-400 mb-6">Start exploring and book your first flight!</p>
                <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">Search Flights</button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => (
                  <div key={booking.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Plane className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 font-bold text-gray-800">
                            <span>{booking.origin}</span>
                            <span>→</span>
                            <span>{booking.destination}</span>
                          </div>
                          <p className="text-xs text-gray-400">Ref: {booking.bookingReference}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(booking.departureDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.airline} · {booking.flightNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{booking.cabinClass}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <p className="font-bold text-blue-600 text-lg">{formatPrice(booking.totalAmount)}</p>
                      <div className="flex space-x-2">
                        {booking.status === 'PENDING' && (
                          <button onClick={async () => {
                            try {
                              const { paymentsAPI } = await import('../services/api');
                              const res = await paymentsAPI.initialize(booking.id);
                              window.location.href = res.data.data.authorizationUrl;
                            } catch (e) {
                              toast.error('Payment error');
                            }
                          }} className="bg-blue-600 text-white px-4 py-1 rounded-lg text-sm font-medium">
                            Pay Now
                          </button>
                        )}
                        <span className="text-xs text-gray-400 self-center">{booking.passengers?.length} passenger{booking.passengers?.length > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Profile Information</h3>
              <button onClick={() => setEditMode(!editMode)}
                className={`px-4 py-1 rounded-lg text-sm font-medium ${editMode ? 'bg-gray-100 text-gray-600' : 'bg-blue-600 text-white'}`}>
                {editMode ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" value={editMode ? profileForm.firstName : user?.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    disabled={!editMode}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" value={editMode ? profileForm.lastName : user?.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    disabled={!editMode}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={user?.email} disabled
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={editMode ? profileForm.phone : (user?.phone || '')}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  disabled={!editMode}
                  placeholder="+2348012345678"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500" />
              </div>

              {editMode && (
                <button onClick={handleSaveProfile} disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;