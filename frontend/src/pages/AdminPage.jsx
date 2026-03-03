import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Plane, Users, CreditCard, TrendingUp, LogOut } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const formatPrice = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAYMENT_PENDING: 'bg-orange-100 text-orange-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700'
};

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      toast.error('Admin access required');
      navigate('/');
      return;
    }
    fetchStats();
    fetchBookings();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/stats`, { headers });
      setStats(res.data.data);
    } catch (e) {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/bookings`, { headers });
      setBookings(res.data.data);
    } catch (e) {}
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/users`, { headers });
      setUsers(res.data.data);
    } catch (e) {}
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await axios.patch(`${API_URL}/admin/bookings/${bookingId}/status`, { status }, { headers });
      toast.success('Booking status updated!');
      fetchBookings();
      fetchStats();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Plane className="w-6 h-6 text-blue-400" />
            <span className="text-xl font-bold">Aerwiz Admin</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm">{user?.email}</span>
            <button onClick={() => { logout(); navigate('/'); }} className="flex items-center space-x-1 text-gray-400 hover:text-white text-sm">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
              { label: 'Total Bookings', value: stats.totalBookings, icon: Plane, color: 'green' },
              { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: CreditCard, color: 'purple' },
              { label: 'Pending Bookings', value: stats.bookingsByStatus.find(b => b.status === 'PENDING')?._count?.status || 0, icon: TrendingUp, color: 'orange' }
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${stat.color}-100`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          {['overview', 'bookings', 'users'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 font-medium text-sm capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab === 'overview' ? 'Overview' : tab === 'bookings' ? `Bookings (${bookings.length})` : `Users (${users.length})`}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4">Bookings by Status</h3>
              <div className="space-y-3">
                {stats.bookingsByStatus.map(item => (
                  <div key={item.status} className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-600'}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className="font-bold text-gray-800">{item._count.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4">Top Airlines</h3>
              <div className="space-y-3">
                {stats.bookingsByAirline.map(item => (
                  <div key={item.airline} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src={`https://pics.avs.io/40/40/${item.airline}.png`} alt={item.airline}
                        className="w-8 h-8 rounded-full object-contain bg-gray-50 p-1"
                        onError={(e) => { e.target.style.display = 'none'; }} />
                      <span className="font-medium text-gray-700">{item.airline}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{item._count.airline} booking{item._count.airline > 1 ? 's' : ''}</p>
                      <p className="text-xs text-gray-500">{formatPrice(item._sum.totalAmount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-2">
              <h3 className="font-bold text-gray-800 mb-4">Recent Bookings</h3>
              <div className="space-y-3">
                {stats.recentBookings.map(booking => (
                  <div key={booking.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div className="flex items-center space-x-3">
                      <Plane className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-800">{booking.origin} → {booking.destination}</p>
                        <p className="text-xs text-gray-400">{booking.user.firstName} {booking.user.lastName} · {booking.bookingReference}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{formatPrice(booking.totalAmount)}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[booking.status] || 'bg-gray-100'}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Reference', 'Customer', 'Route', 'Date', 'Amount', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono font-bold text-blue-600">{booking.bookingReference}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{booking.user.firstName} {booking.user.lastName}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{booking.origin} → {booking.destination}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(booking.departureDate)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-800">{formatPrice(booking.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[booking.status] || 'bg-gray-100'}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select value={booking.status} onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 outline-none">
                        <option value="PENDING">PENDING</option>
                        <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Email', 'Phone', 'Role', 'Bookings', 'Joined'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{user.firstName} {user.lastName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-800">{user._count.bookings}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;