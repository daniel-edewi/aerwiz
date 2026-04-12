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
  ArrowUpRight, ArrowDownRight, Calendar, MapPin, Trophy, DollarSign, BarChart2,
  Tag, Plus, Trash2, ToggleLeft, ToggleRight, Edit2, FileText, Eye, EyeOff, Save, ChevronDown, ChevronUp, Lock, UserX
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

  // Promo state
  const [promos, setPromos] = useState([]);
  const [promoLoading, setPromoLoading] = useState(false);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [promoForm, setPromoForm] = useState({
    code: '', description: '', discountType: 'PERCENTAGE', discountValue: '',
    minAmount: '', maxUses: '', expiresAt: ''
  });

  // Blog state
  const [posts, setPosts] = useState([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [blogForm, setBlogForm] = useState({
    title: '', excerpt: '', content: '', category: 'General',
    image: '', readTime: '5 min read', published: true
  });

  // Password confirmation modal state
  const [passwordModal, setPasswordModal] = useState(null); // { action, userId, userName, data }
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Edit user modal state
  const [editUserModal, setEditUserModal] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ firstName: '', lastName: '', phone: '', isActive: true });

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
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (activeTab === 'promos') fetchPromos();
    if (activeTab === 'blog') fetchPosts();
  }, [activeTab]);

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
    } catch (e) { toast.error('Failed to load stats'); }
    finally { setLoading(false); }
  };

  const fetchBookings = async () => {
    try { const res = await axios.get(`${API_URL}/admin/bookings`, { headers }); setBookings(res.data.data); } catch (e) {}
  };

  const fetchUsers = async () => {
    try { const res = await axios.get(`${API_URL}/admin/users`, { headers }); setUsers(res.data.data); } catch (e) {}
  };

  const fetchPromos = async () => {
    setPromoLoading(true);
    try { const res = await axios.get(`${API_URL}/promo`, { headers }); setPromos(res.data.data || []); }
    catch (e) { toast.error('Failed to load promo codes'); }
    finally { setPromoLoading(false); }
  };

  const fetchPosts = async () => {
    setBlogLoading(true);
    try { const res = await axios.get(`${API_URL}/blog`, { headers }); setPosts(res.data.data || []); }
    catch (e) { toast.error('Failed to load blog posts'); }
    finally { setBlogLoading(false); }
  };

  const createPromo = async () => {
    if (!promoForm.code || !promoForm.discountValue) return toast.error('Code and discount value are required');
    try {
      await axios.post(`${API_URL}/promo`, { ...promoForm, discountValue: parseFloat(promoForm.discountValue), minAmount: parseFloat(promoForm.minAmount) || 0, maxUses: parseInt(promoForm.maxUses) || null }, { headers });
      toast.success('Promo code created!');
      setShowPromoForm(false);
      setPromoForm({ code: '', description: '', discountType: 'PERCENTAGE', discountValue: '', minAmount: '', maxUses: '', expiresAt: '' });
      fetchPromos();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to create promo'); }
  };

  const togglePromo = async (id) => {
    try { await axios.patch(`${API_URL}/promo/${id}/toggle`, {}, { headers }); fetchPromos(); }
    catch (e) { toast.error('Failed to toggle promo'); }
  };

  const deletePromo = async (id, code) => {
    if (!window.confirm(`Delete promo code "${code}"?`)) return;
    try { await axios.delete(`${API_URL}/promo/${id}`, { headers }); toast.success('Promo deleted'); fetchPromos(); }
    catch (e) { toast.error('Failed to delete promo'); }
  };

  const saveBlogPost = async () => {
    if (!blogForm.title || !blogForm.content) return toast.error('Title and content are required');
    try {
      if (editingPost) {
        await axios.patch(`${API_URL}/blog/${editingPost.id}`, blogForm, { headers });
        toast.success('Post updated!');
      } else {
        await axios.post(`${API_URL}/blog`, blogForm, { headers });
        toast.success('Post created!');
      }
      setShowBlogForm(false);
      setEditingPost(null);
      setBlogForm({ title: '', excerpt: '', content: '', category: 'General', image: '', readTime: '5 min read', published: true });
      fetchPosts();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save post'); }
  };

  const deletePost = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try { await axios.delete(`${API_URL}/blog/${id}`, { headers }); toast.success('Post deleted'); fetchPosts(); }
    catch (e) { toast.error('Failed to delete post'); }
  };

  const editPost = (post) => {
    setEditingPost(post);
    setBlogForm({ title: post.title, excerpt: post.excerpt || '', content: post.content || '', category: post.category || 'General', image: post.image || '', readTime: post.readTime || '5 min read', published: post.published });
    setShowBlogForm(true);
  };

  const updateBookingStatus = async (bookingId, status) => {
    try { await axios.patch(`${API_URL}/admin/bookings/${bookingId}/status`, { status }, { headers }); toast.success('Booking status updated!'); fetchBookings(); fetchStats(); }
    catch (e) { toast.error('Failed to update status'); }
  };

  const updateUserRole = async (userId, role, userName) => {
    if (!window.confirm(`Change ${userName}'s role to ${role}?`)) return;
    setUpdatingRole(userId);
    try { await axios.patch(`${API_URL}/admin/users/${userId}/role`, { role }, { headers }); toast.success(`${userName} is now ${role}`); fetchUsers(); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed to update role'); }
    finally { setUpdatingRole(null); }
  };

  const markAllRead = () => { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); setUnreadCount(0); };

  const openPasswordModal = (action, userId, userName, data = {}) => {
    setPasswordModal({ action, userId, userName, data });
    setAdminPassword('');
    setShowAdminPassword(false);
  };

  const handlePasswordConfirm = async () => {
    if (!adminPassword) return toast.error('Please enter your password');
    setPasswordLoading(true);
    try {
      await axios.post(`${API_URL}/admin/verify-password`, { password: adminPassword }, { headers });
      const { action, userId, userName, data } = passwordModal;
      setPasswordModal(null);
      setAdminPassword('');

      if (action === 'delete') {
        await axios.delete(`${API_URL}/admin/users/${userId}`, { headers });
        toast.success(`${userName} deleted successfully`);
        fetchUsers();
      } else if (action === 'edit') {
        await axios.patch(`${API_URL}/admin/users/${userId}/details`, data, { headers });
        toast.success(`${userName} updated successfully`);
        fetchUsers();
        setEditUserModal(null);
      } else if (action === 'role') {
        await axios.patch(`${API_URL}/admin/users/${userId}/role`, { role: data.role }, { headers });
        toast.success(`${userName} is now ${data.role}`);
        fetchUsers();
      }
    } catch (e) {
      if (e.response?.status === 401) {
        toast.error('Incorrect password');
      } else {
        toast.error(e.response?.data?.message || 'Action failed');
        setPasswordModal(null);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

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
    <>
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
                  {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4 text-green-500" /> : <ArrowDownRight className="w-4 h-4 text-orange-500" />}
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
            { id: 'promos', label: 'Promo Codes', icon: <Tag className="w-3.5 h-3.5" /> },
            { id: 'blog', label: 'Blog', icon: <FileText className="w-3.5 h-3.5" /> },
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
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min((item._count.status / stats.totalBookings) * 100, 100)}%` }}></div>
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

            {stats.revenueByClass && stats.revenueByClass.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Revenue by Cabin Class</span>
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={stats.revenueByClass.map(r => ({ name: r.cabinClass || 'ECONOMY', value: Number(r._sum.totalAmount) || 0 }))}
                      cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                      {stats.revenueByClass.map((_, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => formatPrice(value)} />
                    <Legend formatter={(value) => value.replace('_', ' ')} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

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
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[booking.status] || 'bg-gray-100'}`}>{booking.status}</span>
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
            <div className="flex items-center space-x-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
              {[
                { id: 'revenue', label: 'Revenue', icon: <DollarSign className="w-3.5 h-3.5" /> },
                { id: 'bookings', label: 'Bookings', icon: <Plane className="w-3.5 h-3.5" /> },
                { id: 'users', label: 'User Growth', icon: <Users className="w-3.5 h-3.5" /> },
              ].map(c => (
                <button key={c.id} onClick={() => setChartType(c.id)}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chartType === c.id ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                  {c.icon}<span>{c.label}</span>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    {chartType === 'revenue' ? 'Revenue Over Time' : chartType === 'bookings' ? 'Bookings Over Time' : 'User Growth'}
                  </h3>
                  <p className="text-gray-400 text-sm mt-0.5">{chartType === 'users' ? 'Last 6 months' : 'Last 12 months'}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{chartType === 'users' ? '6 months' : '12 months'}</span>
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
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revenueGradient)" dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
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
                    <Line type="monotone" dataKey="users" name="users" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 5 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-2">
                <h3 className="font-bold text-gray-800 mb-1">Revenue vs Bookings</h3>
                <p className="text-gray-400 text-sm mb-5">Monthly comparison</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={stats.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`} />
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
                    <BarChart data={stats.topRoutes.map(r => ({ route: `${r.origin}-${r.destination}`, revenue: Number(r._sum.totalAmount) || 0 }))} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`} />
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
                      <Pie data={stats.revenueByClass.map(r => ({ name: (r.cabinClass || 'ECONOMY').replace('_', ' '), value: r._count.id }))}
                        cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {stats.revenueByClass.map((_, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} bookings`]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Best Month', value: stats.monthlyStats?.reduce((a, b) => a.revenue > b.revenue ? a : b, { revenue: 0, month: 'N/A' })?.month || 'N/A', sub: formatPrice(Math.max(...(stats.monthlyStats?.map(m => m.revenue) || [0]))), icon: <Trophy className="w-6 h-6 text-yellow-600" />, color: 'bg-yellow-50 border-yellow-100' },
                { label: 'Most Booked Route', value: stats.topRoutes?.[0] ? `${stats.topRoutes[0].origin} to ${stats.topRoutes[0].destination}` : 'N/A', sub: `${stats.topRoutes?.[0]?._count?.id || 0} bookings`, icon: <Plane className="w-6 h-6 text-blue-600" />, color: 'bg-blue-50 border-blue-100' },
                { label: 'Avg Booking Value', value: stats.totalBookings > 0 ? formatPrice(stats.totalRevenue / stats.totalBookings) : '₦0', sub: `Across ${stats.totalBookings} bookings`, icon: <DollarSign className="w-6 h-6 text-green-600" />, color: 'bg-green-50 border-green-100' }
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
                <input type="text" placeholder="Search bookings..." value={bookingSearch} onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <span className="text-sm text-gray-500">{filteredBookings.length} results</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>{['Reference', 'Customer', 'Route', 'Date', 'Amount', 'Status', 'Update'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredBookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono font-bold text-blue-600">{booking.bookingReference}</td>
                      <td className="px-4 py-3"><p className="text-sm font-medium text-gray-800">{booking.user?.firstName} {booking.user?.lastName}</p><p className="text-xs text-gray-400">{booking.user?.email}</p></td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{booking.origin} to {booking.destination}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(booking.departureDate)}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-800">{formatPrice(booking.totalAmount)}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[booking.status] || 'bg-gray-100'}`}>{booking.status.replace('_', ' ')}</span></td>
                      <td className="px-4 py-3">
                        <select value={booking.status} onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                          {['PENDING', 'PAYMENT_PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBookings.length === 0 && <div className="py-12 text-center text-gray-400"><Plane className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No bookings found</p></div>}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div>
            <div className="mb-4 flex items-center space-x-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <span className="text-sm text-gray-500">{filteredUsers.length} users</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>{['User', 'Email', 'Phone', 'Role', 'Status', 'Bookings', 'Joined', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
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
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {u.isActive !== false ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-800">{u._count.bookings}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        {u.id === user?.id ? (
                          <span className="text-xs text-gray-400 italic">You</span>
                        ) : (
                          <div className="flex items-center space-x-1">
                            {/* Edit */}
                            <button
                              onClick={() => { setEditUserModal(u); setEditUserForm({ firstName: u.firstName, lastName: u.lastName, phone: u.phone || '', isActive: u.isActive !== false }); }}
                              className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors" title="Edit user">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {/* Toggle Role */}
                            <button
                              onClick={() => openPasswordModal('role', u.id, `${u.firstName} ${u.lastName}`, { role: u.role === 'USER' ? 'ADMIN' : 'USER' })}
                              className={`p-1.5 rounded-lg transition-colors ${u.role === 'USER' ? 'text-purple-500 hover:bg-purple-50' : 'text-gray-400 hover:bg-gray-100'}`}
                              title={u.role === 'USER' ? 'Make Admin' : 'Remove Admin'}>
                              {u.role === 'USER' ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => openPasswordModal('delete', u.id, `${u.firstName} ${u.lastName}`)}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors" title="Delete user">
                              <UserX className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROMO CODES TAB */}
        {activeTab === 'promos' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Promo Codes</h2>
                <p className="text-gray-400 text-sm">{promos.length} codes total</p>
              </div>
              <button onClick={() => setShowPromoForm(!showPromoForm)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span>New Promo Code</span>
              </button>
            </div>

            {/* Create Promo Form */}
            {showPromoForm && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-5">Create Promo Code</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Code *</label>
                    <input type="text" value={promoForm.code} onChange={(e) => setPromoForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g. AERWIZ20" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-widest font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                    <input type="text" value={promoForm.description} onChange={(e) => setPromoForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="e.g. 20% off all flights" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Discount Type</label>
                    <select value={promoForm.discountType} onChange={(e) => setPromoForm(p => ({ ...p, discountType: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount (₦)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Discount Value *</label>
                    <input type="number" value={promoForm.discountValue} onChange={(e) => setPromoForm(p => ({ ...p, discountValue: e.target.value }))}
                      placeholder={promoForm.discountType === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 5000'}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Min Booking Amount (₦)</label>
                    <input type="number" value={promoForm.minAmount} onChange={(e) => setPromoForm(p => ({ ...p, minAmount: e.target.value }))}
                      placeholder="e.g. 50000" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Max Uses</label>
                    <input type="number" value={promoForm.maxUses} onChange={(e) => setPromoForm(p => ({ ...p, maxUses: e.target.value }))}
                      placeholder="Leave blank for unlimited" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Expiry Date</label>
                    <input type="date" value={promoForm.expiresAt} onChange={(e) => setPromoForm(p => ({ ...p, expiresAt: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="flex space-x-3 mt-5">
                  <button onClick={createPromo} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">Create Code</button>
                  <button onClick={() => setShowPromoForm(false)} className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                </div>
              </div>
            )}

            {/* Promos List */}
            {promoLoading ? (
              <div className="text-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
            ) : promos.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
                <Tag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="font-medium text-gray-500">No promo codes yet</p>
                <p className="text-sm text-gray-400 mt-1">Create your first promo code above</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>{['Code', 'Description', 'Discount', 'Min Amount', 'Uses', 'Expires', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {promos.map(promo => (
                      <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-blue-600 text-sm">{promo.code}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{promo.description || '—'}</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-800">
                          {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}%` : formatPrice(promo.discountValue)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{promo.minAmount > 0 ? formatPrice(promo.minAmount) : '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{promo.usedCount || 0}{promo.maxUses ? `/${promo.maxUses}` : ''}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{promo.expiresAt ? formatDate(promo.expiresAt) : 'Never'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${promo.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {promo.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <button onClick={() => togglePromo(promo.id)} title={promo.isActive ? 'Deactivate' : 'Activate'}
                              className={`p-1.5 rounded-lg transition-colors ${promo.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                              {promo.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                            </button>
                            <button onClick={() => deletePromo(promo.id, promo.code)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BLOG TAB */}
        {activeTab === 'blog' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Blog Posts</h2>
                <p className="text-gray-400 text-sm">{posts.length} published posts</p>
              </div>
              <button onClick={() => { setShowBlogForm(!showBlogForm); setEditingPost(null); setBlogForm({ title: '', excerpt: '', content: '', category: 'General', image: '', readTime: '5 min read', published: true }); }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span>New Post</span>
              </button>
            </div>

            {/* Blog Form */}
            {showBlogForm && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-5">{editingPost ? 'Edit Post' : 'Create New Post'}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Title *</label>
                      <input type="text" value={blogForm.title} onChange={(e) => setBlogForm(b => ({ ...b, title: e.target.value }))}
                        placeholder="Post title" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Category</label>
                      <select value={blogForm.category} onChange={(e) => setBlogForm(b => ({ ...b, category: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        {['General', 'Travel Tips', 'Destinations', 'Flight Deals', 'News', 'Guides'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Read Time</label>
                      <input type="text" value={blogForm.readTime} onChange={(e) => setBlogForm(b => ({ ...b, readTime: e.target.value }))}
                        placeholder="e.g. 5 min read" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Image URL</label>
                      <input type="text" value={blogForm.image} onChange={(e) => setBlogForm(b => ({ ...b, image: e.target.value }))}
                        placeholder="https://..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Excerpt</label>
                      <input type="text" value={blogForm.excerpt} onChange={(e) => setBlogForm(b => ({ ...b, excerpt: e.target.value }))}
                        placeholder="Short summary shown on blog listing page" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Content *</label>
                      <textarea value={blogForm.content} onChange={(e) => setBlogForm(b => ({ ...b, content: e.target.value }))}
                        placeholder="Write your blog post content here..." rows={10}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-6 rounded-full cursor-pointer transition-colors flex items-center px-0.5 ${blogForm.published ? 'bg-blue-600' : 'bg-gray-200'}`}
                        onClick={() => setBlogForm(b => ({ ...b, published: !b.published }))}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${blogForm.published ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">{blogForm.published ? 'Published' : 'Draft'}</span>
                    </div>
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <button onClick={saveBlogPost} className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                      <Save className="w-4 h-4" />
                      <span>{editingPost ? 'Update Post' : 'Publish Post'}</span>
                    </button>
                    <button onClick={() => { setShowBlogForm(false); setEditingPost(null); }} className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {/* Posts List */}
            {blogLoading ? (
              <div className="text-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
                <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="font-medium text-gray-500">No blog posts yet</p>
                <p className="text-sm text-gray-400 mt-1">Create your first post above</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {posts.map(post => (
                  <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-4 min-w-0">
                      {post.image && <img src={post.image} alt={post.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-gray-100" onError={(e) => { e.target.style.display = 'none'; }} />}
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${post.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{post.category}</span>
                        </div>
                        <p className="font-bold text-gray-800 truncate">{post.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{post.author} · {post.readTime} · {formatDate(post.publishedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button onClick={() => editPost(post)} className="flex items-center space-x-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button onClick={() => deletePost(post.id, post.title)} className="flex items-center space-x-1 px-3 py-1.5 border border-red-100 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

    {/* Password Confirmation Modal */}
    {passwordModal && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-gray-800">Confirm Action</h3>
            </div>
            <button onClick={() => setPasswordModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6">
            <div className={`rounded-xl p-3 mb-4 text-sm ${passwordModal.action === 'delete' ? 'bg-red-50 border border-red-100' : 'bg-blue-50 border border-blue-100'}`}>
              <p className="font-semibold text-gray-800">
                {passwordModal.action === 'delete' ? `Delete ${passwordModal.userName}?` :
                 passwordModal.action === 'role' ? `Change ${passwordModal.userName}'s role to ${passwordModal.data?.role}?` :
                 `Edit ${passwordModal.userName}?`}
              </p>
              {passwordModal.action === 'delete' && (
                <p className="text-xs text-red-600 mt-1">This will permanently delete the user and all their bookings.</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Your Admin Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordConfirm()}
                  placeholder="Enter your password to confirm"
                  autoFocus
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setPasswordModal(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-200">Cancel</button>
              <button
                onClick={handlePasswordConfirm}
                disabled={passwordLoading || !adminPassword}
                className={`flex-1 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors ${passwordModal.action === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {passwordLoading ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span><span>Verifying...</span></>
                ) : (
                  <span>{passwordModal.action === 'delete' ? 'Delete User' : 'Confirm'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Edit User Modal */}
    {editUserModal && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-800">Edit User — {editUserModal.firstName} {editUserModal.lastName}</h3>
            <button onClick={() => setEditUserModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">First Name</label>
                <input type="text" value={editUserForm.firstName} onChange={(e) => setEditUserForm(f => ({ ...f, firstName: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Last Name</label>
                <input type="text" value={editUserForm.lastName} onChange={(e) => setEditUserForm(f => ({ ...f, lastName: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone</label>
              <input type="tel" value={editUserForm.phone} onChange={(e) => setEditUserForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+234 800 000 0000"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Account Status</p>
                <p className="text-xs text-gray-400">{editUserForm.isActive ? 'User can log in and make bookings' : 'User is suspended'}</p>
              </div>
              <div
                onClick={() => setEditUserForm(f => ({ ...f, isActive: !f.isActive }))}
                className={`w-12 h-6 rounded-full cursor-pointer transition-colors flex items-center px-0.5 ${editUserForm.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${editUserForm.isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
            </div>
            <div className="flex space-x-3 pt-2">
              <button onClick={() => setEditUserModal(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-200">Cancel</button>
              <button
                onClick={() => openPasswordModal('edit', editUserModal.id, `${editUserModal.firstName} ${editUserModal.lastName}`, editUserForm)}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 flex items-center justify-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default AdminPage;
