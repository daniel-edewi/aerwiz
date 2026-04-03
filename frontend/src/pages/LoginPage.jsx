import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Plane, Mail, Lock, Eye, EyeOff, ArrowRight, MapPin, DollarSign, Flag, Shield } from 'lucide-react';

const AirplaneLoader = () => (
  <span className="inline-flex items-center space-x-2">
    <span className="relative flex items-center justify-center w-5 h-5">
      <span className="animate-spin absolute w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
      <Plane className="w-2.5 h-2.5 text-white" />
    </span>
    <span>Signing in...</span>
  </span>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.login(form);
      const { user, accessToken } = response.data.data;
      login(user, accessToken);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80"
          alt="Aircraft"
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=1200&q=80'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-blue-600/60"></div>
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
              <Plane className="text-blue-600 w-5 h-5" />
            </div>
            <span className="text-white text-2xl font-bold">Aerwiz</span>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Fly Anywhere,<br />Anytime
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Access the best flight deals across Africa and the world. Book in minutes, pay in Naira.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Plane className="w-4 h-4 text-white" />, label: '500+ Destinations' },
                { icon: <DollarSign className="w-4 h-4 text-white" />, label: 'Best Price Guarantee' },
                { icon: <Flag className="w-4 h-4 text-white" />, label: 'Pay in Naira' },
                { icon: <Shield className="w-4 h-4 text-white" />, label: 'Secure Booking' },
              ].map(f => (
                <div key={f.label} className="flex items-center space-x-2 bg-white/10 rounded-xl px-3 py-2">
                  {f.icon}
                  <span className="text-white text-sm font-medium">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-blue-200 text-sm">© 2026 Aerwiz. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center space-x-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Plane className="text-white w-5 h-5" />
            </div>
            <span className="text-blue-700 text-2xl font-bold">Aerwiz</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-500">Sign in to manage your bookings and access exclusive deals</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
                <span className="text-xs text-blue-600 hover:underline cursor-pointer font-medium">Forgot password?</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-11 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center space-x-2 shadow-lg shadow-blue-200 text-sm">
              {loading ? <AirplaneLoader /> : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center space-x-3 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Guest Option */}
          <button onClick={() => navigate('/')}
            className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm flex items-center justify-center space-x-2">
            <Plane className="w-4 h-4 text-blue-500" />
            <span>Continue as Guest</span>
          </button>

          <p className="text-center text-gray-500 mt-6 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:underline">Create account</Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center space-x-1">
            <Lock className="w-3 h-3" />
            <span>Your data is protected with SSL encryption</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;