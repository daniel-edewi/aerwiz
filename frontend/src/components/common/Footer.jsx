import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-blue-900 text-white pt-12 pb-6 px-4">
      <div className="max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div>
            <div className="mb-4 cursor-pointer inline-block" onClick={() => navigate('/')}>
              <svg viewBox="0 0 800 300" height="48" xmlns="http://www.w3.org/2000/svg" aria-label="Aerwiz">
                <text x="400" y="200" textAnchor="middle"
                  fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
                  fontSize="160" fontWeight="800" letterSpacing="-5">
                  <tspan fill="white">aer</tspan>
                  <tspan fill="#93c5fd">wiz</tspan>
                </text>
              </svg>
            </div>
            <p className="text-blue-300 text-sm leading-relaxed mb-4">
              Your trusted platform for booking flights across Africa and the world at the best prices.
            </p>
            <div className="flex space-x-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <div key={i} className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center hover:bg-blue-700 cursor-pointer transition-colors">
                  <Icon className="w-4 h-4 text-blue-300" />
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-white mb-4">Services</h4>
            <ul className="space-y-2 text-blue-300 text-sm">
              {[
                { label: 'Search Flights',     action: () => navigate('/') },
                { label: 'Manage Booking',     action: () => { navigate('/'); setTimeout(() => { const el = document.getElementById('manage-booking-section'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 300); }},
                { label: 'Price Alerts',       action: () => navigate('/alerts') },
                { label: 'Baggage Calculator', action: () => navigate('/baggage') },
                { label: 'Seat Selection',     action: () => navigate('/') },
              ].map(item => (
                <li key={item.label} onClick={item.action} className="hover:text-white cursor-pointer transition-colors">
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-blue-300 text-sm">
              {[
                { label: 'About Us',            path: '/about' },
                { label: 'Contact Us',          path: '/contact' },
                { label: 'Careers',             path: '/careers' },
                { label: 'Blog',                path: '/blog' },
                { label: 'Become an Affiliate', path: '/affiliate' },
              ].map(item => (
                <li key={item.label} onClick={() => navigate(item.path)} className="hover:text-white cursor-pointer transition-colors">
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-blue-300 text-sm mb-5">
              {[
                { label: 'Privacy Policy',     path: '/privacy' },
                { label: 'Terms & Conditions', path: '/terms' },
                { label: 'Cookie Policy',      path: '/cookies' },
                { label: 'Refund Policy',      path: '/refund' },
              ].map(item => (
                <li key={item.label} onClick={() => navigate(item.path)} className="hover:text-white cursor-pointer transition-colors">
                  {item.label}
                </li>
              ))}
            </ul>
            <h4 className="font-bold text-white mb-3">Contact</h4>
            <div className="space-y-2 text-blue-300 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                <span>+234 800 000 0000</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span>support@aerwiz.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-blue-400 text-xs gap-2">
          <p>© 2026 Aerwiz. All Rights Reserved.</p>
          <p>Powered by Amadeus · Payments by Paystack</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;