import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, Plane, CheckCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.aerwiz.com/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError('Please enter your email address');
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8 cursor-pointer" onClick={() => navigate('/')}>
          <svg viewBox="0 0 800 300" height="48" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
            <text x="400" y="210" textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="160" fontWeight="800" letterSpacing="-5">
              <tspan fill="white">aer</tspan>
              <tspan fill="#93c5fd">wiz</tspan>
            </text>
          </svg>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {!sent ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Forgot Password?</h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                  No worries. Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </form>

              <button
                onClick={() => navigate('/login')}
                className="w-full mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Check your email</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-2">
                We sent a password reset link to
              </p>
              <p className="font-bold text-blue-600 text-sm mb-6">{email}</p>
              <p className="text-xs text-gray-400 mb-8">
                The link expires in 1 hour. If you don't see it, check your spam folder.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors"
              >
                Back to Login
              </button>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="w-full mt-3 text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors"
              >
                Try a different email
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-blue-300 text-xs mt-6">
          © 2026 Aerwiz. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
