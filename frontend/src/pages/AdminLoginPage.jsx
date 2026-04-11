import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Shield, Mail, Lock, Eye, EyeOff, Plane, AlertTriangle } from 'lucide-react';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  // If already logged in as admin, redirect straight to admin panel
  React.useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      navigate('/admin');
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.login(form);
      const { user: loggedInUser, token: accessToken } = response.data.data;

      if (loggedInUser.role !== 'ADMIN') {
        toast.error('Access denied. Admin accounts only.');
        setLoading(false);
        return;
      }

      login(loggedInUser, accessToken);
      toast.success(`Welcome, Admin ${loggedInUser.firstName}!`);
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">

      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-800 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Plane className="text-white w-5 h-5" />
            </div>
            <span className="text-white text-2xl font-bold">Aerwiz</span>
          </div>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Admin Portal</h1>
          </div>
          <p className="text-gray-400 text-sm">Restricted access — authorized personnel only</p>
        </div>

        {/* Warning Banner */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 mb-6 flex items-start space-x-3">
          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-400 text-xs leading-relaxed">
            This portal is for Aerwiz administrators only. Unauthorized access attempts are logged and monitored.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-white font-bold text-lg mb-6">Sign in to Admin Panel</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@aerwiz.com"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl pl-10 pr-12 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 mt-2"
            >
              {loading ? (
                <span className="inline-flex items-center space-x-2">
                  <span className="relative flex items-center justify-center w-5 h-5">
                    <span className="animate-spin absolute w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                    <Shield className="w-2.5 h-2.5 text-white" />
                  </span>
                  <span>Authenticating...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Access Admin Panel</span>
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="border-t border-gray-800 mt-6 pt-5 text-center">
            <p className="text-gray-500 text-xs">
              Not an admin?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Go to regular login
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-xs">
            © 2026 Aerwiz · Admin Portal v1.0
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-400 text-xs mt-1 transition-colors"
          >
            ← Back to main site
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminLoginPage;