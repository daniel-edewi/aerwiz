import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, bookingsAPI, paymentsAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
  Plane, User, LogOut, Calendar, CreditCard, MapPin, Clock,
  X, ChevronDown, ChevronUp, Bell, Search, Download,
  Edit2, Check, ArrowRight, Home, Settings
} from 'lucide-react';
import AirportSearch from '../components/AirportSearch';

const API = process.env.REACT_APP_API_URL || 'https://aerwiz-production.up.railway.app/api';
const formatPrice = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_CONFIG = {
  PENDING: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400', label: 'Pending Payment' },
  PAYMENT_PENDING: { color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-400', label: 'Payment Processing' },
  CONFIRMED: { color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500', label: 'Confirmed' },
  CANCELLED: { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-400', label: 'Cancelled' },
  COMPLETED: { color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'Completed' },
  FAILED: { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-400', label: 'Failed' },
};

const AirplaneLoader = () => (
  <span className="inline-flex items-center space-x-2">
    <span className="relative flex items-center justify-center w-4 h-4">
      <span className="animate-spin absolute w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
      <Plane className="w-2 h-2" />
    </span>
    <span>Processing...</span>
  </span>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-800">{title}</h3>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-6">{children}</div>
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
      toast.error(e.response?.data?.message || 'Failed to cancel');
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
      setDateModal(null); setNewDate('');
      fetchBookings();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update date');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRoute = async () => {
    if (!newOrigin || !newDestination) return toast.error('Please fill in both fields');
    setActionLoading(true);
    try {
      await axios.patch(`${API}/bookings/${routeModal.id}/change-route`,
        { origin: newOrigin, destination: newDestination },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Route updated!');
      setRouteModal(null); setNewOrigin(''); setNewDestination('');
      fetchBookings();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update route');
    } finally {
      setActionLoading(false);
    }
  };

  const totalSpent = bookings.filter(b => b.status !== 'CANCELLED').reduce((sum, b) => sum + b.totalAmount, 0);
  const confirmedTrips = bookings.filter(b => ['CONFIRMED', 'COMPLETED'].includes(b.status)).length;
  const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
  const canManage = (status) => !['CANCELLED', 'COMPLETED'].includes(status);

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = !searchQuery ||
      b.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Modals */}
      {cancelModal && (
        <Modal title="Cancel Booking" onClose={() => setCancelModal(null)}>
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <X className="w-7 h-7 text-red-500" />
            </div>
            <p className="text-gray-600 text-sm mb-3">Are you sure you want to cancel this booking?</p>
            <div className="bg-gray-50 rounded-xl p-3 text-sm border border-gray-100">
              <p className="font-bold text-gray-800">{cancelModal.origin} → {cancelModal.destination}</p>
              <p className="text-gray-400 text-xs mt-0.5">{cancelModal.bookingReference} · {formatDate(cancelModal.departureDate)}</p>
            </div>
            <p className="text-xs text-orange-500 mt-3 bg-orange-50 rounded-lg px-3 py-2">⚠️ Refunds take 5-10 business days to process</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={() => setCancelModal(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors">Keep Booking</button>
            <button onClick={handleCancel} disabled={actionLoading} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium text-sm disabled:opacity-50 transition-colors">
              {actionLoading ? <AirplaneLoader /> : 'Yes, Cancel'}
            </button>
          </div>
        </Modal>
      )}

      {dateModal && (
        <Modal title="Change Departure Date" onClose={() => setDateModal(null)}>
          <div className="mb-4 bg-blue-50 rounded-xl p-3 text-sm border border-blue-100">
            <p className="font-bold text-gray-800">{dateModal.origin} → {dateModal.destination}</p>
            <p className="text-gray-400 text-xs mt-0.5">Current: {formatDate(dateModal.departureDate)}</p>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">New Departure Date</label>
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <p className="text-xs text-gray-400 mb-4">Date changes may affect your fare. Our team will contact you with any differences.</p>
          <div className="flex space-x-3">
            <button onClick={() => setDateModal(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-200">Cancel</button>
            <button onClick={handleChangeDate} disabled={actionLoading || !newDate} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium text-sm disabled:opacity-50">
              {actionLoading ? <AirplaneLoader /> : 'Update Date'}
            </button>
          </div>
        </Modal>
      )}

      {routeModal && (
        <Modal title="Change Flight Route" onClose={() => setRouteModal(null)}>
          <div className="mb-4 bg-blue-50 rounded-xl p-3 text-sm border border-blue-100">
            <p className="font-bold text-gray-800">Current: {routeModal.origin} → {routeModal.destination}</p>
            <p className="text-gray-400 text-xs mt-0.5">{routeModal.bookingReference}</p>
          </div>
          <div className="space-y-3 mb-4">
            <AirportSearch label="New Origin" value={newOrigin} onChange={setNewOrigin} placeholder="City or airport" />
            <AirportSearch label="New Destination" value={newDestination} onChange={setNewDestination} placeholder="City or airport" />
          </div>
          <p className="text-xs text-orange-500 mb-4 bg-orange-50 rounded-lg px-3 py-2">⚠️ Route changes require fare recalculation. Our team will contact you.</p>
          <div className="flex space-x-3">
            <button onClick={() => setRouteModal(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-200">Cancel</button>
            <button onClick={handleChangeRoute} disabled={actionLoading || !newOrigin || !newDestination} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium text-sm disabled:opacity-50">
              {actionLoading ? <AirplaneLoader /> : 'Update Route'}
            </button>
          </div>
        </Modal>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plane className="text-white w-4 h-4" />
            </div>
            <span className="text-blue-700 text-lg font-bold">Aerwiz</span>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => navigate('/')} className="hidden sm:flex items-center space-x-1 text-gray-500 hover:text-blue-600 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button onClick={() => navigate('/alerts')} className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Alerts</span>
            </button>
            <button onClick={handleLogout} className="flex items-center space-x-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-48 opacity-10">
            <Plane className="w-48 h-48 absolute -right-8 -top-8 transform rotate-12" />
          </div>
          <div className="relative z-10">
            <p className="text-blue-200 text-sm mb-1">Welcome back,</p>
            <h1 className="text-2xl font-bold mb-1">{user?.firstName} {user?.lastName}</h1>
            <p className="text-blue-200 text-sm">{user?.email}</p>
            <button onClick={() => navigate('/')}
              className="mt-4 flex items-center space-x-2 bg-white text-blue-700 font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-50 transition-colors w-fit">
              <Search className="w-4 h-4" />
              <span>Search New Flight</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Bookings', value: bookings.length, icon: Plane, color: 'blue' },
            { label: 'Confirmed Trips', value: confirmedTrips, icon: Check, color: 'green' },
            { label: 'Pending Payment', value: pendingBookings, icon: Clock, color: 'orange' },
            { label: 'Total Spent', value: formatPrice(totalSpent), icon: CreditCard, color: 'purple', small: true },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-${stat.color}-100`}>
                <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
              </div>
              <p className={`font-bold text-gray-800 ${stat.small ? 'text-sm' : 'text-2xl'}`}>{stat.value}</p>
              <p className="text-gray-400 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {[
              { key: 'bookings', label: 'My Bookings', icon: Plane },
              { key: 'profile', label: 'Profile', icon: User },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.key === 'bookings' && bookings.length > 0 && (
                  <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">{bookings.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="p-4 sm:p-6">
              {/* Search & Filter */}
              {bookings.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by reference, route..."
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-600">
                    <option value="all">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PAYMENT_PENDING">Payment Pending</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              )}

              {loading ? (
                <div className="text-center py-16">
                  <div className="relative w-12 h-12 mx-auto mb-4">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
                    <Plane className="w-5 h-5 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-gray-400 text-sm">Loading your bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plane className="w-10 h-10 text-blue-200" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-600 mb-2">No bookings yet</h3>
                  <p className="text-gray-400 text-sm mb-6">Start exploring and book your first flight!</p>
                  <button onClick={() => navigate('/')}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto">
                    <Search className="w-4 h-4" />
                    <span>Search Flights</span>
                  </button>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400">No bookings match your search</p>
                  <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="text-blue-600 text-sm mt-2 hover:underline">Clear filters</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map(booking => {
                    const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
                    const isExpanded = expandedBooking === booking.id;
                    return (
                      <div key={booking.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-sm transition-all">
                        {/* Card Header */}
                        <div className="p-4 sm:p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Plane className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2 font-bold text-gray-800">
                                  <span className="text-lg">{booking.origin}</span>
                                  <ArrowRight className="w-4 h-4 text-gray-400" />
                                  <span className="text-lg">{booking.destination}</span>
                                </div>
                                <p className="text-xs text-gray-400 font-mono mt-0.5">{booking.bookingReference}</p>
                              </div>
                            </div>
                            <span className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                              <span>{statusConfig.label}</span>
                            </span>
                          </div>

                          {/* Flight Details Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 rounded-xl p-3 mb-4">
                            <div>
                              <p className="text-xs text-gray-400 mb-0.5">Departure</p>
                              <p className="text-sm font-semibold text-gray-700">{formatDate(booking.departureDate)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-0.5">Flight</p>
                              <p className="text-sm font-semibold text-gray-700">{booking.flightNumber}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-0.5">Class</p>
                              <p className="text-sm font-semibold text-gray-700">{booking.cabinClass}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-0.5">Amount</p>
                              <p className="text-sm font-bold text-blue-600">{formatPrice(booking.totalAmount)}</p>
                            </div>
                          </div>

                          {/* Passengers */}
                          {booking.passengers && booking.passengers.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {booking.passengers.map((p, i) => (
                                <span key={i} className="flex items-center space-x-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                                  <User className="w-3 h-3" />
                                  <span>{p.title} {p.firstName} {p.lastName}</span>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex flex-wrap items-center gap-2">
                            {booking.status === 'PENDING' && (
                              <button onClick={async () => {
                                try {
                                  const res = await paymentsAPI.initialize(booking.id);
                                  window.location.href = res.data.data.authorizationUrl;
                                } catch (e) { toast.error('Payment error'); }
                              }} className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Pay Now</span>
                              </button>
                            )}
                            {['CONFIRMED', 'COMPLETED'].includes(booking.status) && (
                              <button onClick={() => downloadBoardingPass(booking)}
                                className="flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                                <Download className="w-3.5 h-3.5" />
                                <span>Boarding Pass</span>
                              </button>
                            )}
                            {canManage(booking.status) && (
                              <button onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                                className="flex items-center space-x-1.5 border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                                <Settings className="w-3.5 h-3.5" />
                                <span>Manage</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Manage Panel */}
                        {isExpanded && canManage(booking.status) && (
                          <div className="border-t border-gray-100 bg-gray-50 px-4 sm:px-5 py-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Booking Management</p>
                            <div className="grid grid-cols-3 gap-3">
                              <button onClick={() => { setDateModal(booking); setNewDate(''); }}
                                className="flex flex-col items-center bg-white border border-blue-100 rounded-xl p-3 hover:border-blue-400 hover:bg-blue-50 transition-all group">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-colors">
                                  <Calendar className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="text-xs font-semibold text-gray-700 text-center">Change Date</span>
                              </button>
                              <button onClick={() => { setRouteModal(booking); setNewOrigin(''); setNewDestination(''); }}
                                className="flex flex-col items-center bg-white border border-purple-100 rounded-xl p-3 hover:border-purple-400 hover:bg-purple-50 transition-all group">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-purple-200 transition-colors">
                                  <MapPin className="w-4 h-4 text-purple-600" />
                                </div>
                                <span className="text-xs font-semibold text-gray-700 text-center">Change Route</span>
                              </button>
                              <button onClick={() => setCancelModal(booking)}
                                className="flex flex-col items-center bg-white border border-red-100 rounded-xl p-3 hover:border-red-400 hover:bg-red-50 transition-all group">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-red-200 transition-colors">
                                  <X className="w-4 h-4 text-red-600" />
                                </div>
                                <span className="text-xs font-semibold text-gray-700 text-center">Cancel</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-4 sm:p-6">
              <div className="max-w-lg">
                {/* Avatar */}
                <div className="flex items-center space-x-4 mb-6 p-4 bg-blue-50 rounded-2xl">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl font-bold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{user?.firstName} {user?.lastName}</p>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">{user?.role}</span>
                  </div>
                  <button onClick={() => setEditMode(!editMode)}
                    className={`ml-auto flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${editMode ? 'bg-gray-200 text-gray-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{editMode ? 'Cancel' : 'Edit'}</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {['firstName', 'lastName'].map(field => (
                      <div key={field}>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                          {field === 'firstName' ? 'First Name' : 'Last Name'}
                        </label>
                        <input type="text"
                          value={editMode ? profileForm[field] : (user?.[field] || '')}
                          onChange={(e) => setProfileForm({ ...profileForm, [field]: e.target.value })}
                          disabled={!editMode}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email Address</label>
                    <input type="email" value={user?.email || ''} disabled
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-400" />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone Number</label>
                    <input type="tel"
                      value={editMode ? profileForm.phone : (user?.phone || '')}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      disabled={!editMode} placeholder="+234 800 000 0000"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors" />
                  </div>
                  {editMode && (
                    <button onClick={handleSaveProfile} disabled={saving}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors">
                      {saving ? <AirplaneLoader /> : (<><Check className="w-4 h-4" /><span>Save Changes</span></>)}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;