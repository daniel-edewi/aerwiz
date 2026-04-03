import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Plane, Bell, Trash2, Plus, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const formatPrice = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

const AlertsPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ origin: '', destination: '', targetPrice: '', cabinClass: 'ECONOMY', departureDate: '' });
  const [saving, setSaving] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(`${API_URL}/alerts`, { headers });
      setAlerts(res.data.data);
    } catch (e) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async () => {
    if (!form.origin || !form.destination || !form.targetPrice) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${API_URL}/alerts`, form, { headers });
      toast.success('Price alert created!');
      setShowForm(false);
      setForm({ origin: '', destination: '', targetPrice: '', cabinClass: 'ECONOMY', departureDate: '' });
      fetchAlerts();
    } catch (e) {
      toast.error('Failed to create alert');
    } finally {
      setSaving(false);
    }
  };

  const deleteAlert = async (id) => {
    try {
      await axios.delete(`${API_URL}/alerts/${id}`, { headers });
      toast.success('Alert deleted');
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (e) {
      toast.error('Failed to delete alert');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-700 text-white py-4 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <Plane className="w-6 h-6" />
            <span className="text-xl font-bold">Aerwiz</span>
          </div>
          <button onClick={() => navigate('/dashboard')} className="text-blue-200 hover:text-white text-sm">My Dashboard</button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <Bell className="w-6 h-6 text-blue-600" />
              <span>Price Alerts</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Get notified when flight prices drop below your target</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Alert</span>
          </button>
        </div>

        {/* Create Alert Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-blue-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Create Price Alert</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From *</label>
                <input type="text" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value.toUpperCase() })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="LOS" maxLength={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To *</label>
                <input type="text" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value.toUpperCase() })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="LHR" maxLength={3} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Price (NGN) *</label>
                <input type="number" value={form.targetPrice} onChange={(e) => setForm({ ...form, targetPrice: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="500000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cabin Class</label>
                <select value={form.cabinClass} onChange={(e) => setForm({ ...form, cabinClass: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="ECONOMY">Economy</option>
                  <option value="PREMIUM_ECONOMY">Premium Economy</option>
                  <option value="BUSINESS">Business</option>
                  <option value="FIRST">First</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date (optional)</label>
              <input type="date" value={form.departureDate} onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="flex space-x-3">
              <button onClick={createAlert} disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
                {saving ? 'Creating...' : 'Create Alert'}
              </button>
              <button onClick={() => setShowForm(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-2 rounded-lg font-medium">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Alerts List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">No price alerts yet</h3>
            <p className="text-gray-400 mb-6">Create an alert and we'll notify you when prices drop!</p>
            <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">
              Create Your First Alert
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map(alert => (
              <div key={alert.id} className={`bg-white rounded-xl shadow-sm p-5 border ${alert.isActive ? 'border-blue-100' : 'border-gray-100 opacity-70'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${alert.isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Bell className={`w-5 h-5 ${alert.isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex items-center space-x-2 font-bold text-gray-800 text-lg">
                      <span>{alert.origin}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span>{alert.destination}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${alert.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {alert.isActive ? 'ACTIVE' : 'TRIGGERED'}
                    </span>
                    <button onClick={() => deleteAlert(alert.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Target Price</p>
                    <p className="font-bold text-blue-600">{formatPrice(alert.targetPrice)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Last Checked Price</p>
                    <p className="font-bold text-gray-700">{alert.lastPrice ? formatPrice(alert.lastPrice) : 'Not checked yet'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Cabin Class</p>
                    <p className="font-medium text-gray-700">{alert.cabinClass}</p>
                  </div>
                </div>

                {alert.departureDate && (
                  <p className="text-xs text-gray-400 mt-2">Departure: {alert.departureDate}</p>
                )}
                {alert.lastChecked && (
                  <p className="text-xs text-gray-400 mt-1">Last checked: {new Date(alert.lastChecked).toLocaleString()}</p>
                )}
                {alert.triggeredAt && (
                  <p className="text-xs text-green-600 mt-1 font-medium">Alert triggered on {new Date(alert.triggeredAt).toLocaleString()}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;