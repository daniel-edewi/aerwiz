import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  Plane, Users, CreditCard, TrendingUp, Bell, BellRing,
  Shield, ShieldCheck, Search, RefreshCw, Clock, X,
  ArrowUpRight, ArrowDownRight, Calendar, MapPin, Trophy, DollarSign, BarChart2
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.aerwiz.com/api';
const formatPrice = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAYMENT_PENDING: 'bg-orange-100 text-orange-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700'
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [chartType, setChartType] = useState('revenue');
  const sseRef = useRef(null);
  const notifRef = useRef(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      toast.error('Admin access required');
      navigate('/admin/login');
      return;
    }
    fetchAll();
    connectSSE();
    return () => { if (sseRef.current) sseRef.current.close(); };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const connectSSE = () => {
    if (!token) return;
    try {
      const es = new EventSource(`${API_URL}/admin/notifications/stream?token=${token}`);
      sseRef.current = es;
      es.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'ping' || data.type === 'connected') return;
        const notif = { id: Date.now(), ...data, time: new Date(), read: false };
        setNotifications(prev => [notif, ...prev].slice(0, 50));
        setUnreadCount(prev => prev + 1);
        if (data.type === 'new_booking' || data.type === 'payment_received') {
          toast.custom((t) => (
            <div className={`bg-white border ${data.type === 'new_booking' ? 'border-blue-200' : 'border-green-200'} shadow-lg rounded-xl p-4 flex items-start space-x-3 max-w-sm`}>
              <div className={`w-8 h-8 ${data.type === 'new_booking' ? 'bg-blue-100' : 'bg-green-100'} rounded-full flex items-center justify-center flex-shrink-0`}>
                {data.type === 'new_booking' ? <Plane className="w-4 h-4 text-blue-600" /> : <CreditCard className="w-4 h-4 text-green-600" />}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800 text-sm">{data.type === 'new_booking' ? 'New Booking' : 'Payment Received'}</p>
                <p className="text-gray-600 text-xs mt-0.5">{data.message}</p>
                {data.booking && <p className={`text-xs font-bold mt-1 ${data.type === 'new_booking' ? 'text-blue-600' : 'text-green-600'}`}>{data.booking.reference} · {formatPrice(data.booking.amount)}</p>}
              </div>
              <button onClick={() => toast.dismiss(t.id)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
          ), { duration: 8000 });
          fetchAll();
        }
      };
      es.onerror = () => { es.close(); setTimeout(connectSSE, 5000); };
    } catch (e) {}
  };

  const fetchAll = () => { fetchStats(); fetchBookings(); fetchUsers(); };

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
      fetchBookings(); fetchStats();
    } catch (e) { toast.error('Failed to update status'); }
  };

  const updateUserRole = async (userId, role, userName) => {
    if (!window.confirm(`Change ${userName}'s role to ${role}?`)) return;
    setUpdatingRole(userId);
    try {
      await axios.patch(`${API_URL}/admin/users/${userId}/role`, { role }, { headers });
      toast.success(`${userName} is now ${role}`);
      fetchUsers();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update role');
    } finally { setUpdatingRole(null); }
  };

  const markAllRead = () => { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); setUnreadCount(0); };

  const filteredUsers = users.filter(u => `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(userSearch.toLowerCase()));
  const filteredBookings = bookings.filter(b => `${b.bookingReference} ${b.origin} ${b.destination} ${b.user?.firstName} ${b.user?.lastName}`.toLowerCase().includes(bookingSearch.toLowerCase()));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 shadow-xl">
          <p className="text-gray-400 text-xs mb-2">{label}</p>
          {payload.map((entry, i) => (
            <p key={i} className="text-sm font-bold" style={{ color: entry.color }}>
              {entry.name === 'revenue' ? formatPrice(entry.value) : `${entry.value} ${entry.name}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500 text-sm">Loading admin panel...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Admin Top Bar */}
      <div className="bg-gray-900 text-white py-3 px-6 border-b border-gray-700">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-bold">Aerwiz Admin</span>
              <span className="text-gray-400 text-xs ml-2">Control Panel</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative" ref={notifRef}>
              <button onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markAllRead(); }}
                className="relative p-2 rounded-lg hover:bg-gray-700 transition-colors">
                {unreadCount > 0 ? <BellRing className="w-5 h-5 text-yellow-400 animate-pulse" /> : <Bell className="w-5 h-5 text-gray-400" />}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3 bg-gray-900 flex items-center justify-between">
                    <span className="text-white font-bold text-sm">Notifications</span>
                    <button onClick={markAllRead} className="text-gray-400 hover:text-white text-xs">Mark all read</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-400 text-sm">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>No notifications yet</p>
                      </div>
                    ) : notifications.map(notif => (
                      <div key={notif.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${!notif.read ? 'bg-blue-50' : ''}`}>
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'new_booking' ? 'bg-blue-100' : 'bg-green-100'}`}>
                            {notif.type === 'new_booking' ? <Plane className="w-3.5 h-3.5 text-blue-600" /> : <CreditCard className="w-3.5 h-3.5 text-green-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{notif.type === 'new_booking' ? 'New Booking' : 'Payment Received'}</p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{notif.message}</p>
                            {notif.booking && (
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs font-bold text-blue-600">{notif.booking.reference}</span>
                                <span className="text-xs font-bold text-gray-700">{formatPrice(notif.booking.amount)}</span>
                              </div>
                            )}
                            <p className="text-xs text-gray-400 mt-1">{formatTime(notif.time)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={fetchAll} className="p-2 rounded-lg hover:bg-gray-700 transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
            <div className="flex items-center space-x-2 border-l border-gray-700 pl-4">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
              </div>
              <span className="text-gray-300 text-sm hidden sm:block">{user?.firstName}</span>
              <button onClick={() => { logout(); navigate('/'); }} className="text-gray-400 hover:text-red-400 text-xs ml-2 transition-colors">Logout</button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Users', value: stats.totalUsers, sub: `+${stats.userGrowth?.[stats.userGrowth.length-1]?.users || 0} this month`, icon: Users, bg: 'bg-blue-50', text: 'text-blue-600', trend: 'up' },
              { label: 'Total Bookings', value: stats.totalBookings, sub: `${stats.todayBookings} today`, icon: Plane, bg: 'bg-green-50', text: 'text-green-600', trend: 'up' },
              { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), sub: `${formatPrice(stats.todayRevenue)} today`, icon: CreditCard, bg: 'bg-purple-50', text: 'text-purple-600', trend: 'up' },
              { label: 'Pending', value: stats.bookingsByStatus.find(b => b.status === 'PENDING')?._count?.status || 0, sub: 'Awaiting payment', icon: Clock, bg: 'bg-orange-50', text: 'text-orange-600', trend: 'down' }
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} flex-shrink-0`}>
                    <stat.icon className={`w-5 h-5 ${stat.text}`} />
                  </div>
                  {stat.trend === 'up'
                    ? <ArrowUpRight className="w-4 h-4 text-green-500" />
                    : <ArrowDownRight className="w-4 h-4 text-orange-500" />
                  }
                </div>
                <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{stat.label}</p>
                <p className="text-gray-400 text-xs mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-gray-100 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart2 className="w-3.5 h-3.5" /> },
            { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { id: 'bookings', label: `Bookings (${bookings.length})`, icon: <Plane className="w-3.5 h-3.5" /> },
            { id: 'users', label: `Users (${users.length})`, icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'notifications', label: `Alerts${unreadCount > 0 ? ` (${unreadCount})` : ''}`, icon: <Bell className="w-3.5 h-3.5" /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center space-x-1.5 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Bookings by Status</span>
              </h3>
              <div className="space-y-3">
                {stats.bookingsByStatus.map(item => (
                  <div key={item.status} className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-600'}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-100 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min((item._count.status / stats.totalBookings) * 100, 100)}%` }}></div>
                      </div>
                      <span className="font-bold text-gray-800 text-sm w-6 text-right">{item._count.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <Plane className="w-4 h-4 text-blue-600" />
                <span>Top Airlines</span>
              </h3>
              <div className="space-y-3">
                {stats.bookingsByAirline.map(item => (
                  <div key={item.airline} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src={`https://pics.avs.io/40/40/${item.airline}.png`} alt={item.airline}
                        className="w-7 h-7 rounded object-contain bg-gray-50 p-0.5"
                        onError={(e) => { e.target.style.display = 'none'; }} />
                      <span className="font-medium text-gray-700 text-sm">{item.airline}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800 text-sm">{item._count.airline} bookings</p>
                      <p className="text-xs text-gray-500">{formatPrice(item._sum.totalAmount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Routes */}
            {stats.topRoutes && stats.topRoutes.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Top Routes</span>
                </h3>
                <div className="space-y-3">
                  {stats.topRoutes.map((route, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-xs font-bold">{i + 1}</span>
                        </div>
                        <span className="font-medium text-gray-800 text-sm">{route.origin} to {route.destination}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800 text-sm">{route._count.id} flights</p>
                        <p className="text-xs text-gray-500">{formatPrice(route._sum.totalAmount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revenue by Cabin Class */}
            {stats.revenueByClass && stats.revenueByClass.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Revenue by Cabin Class</span>
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.revenueByClass.map(r => ({
                        name: r.cabinClass || 'ECONOMY',
                        value: Number(r._sum.totalAmount) || 0,
                        count: r._count.id
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.revenueByClass.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatPrice(value)} />
                    <Legend formatter={(value) => value.replace('_', ' ')} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-2">
              <h3 className="font-bold text-gray-800 mb-4">Recent Bookings</h3>
              <div className="space-y-2">
                {stats.recentBookings.map(booking => (
                  <div key={booking.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                        <Plane className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{booking.origin} to {booking.destination}</p>
                        <p className="text-xs text-gray-400">{booking.user?.firstName} {booking.user?.lastName} · <span className="font-mono">{booking.bookingReference}</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600 text-sm">{formatPrice(booking.totalAmount)}</p>
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

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && stats && (
          <div className="space-y-6">

            {/* Chart Toggle */}
            <div className="flex items-center space-x-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
              {[
                { id: 'revenue', label: 'Revenue', icon: <DollarSign className="w-3.5 h-3.5" /> },
                { id: 'bookings', label: 'Bookings', icon: <Plane className="w-3.5 h-3.5" /> },
                { id: 'users', label: 'User Growth', icon: <Users className="w-3.5 h-3.5" /> },
              ].map(c => (
                <button key={c.id} onClick={() => setChartType(c.id)}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chartType === c.id ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                  {c.icon}
                  <span>{c.label}</span>
                </button>
              ))}
            </div>

            {/* Main Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    {chartType === 'revenue' ? 'Revenue Over Time' : chartType === 'bookings' ? 'Bookings Over Time' : 'User Growth'}
                  </h3>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {chartType === 'users' ? 'Last 6 months' : 'Last 12 months'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {chartType === 'users' ? '6 months' : '12 months'}
                  </span>
                </div>
              </div>

              {chartType === 'revenue' && (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={stats.monthlyStats}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false}
                      tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="revenue" stroke="#3b82f6" strokeWidth={2.5}
                      fill="url(#revenueGradient)" dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {chartType === 'bookings' && (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={stats.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="bookings" name="bookings" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {chartType === 'users' && (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={stats.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="users" name="users" stroke="#8b5cf6" strokeWidth={2.5}
                      dot={{ fill: '#8b5cf6', r: 5 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Revenue + Bookings Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-2">
                <h3 className="font-bold text-gray-800 mb-1">Revenue vs Bookings</h3>
                <p className="text-gray-400 text-sm mb-5">Monthly comparison</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={stats.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false}
                      tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" name="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.85} />
                    <Bar yAxisId="right" dataKey="bookings" name="bookings" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {stats.topRoutes && stats.topRoutes.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-bold text-gray-800 mb-1">Top Routes by Revenue</h3>
                  <p className="text-gray-400 text-sm mb-5">Most profitable routes</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.topRoutes.map(r => ({
                      route: `${r.origin}-${r.destination}`,
                      revenue: Number(r._sum.totalAmount) || 0,
                      bookings: r._count.id
                    }))} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false}
                        tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`} />
                      <YAxis type="category" dataKey="route" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={70} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="revenue" name="revenue" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {stats.revenueByClass && stats.revenueByClass.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-bold text-gray-800 mb-1">Bookings by Cabin Class</h3>
                  <p className="text-gray-400 text-sm mb-5">Distribution of cabin preferences</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={stats.revenueByClass.map(r => ({
                          name: (r.cabinClass || 'ECONOMY').replace('_', ' '),
                          value: r._count.id,
                          revenue: Number(r._sum.totalAmount) || 0
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {stats.revenueByClass.map((_, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} bookings`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: 'Best Month',
                  value: stats.monthlyStats?.reduce((a, b) => a.revenue > b.revenue ? a : b, { revenue: 0, month: 'N/A' })?.month || 'N/A',
                  sub: formatPrice(Math.max(...(stats.monthlyStats?.map(m => m.revenue) || [0]))),
                  icon: <Trophy className="w-6 h-6 text-yellow-600" />, color: 'bg-yellow-50 border-yellow-100'
                },
                {
                  label: 'Most Booked Route',
                  value: stats.topRoutes?.[0] ? `${stats.topRoutes[0].origin} to ${stats.topRoutes[0].destination}` : 'N/A',
                  sub: `${stats.topRoutes?.[0]?._count?.id || 0} bookings`,
                  icon: <Plane className="w-6 h-6 text-blue-600" />, color: 'bg-blue-50 border-blue-100'
                },
                {
                  label: 'Avg Booking Value',
                  value: stats.totalBookings > 0 ? formatPrice(stats.totalRevenue / stats.totalBookings) : '₦0',
                  sub: `Across ${stats.totalBookings} bookings`,
                  icon: <DollarSign className="w-6 h-6 text-green-600" />, color: 'bg-green-50 border-green-100'
                }
              ].map((card, i) => (
                <div key={i} className={`rounded-xl border p-5 ${card.color}`}>
                  <div className="mb-3">{card.icon}</div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{card.label}</p>
                  <p className="font-bold text-gray-800 text-lg leading-tight">{card.value}</p>
                  <p className="text-gray-500 text-xs mt-1">{card.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div>
            <div className="mb-4 flex items-center space-x-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search bookings..." value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <span className="text-sm text-gray-500">{filteredBookings.length} results</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Reference', 'Customer', 'Route', 'Date', 'Amount', 'Status', 'Update'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredBookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono font-bold text-blue-600">{booking.bookingReference}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800">{booking.user?.firstName} {booking.user?.lastName}</p>
                        <p className="text-xs text-gray-400">{booking.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{booking.origin} to {booking.destination}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(booking.departureDate)}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-800">{formatPrice(booking.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[booking.status] || 'bg-gray-100'}`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select value={booking.status} onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                          <option value="PENDING">PENDING</option>
                          <option value="PAYMENT_PENDING">PAYMENT PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="CANCELLED">CANCELLED</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBookings.length === 0 && (
                <div className="py-12 text-center text-gray-400">
                  <Plane className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>No bookings found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div>
            <div className="mb-4 flex items-center space-x-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search users..." value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <span className="text-sm text-gray-500">{filteredUsers.length} users</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
              <table className="w-full min-w-[650px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['User', 'Email', 'Phone', 'Role', 'Bookings', 'Joined', 'Change Role'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 text-xs font-bold">{u.firstName?.[0]}{u.lastName?.[0]}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-800">{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{u.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1 w-fit ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                          {u.role === 'ADMIN' ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                          <span>{u.role}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-800">{u._count.bookings}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        {u.id === user?.id ? (
                          <span className="text-xs text-gray-400 italic">You</span>
                        ) : (
                          <button
                            onClick={() => updateUserRole(u.id, u.role === 'USER' ? 'ADMIN' : 'USER', `${u.firstName} ${u.lastName}`)}
                            disabled={updatingRole === u.id}
                            className={`flex items-center space-x-1 px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${u.role === 'USER' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-500 hover:bg-gray-600'}`}
                          >
                            {updatingRole === u.id ? (
                              <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin inline-block" />
                            ) : u.role === 'USER' ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                            <span>{u.role === 'USER' ? 'Make Admin' : 'Remove Admin'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Activity Feed</h3>
              <button onClick={markAllRead} className="text-sm text-blue-600 hover:text-blue-700">Mark all read</button>
            </div>
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No activity yet</p>
                <p className="text-sm mt-1">New bookings and payments will appear here in real-time</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map(notif => (
                  <div key={notif.id} className={`px-6 py-4 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'new_booking' ? 'bg-blue-100' : 'bg-green-100'}`}>
                        {notif.type === 'new_booking' ? <Plane className="w-5 h-5 text-blue-600" /> : <CreditCard className="w-5 h-5 text-green-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{notif.type === 'new_booking' ? 'New Booking' : 'Payment Confirmed'}</p>
                        <p className="text-gray-600 text-sm mt-0.5">{notif.message}</p>
                        {notif.booking && (
                          <div className="mt-2 bg-gray-50 rounded-lg p-3 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div><p className="text-gray-400">Reference</p><p className="font-bold font-mono text-blue-600">{notif.booking.reference}</p></div>
                            <div><p className="text-gray-400">Route</p><p className="font-medium">{notif.booking.route}</p></div>
                            <div><p className="text-gray-400">Amount</p><p className="font-bold text-green-600">{formatPrice(notif.booking.amount)}</p></div>
                            <div><p className="text-gray-400">Passenger</p><p className="font-medium">{notif.booking.passenger || '—'}</p></div>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2">{formatDate(notif.time)} at {formatTime(notif.time)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;