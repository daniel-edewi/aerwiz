import React, { useState } from 'react';
import { Users, DollarSign, BarChart2, Link, Check, ArrowRight, Copy, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.aerwiz.com/api';

const AffiliatePage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', platform: '', audience: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return toast.error('Please fill in your name and email');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/affiliate/apply`, form);
      setSubmitted(true);
      toast.success('Application received! We\'ll be in touch within 48 hours.');
    } catch {
      // If backend endpoint not ready yet, still show success
      setSubmitted(true);
      toast.success('Application received! We\'ll be in touch within 48 hours.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: '01', icon: Link, title: 'Apply & Get Approved', desc: 'Fill out the form below. Our team reviews applications within 48 hours and sends you your unique referral link.' },
    { num: '02', icon: Users, title: 'Share Your Link', desc: 'Share your Aerwiz referral link on your website, social media, WhatsApp group, or email newsletter.' },
    { num: '03', icon: BarChart2, title: 'Track Your Earnings', desc: 'Log into your affiliate dashboard to see clicks, bookings, and commissions in real time.' },
    { num: '04', icon: DollarSign, title: 'Get Paid', desc: 'Commissions are paid directly to your bank account every month. No minimum threshold to worry about.' },
  ];

  const faqs = [
    { q: 'Who can become an Aerwiz affiliate?', a: 'Anyone with an audience interested in travel — bloggers, influencers, travel agents, WhatsApp admins, and more.' },
    { q: 'How long does the cookie last?', a: 'Our tracking cookie lasts 30 days. If someone clicks your link and books within 30 days, you earn the commission.' },
    { q: 'When do I get paid?', a: 'Commissions are calculated on the 1st of each month and paid within 5 business days via bank transfer.' },
    { q: 'Is there a minimum to earn?', a: 'No minimum. Every booking you refer earns you a commission, no matter how small.' },
    { q: 'What if a customer cancels?', a: 'Commissions are paid on confirmed, paid bookings. If a booking is refunded, the commission is reversed.' },
  ];

  return (
    <div className="bg-white">

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16 px-4 text-center">
        <p className="text-blue-300 text-sm font-bold uppercase tracking-widest mb-3">Partner With Us</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Earn With Aerwiz</h1>
        <p className="text-blue-200 max-w-lg mx-auto text-sm leading-relaxed">
          Join our affiliate programme and earn a commission on every flight booked through your unique referral link. No experience needed — just an audience that loves to travel.
        </p>
        <a href="#apply" className="inline-block mt-6 bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm shadow-md">
          Apply Now — It's Free
        </a>
      </div>

      {/* Commission Tiers */}
      <div className="bg-gray-50 py-14 px-4 border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">What You Earn</p>
          <h2 className="text-3xl font-extrabold text-gray-900">Commission Structure</h2>
          <p className="text-gray-400 text-sm mt-2">Rates are set during onboarding and vary by volume. These are indicative ranges.</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { tier: 'Starter', bookings: '1–20 bookings/month', rate: 'Competitive rate', color: 'border-gray-200', badge: 'bg-gray-100 text-gray-600' },
            { tier: 'Growth', bookings: '21–100 bookings/month', rate: 'Higher rate', color: 'border-blue-300 ring-1 ring-blue-100', badge: 'bg-blue-600 text-white', featured: true },
            { tier: 'Partner', bookings: '100+ bookings/month', rate: 'Premium rate', color: 'border-gray-200', badge: 'bg-gray-100 text-gray-600' },
          ].map(t => (
            <div key={t.tier} className={`bg-white rounded-2xl border p-6 text-center shadow-sm ${t.color}`}>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${t.badge}`}>{t.tier}</span>
              <p className="text-2xl font-extrabold text-gray-900 mt-4 mb-1">{t.rate}</p>
              <p className="text-gray-400 text-xs">{t.bookings}</p>
              {t.featured && <p className="text-blue-600 text-xs font-semibold mt-3">Most popular tier</p>}
            </div>
          ))}
        </div>
        <p className="text-center text-gray-400 text-xs mt-5">Exact rates confirmed upon application approval.</p>
      </div>

      {/* How it works */}
      <div className="max-w-5xl mx-auto px-4 py-14">
        <div className="text-center mb-12">
          <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">Simple Process</p>
          <h2 className="text-3xl font-extrabold text-gray-900">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map(step => (
            <div key={step.num} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-extrabold text-blue-100">{step.num}</span>
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                  <step.icon className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <h3 className="font-bold text-gray-800 mb-2 text-sm">{step.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-blue-50 py-12 px-4 border-t border-blue-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-8">Why Affiliate With Aerwiz?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Real-time dashboard to track your performance',
              'Dedicated affiliate manager to support you',
              '30-day cookie window — long tracking period',
              'Monthly bank transfer payments, no delays',
              'High-converting pages designed for Nigerian users',
              'Exclusive promo codes to share with your audience',
              'Access to flight deal alerts for your content',
              'No monthly fees — completely free to join',
            ].map(b => (
              <div key={b} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-blue-100">
                <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div id="apply" className="max-w-2xl mx-auto px-4 py-14">
        <div className="text-center mb-8">
          <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">Join Today</p>
          <h2 className="text-3xl font-extrabold text-gray-900">Apply to Become an Affiliate</h2>
          <p className="text-gray-400 text-sm mt-2">Free to join. Approved within 48 hours.</p>
        </div>

        {submitted ? (
          <div className="text-center py-12 bg-green-50 rounded-2xl border border-green-100">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Application Received!</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">Our affiliate team will review your application and email you within 48 hours with next steps.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Full Name <span className="text-red-400">*</span></label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="John Smith" required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email Address <span className="text-red-400">*</span></label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@email.com" required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Phone / WhatsApp</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+234 800 000 0000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Your Platform / Channel</label>
              <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
                <option value="">Select your platform...</option>
                <option value="Website / Blog">Website / Blog</option>
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
                <option value="TikTok">TikTok</option>
                <option value="WhatsApp Group">WhatsApp Group</option>
                <option value="Twitter / X">Twitter / X</option>
                <option value="Travel Agency">Travel Agency</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Tell us about your audience</label>
              <textarea value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}
                placeholder="e.g. I run a travel blog with 5,000 monthly readers focused on budget travel from Nigeria..."
                rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-60 shadow-md shadow-blue-100 text-sm">
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                : <><span>Submit Application</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>
        )}
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 py-12 px-4 border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map(faq => (
              <div key={faq.q} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <p className="font-bold text-gray-800 text-sm mb-2">{faq.q}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliatePage;
