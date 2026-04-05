import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check, MessageSquare, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.aerwiz.com/api';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error('Please fill in all required fields');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/contact`, form);
      setSent(true);
      toast.success('Message sent! We\'ll get back to you within 24 hours.');
    } catch (err) {
      toast.error('Failed to send message. Please try WhatsApp or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  const info = [
    { icon: Mail,        label: 'Email Us',        value: 'support@aerwiz.com',      sub: 'We reply within 24 hours' },
    { icon: Phone,       label: 'Call / WhatsApp',  value: '+234 800 000 0000',       sub: 'Available 24/7' },
    { icon: MapPin,      label: 'Office',           value: 'Lagos, Nigeria',           sub: 'By appointment only' },
    { icon: Clock,       label: 'Support Hours',    value: '24 / 7 / 365',            sub: 'Always here for you' },
  ];

  return (
    <div className="bg-white">

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16 px-4 text-center">
        <p className="text-blue-300 text-sm font-bold uppercase tracking-widest mb-3">Get in Touch</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Contact Us</h1>
        <p className="text-blue-200 max-w-md mx-auto text-sm leading-relaxed">
          Have a question about your booking, a partnership enquiry, or just want to say hello? We'd love to hear from you.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Contact Info */}
          <div className="space-y-4">
            {info.map(item => (
              <div key={item.label} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{item.label}</p>
                  <p className="font-bold text-gray-800 text-sm mt-0.5">{item.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}

            {/* WhatsApp quick link */}
            <a
              href="https://wa.me/2348000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Message Sent!</h3>
                <p className="text-gray-500 text-sm max-w-xs">
                  Thank you for reaching out. Our team will respond to <strong>{form.email}</strong> within 24 hours.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="mt-6 text-blue-600 text-sm font-semibold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="John Smith"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="you@email.com"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Subject</label>
                    <select
                      value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    >
                      <option value="">Select a topic...</option>
                      <option value="Booking Issue">Booking Issue</option>
                      <option value="Payment Problem">Payment Problem</option>
                      <option value="Refund Request">Refund Request</option>
                      <option value="Flight Change">Flight Change</option>
                      <option value="Partnership">Partnership Enquiry</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us how we can help you..."
                      rows={5}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-60 shadow-md shadow-blue-100 text-sm"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
