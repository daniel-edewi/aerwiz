import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-blue-900 text-white pt-12 pb-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Plane className="text-blue-700 w-5 h-5" />
              </div>
              <span className="text-xl font-bold">Aerwiz</span>
            </div>
            <p className="text-blue-300 text-sm leading-relaxed mb-4">
              Your trusted platform for booking flights across Africa and the world at the best prices.
            </p>
            <div className="flex space-x-3">
              {[
                { icon: Facebook, label: 'Facebook' },
                { icon: Twitter, label: 'Twitter' },
                { icon: Instagram, label: 'Instagram' },
                { icon: Linkedin, label: 'LinkedIn' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center hover:bg-blue-700 cursor-pointer transition-colors">
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
                { label: 'Search Flights', action: () => navigate('/') },
                { label: 'Manage Booking', action: () => navigate('/') },
                { label: 'Price Alerts', action: () => navigate('/alerts') },
                { label: 'Baggage Calculator', action: () => navigate('/baggage') },
                { label: 'Seat Selection', action: () => navigate('/') },
              ].map(item => (
                <li key={item.label}
                  onClick={item.action}
                  className="hover:text-white cursor-pointer transition-colors">{item.label}</li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-blue-300 text-sm">
              {['About Us', 'Contact Us', 'Careers', 'Blog', 'Become an Affiliate'].map(item => (
                <li key={item} className="hover:text-white cursor-pointer transition-colors">{item}</li>
              ))}
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-blue-300 text-sm mb-5">
              {['Privacy Policy', 'Terms & Conditions', 'Cookie Policy', 'Refund Policy'].map(item => (
                <li key={item} className="hover:text-white cursor-pointer transition-colors">{item}</li>
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