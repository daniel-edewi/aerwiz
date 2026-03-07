import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, bookingsAPI, paymentsAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Plane, User, LogOut, Calendar, CreditCard, MapPin, Clock, X, ChevronDown, ChevronUp } from 'lucide-react';
import AirportSearch from '../components/AirportSearch';

const API = process.env.REACT_APP_API_URL || 'https://aerwiz-production.up.railway.app/api';
const formatPrice = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAYMENT_PENDING: 'bg-orange-100 text-orange-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700'
};

// Modal Component
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
      <div className="flex items-center justify-between p-5 border-b">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, token, logout, updateUser } = useAuthStore();
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
  const [expandedBooking, setExpandedBooking] = useState(null);

  // Modals
  const [cancelModal, setCancelModal] = useState(null);
  const [dateModal, setDateModal] = useState(null);
  const [routeModal, setRouteModal] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newOrigin, setNewOrigin] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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

  const downloadBoardingPass = (booking) => {
    fetch(`${API}/bookings/${booking.id}/boarding-pass`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.blob()).then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boarding-pass-${booking.bookingReference}.pdf`;
      a.click();
    }).catch(() => toast.error('Failed to download boarding pass'));
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await axios.patch(`${API}/bookings/${cancelModal.id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Booking cancelled successfully');
      setCancelModal(null);
      fetchBookings();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeDate = async () => {
    if (!newDate) return toast.error('Please select a new date');
    setActionLoading(true);
    try {
      await axios.patch(`${API}/bookings/${dateModal.id}/change-date`,
        { newDepartureDate: newDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Departure date updated!');
      setDateModal(null);
      setNewDate('');
      fetchBookings();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update date');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRoute = async () => {
    if (!newOrigin || !newDestination) return toast.error('Please select both origin and destination');
    setActionLoading(true);
    try {
      await axios.patch(`${API}/bookings/${routeModal.id}/change-route`,
        { origin: newOrigin, destination: newDestination },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Route updated successfully!');
      setRouteModal(null);
      setNewOrigin(''); setNewDestination('');
      fetchBookings();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update route');
    } finally {
      setActionLoading(false);
    }
  };

  const totalSpent = bookings.filter(b => b.status !== 'CANCELLED').reduce((sum, b) => sum + b.totalAmount, 0);
  const confirmedTrips = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length;
  const canManage = (status) => !['CANCELLED', 'COMPLETED'].includes(status);

  const tabs = [
    { key: 'bookings', label: 'Bookings' },
    { key: 'profile', label: 'Profile' },
    { key: 'alerts', label: '🔔 Alerts' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cancel Modal */}
      {cancelModal && (
        <Modal title="Cancel Booking" onClose={() => setCancelModal(null)}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-gray-600 mb-2">Are you sure you want to cancel this booking?</p>
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="font-bold text-gray-800">{cancelModal.origin} → {cancelModal.destination}</p>
              <p className="text-gray-500">{cancelModal.bookingReference} · {formatDate(cancelModal.departureDate)}</p>
            </div>
            <p className="text-xs text-orange-600 mt-3">⚠️ Refunds take 5-10 business days to process</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={() => setCancelModal(null)}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium text-sm">
              Keep Booking
            </button>
            <button onClick={handleCancel} disabled={actionLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium text-sm disabled:opacity-50">
              {actionLoading ? 'Cancelling...' : 'Yes, Cancel'}
            </button>
          </div>
        </Modal>
      )}

      {/* Change Date Modal */}
      {dateModal && (
        <Modal title="Change Departure Date" onClose={() => setDateModal(null)}>
          <div className="mb-4 bg-blue-50 rounded-lg p-3 text-sm">
            <p className="font-bold text-gray-800">{dateModal.origin} → {dateModal.destination}</p>
            <p className="text-gray-500">Current date: {formatDate(dateModal.departureDate)}</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">New Departure Date</label>
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <p className="text-xs text-gray-400 mb-4">⚠️ Date changes may affect your fare. Contact support for fare differences.</p>
          <div className="flex space-x-3">
            <button onClick={() => setDateModal(null)}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium text-sm">
              Cancel
            </button>
            <button onClick={handleChangeDate} disabled={actionLoading || !newDate}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm disabled:opacity-50">
              {actionLoading ? 'Updating...' : 'Update Date'}
            </button>
          </div>
        </Modal>
      )}

      {/* Change Route Modal */}
      {routeModal && (
        <Modal title="Change Flight Route" onClose={() => setRouteModal(null)}>
          <div className="mb-4 bg-blue-50 rounded-lg p-3 text-sm">
            <p className="font-bold text-gray-800">Current: {routeModal.origin} → {routeModal.destination}</p>
            <p className="text-gray-500">{routeModal.bookingReference}</p>
          </div>
          <div className="space-y-3 mb-4">
            <AirportSearch
              label="New Origin"
              value={newOrigin}
              onChange={setNewOrigin}
              placeholder="City or airport"
            />
            <AirportSearch
              label="New Destination"
              value={newDestination}
              onChange={setNewDestination}
              placeholder="City or airport"
            />
          </div>
          <p className="text-xs text-orange-500 mb-4">⚠️ Route changes require fare recalculation. Our team will contact you with the price difference.</p>
          <div className="flex space-x-3">
            <button onClick={() => setRouteModal(null)}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium text-sm">
              Cancel
            </button>
            <button onClick={handleChangeRoute} disabled={actionLoading || !newOrigin || !newDestination}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm disabled:opacity-50">
              {actionLoading ? 'Updating...' : 'Update Route'}
            </button>
          </div>
        </Modal>
      )}

      {/* Header */}
      <div className="bg-blue-700 text-white py-3 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <Plane className="w-5 h-5" />
            <span className="text-lg font-bold">Aerwiz</span>
          </div>
          <button onClick={handleLogout} className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-800 px-3 py-1.5 rounded-lg text-sm">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="col-span-3 sm:col-span-1 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 text-white flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold truncate">{user?.firstName} {user?.lastName}</h2>
              <p className="text-blue-200 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Plane className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{confirmedTrips}</p>
              <p className="text-gray-500 text-xs">Trips</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{formatPrice(totalSpent)}</p>
              <p className="text-gray-500 text-xs">Spent</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-4 border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key}
              onClick={() => tab.key === 'alerts' ? navigate('/alerts') : setActiveTab(tab.key)}
              className={`pb-3 px-3 font-medium text-sm whitespace-nowrap transition-colors flex-shrink-0 ${activeTab === tab.key ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab.label}
            </button>
          ))}
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
              <div className="space-y-3">
                {bookings.map(booking => (
                  <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Booking Header */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Plane className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-1 font-bold text-gray-800 text-sm">
                              <span>{booking.origin}</span>
                              <span>→</span>
                              <span>{booking.destination}</span>
                            </div>
                            <p className="text-xs text-gray-400">{booking.bookingReference}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold flex-shrink-0 ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span>{formatDate(booking.departureDate)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span>{booking.flightNumber}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span>{booking.cabinClass}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <p className="font-bold text-blue-600">{formatPrice(booking.totalAmount)}</p>
                        <div className="flex items-center space-x-2">
                          {booking.status === 'PENDING' && (
                            <button onClick={async () => {
                              try {
                                const res = await paymentsAPI.initialize(booking.id);
                                window.location.href = res.data.data.authorizationUrl;
                              } catch (e) { toast.error('Payment error'); }
                            }} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                              Pay Now
                            </button>
                          )}
                          {(booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && (
                            <button onClick={() => downloadBoardingPass(booking)}
                              className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                              📄 Pass
                            </button>
                          )}
                          {canManage(booking.status) && (
                            <button
                              onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                              className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium">
                              <span>Manage</span>
                              {expandedBooking === booking.id
                                ? <ChevronUp className="w-3 h-3" />
                                : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Manage Panel */}
                    {expandedBooking === booking.id && canManage(booking.status) && (
                      <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="text-xs text-gray-500 mb-3 font-medium">MANAGE BOOKING</p>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => { setDateModal(booking); setNewDate(''); }}
                            className="flex flex-col items-center bg-white border border-blue-200 rounded-xl p-3 hover:bg-blue-50 transition-colors">
                            <Calendar className="w-5 h-5 text-blue-600 mb-1" />
                            <span className="text-xs font-medium text-gray-700">Change Date</span>
                          </button>
                          <button
                            onClick={() => { setRouteModal(booking); setNewOrigin(''); setNewDestination(''); }}
                            className="flex flex-col items-center bg-white border border-purple-200 rounded-xl p-3 hover:bg-purple-50 transition-colors">
                            <MapPin className="w-5 h-5 text-purple-600 mb-1" />
                            <span className="text-xs font-medium text-gray-700">Change Route</span>
                          </button>
                          <button
                            onClick={() => setCancelModal(booking)}
                            className="flex flex-col items-center bg-white border border-red-200 rounded-xl p-3 hover:bg-red-50 transition-colors">
                            <X className="w-5 h-5 text-red-600 mb-1" />
                            <span className="text-xs font-medium text-gray-700">Cancel</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Profile Information</h3>
              <button onClick={() => setEditMode(!editMode)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium ${editMode ? 'bg-gray-100 text-gray-600' : 'bg-blue-600 text-white'}`}>
                {editMode ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {['firstName', 'lastName'].map(field => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field === 'firstName' ? 'First Name' : 'Last Name'}
                    </label>
                    <input type="text"
                      value={editMode ? profileForm[field] : user?.[field]}
                      onChange={(e) => setProfileForm({ ...profileForm, [field]: e.target.value })}
                      disabled={!editMode}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500" />
                  </div>
                ))}
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
                  disabled={!editMode} placeholder="+2348012345678"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500" />
              </div>
              {editMode && (
                <button onClick={handleSaveProfile} disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg disabled:opacity-50">
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