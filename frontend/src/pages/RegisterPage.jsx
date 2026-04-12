import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Plane, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, Check } from 'lucide-react';

const AirplaneLoader = () => (
  <span className="inline-flex items-center space-x-2">
    <span className="relative flex items-center justify-center w-5 h-5">
      <span className="animate-spin absolute w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
      <Plane className="w-2.5 h-2.5 text-white" />
    </span>
    <span>Creating account...</span>
  </span>
);

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: ''
  });

  const passwordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
      { score: 1, label: 'Weak', color: 'bg-red-400' },
      { score: 2, label: 'Fair', color: 'bg-orange-400' },
      { score: 3, label: 'Good', color: 'bg-yellow-400' },
      { score: 4, label: 'Strong', color: 'bg-green-500' },
    ];
    return levels[score - 1] || { score: 0, label: '', color: '' };
  };

  const strength = passwordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      const response = await authAPI.register(form);
      const { user, token: accessToken } = response.data.data;
      login(user, accessToken);
      toast.success(`Welcome to Aerwiz, ${user.firstName}!`);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80"
          alt="Travel"
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80'; }}
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
              Join Millions of<br />Happy Travelers
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Create your free account and start booking flights at the best prices today.
            </p>
            <div className="space-y-3">
              {[
                'Free to join — no hidden fees',
                'Manage all your bookings in one place',
                'Get price alerts for your favorite routes',
                'Exclusive member deals and promo codes',
              ].map(benefit => (
                <div key={benefit} className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-blue-200 text-sm">© 2026 Aerwiz. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center space-x-2 mb-6 lg:hidden">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Plane className="text-white w-5 h-5" />
            </div>
            <span className="text-blue-700 text-2xl font-bold">Aerwiz</span>
          </div>

          <div className="mb-7">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-500">Start booking flights at the best prices today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">First Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                    placeholder="Daniel" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Last Name</label>
                <input type="text" value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  placeholder="Edewi" required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  placeholder="your@email.com" required />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  placeholder="+234 800 000 0000" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-11 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  placeholder="Min. 8 characters" required minLength={8} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password Strength */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex space-x-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.score ? strength.color : 'bg-gray-200'}`}></div>
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strength.score >= 3 ? 'text-green-600' : strength.score >= 2 ? 'text-orange-500' : 'text-red-500'}`}>
                    {strength.label} password
                  </p>
                </div>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center space-x-2 shadow-lg shadow-blue-200 text-sm mt-2">
              {loading ? <AirplaneLoader /> : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center space-x-3 my-5">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Guest */}
          <button onClick={() => navigate('/')}
            className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm flex items-center justify-center space-x-2">
            <Plane className="w-4 h-4 text-blue-500" />
            <span>Continue as Guest</span>
          </button>

          <p className="text-center text-gray-500 mt-5 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign in</Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center space-x-1">
            <Lock className="w-3 h-3" />
            <span>Your data is protected with SSL encryption</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;