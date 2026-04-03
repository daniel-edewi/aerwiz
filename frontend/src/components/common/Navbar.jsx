import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Plane, Menu, X, ChevronDown, Bell, LogOut, Settings, FileSearch, Luggage, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setUserMenuOpen(false);
  };

  const handleManageBooking = () => {
    if (location.pathname === '/') {
      const el = document.getElementById('manage-booking-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById('manage-booking-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
    setMenuOpen(false);
  };

  const navLinks = [
    { label: 'Flights',        action: () => { navigate('/');        setMenuOpen(false); }, icon: Plane       },
    { label: 'Manage Booking', action: handleManageBooking,                                  icon: FileSearch  },
    { label: 'Baggage',        action: () => { navigate('/baggage'); setMenuOpen(false); }, icon: Luggage     },
    { label: 'Price Alerts',   action: () => { navigate('/alerts');  setMenuOpen(false); }, icon: Bell        },
  ];

  // Announcement messages — no emojis
  const announcements = [
    'Transparent pricing — no hidden fees, no surprises.',
    'Secure checkout — bank-grade SSL on every transaction.',
    'Instant confirmations — your e-ticket delivered immediately.',
    '24/7 Support: Call or WhatsApp +234 800 000 0000',
  ];

  return (
    <div className="sticky top-0 z-50">

      {/* ── Announcement Bar ── */}
      <div className="bg-blue-700 text-white py-2 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {/* Duplicate 3× so the scroll looks seamless */}
          {[...Array(3)].map((_, i) => (
            <span key={i} className="inline-flex items-center gap-10 px-6 text-xs sm:text-sm font-medium tracking-wide">
              {announcements.map((msg, j) => (
                <span key={j} className="flex items-center gap-2">
                  {/* Subtle dot separator before each item */}
                  <span className="w-1 h-1 rounded-full bg-blue-300 flex-shrink-0"></span>
                  <span>{msg}</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── Main Header ── */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div
              className="flex items-center space-x-2 cursor-pointer flex-shrink-0"
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <Plane className="text-white w-4 h-4" />
              </div>
              <span className="text-blue-700 text-xl font-extrabold tracking-tight">Aerwiz</span>
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map(link => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 px-3 py-2 rounded-xl transition-colors"
                  >
                    <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user?.firstName}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
                          <p className="text-sm font-bold text-gray-800">{user?.firstName} {user?.lastName}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          {[
                            { label: 'My Bookings',      icon: Plane,    path: '/dashboard' },
                            { label: 'Price Alerts',     icon: Bell,     path: '/alerts'    },
                            { label: 'Account Settings', icon: Settings, path: '/dashboard' },
                            ...(user?.role === 'ADMIN'
                              ? [{ label: 'Admin Panel', icon: Settings, path: '/admin' }]
                              : []),
                          ].map(item => (
                            <button
                              key={item.label}
                              onClick={() => { navigate(item.path); setUserMenuOpen(false); }}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <item.icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </button>
                          ))}
                          <div className="border-t border-gray-100 mt-1">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-gray-600 hover:text-blue-600 font-medium text-sm px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* ── Mobile Menu ── */}
          {menuOpen && (
            <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
              {navLinks.map(link => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              ))}

              {/* Support line in mobile menu */}
              <a
                href="tel:+2348000000000"
                className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>+234 800 000 0000</span>
              </a>

              {!isAuthenticated && (
                <div className="flex space-x-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => { navigate('/login'); setMenuOpen(false); }}
                    className="flex-1 text-center py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { navigate('/register'); setMenuOpen(false); }}
                    className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {isAuthenticated && (
                <div className="pt-2 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

export default Navbar;