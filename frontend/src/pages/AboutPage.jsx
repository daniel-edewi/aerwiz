import React from 'react';
import { Shield, Globe, Zap, Users, Award, Heart } from 'lucide-react';

const AboutPage = () => {
  const values = [
    { icon: Shield, title: 'Transparency', desc: 'No hidden fees. No surprise charges. The price you see is exactly what you pay.' },
    { icon: Zap, title: 'Speed', desc: 'From search to booking in under 2 minutes. We respect your time.' },
    { icon: Globe, title: 'Accessibility', desc: 'World-class flight booking built for Nigerians. Pay in Naira, fly anywhere.' },
    { icon: Heart, title: 'Customer First', desc: '24/7 support. Real humans who care about getting you to your destination.' },
    { icon: Award, title: 'Best Price', desc: 'We search hundreds of airlines simultaneously so you always get the lowest fare.' },
    { icon: Users, title: 'Community', desc: 'Built in Nigeria, for Nigeria. Every booking supports local tech and travel jobs.' },
  ];

  const team = [
    { name: 'Daniel Edewi', role: 'Founder & CEO', initials: 'DE', color: 'bg-blue-600' },
    { name: 'Operations Lead', role: 'Head of Operations', initials: 'OL', color: 'bg-green-600' },
    { name: 'Tech Lead', role: 'Head of Engineering', initials: 'TL', color: 'bg-purple-600' },
    { name: 'Customer Success', role: 'Head of Support', initials: 'CS', color: 'bg-orange-500' },
  ];

  return (
    <div className="bg-white">

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-4">Our Story</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight">
            We built Aerwiz because<br />booking flights shouldn't be hard
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
            Millions of Nigerians overpay for flights every year — through agents, hidden fees, and outdated booking systems. Aerwiz was built to change that. Direct access to global fares, transparent pricing, and a booking experience that actually works.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="py-16 px-4 border-b border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">Our Mission</p>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
              Make world-class travel accessible to every Nigerian
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              Aerwiz connects travellers directly to global airlines through the Amadeus GDS — the same system used by the world's largest travel agencies. No middlemen. No markups. Just the best available fare, every time.
            </p>
            <p className="text-gray-500 leading-relaxed">
              We handle everything from search to e-ticket delivery, with Naira payments powered by Paystack. Whether you're flying Lagos to London or Abuja to Dubai, Aerwiz has you covered.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: '500+', label: 'Destinations' },
              { num: '100+', label: 'Airlines' },
              { num: '24/7', label: 'Support' },
              { num: '₦0', label: 'Hidden Fees' },
            ].map(stat => (
              <div key={stat.label} className="bg-blue-50 rounded-2xl p-6 text-center border border-blue-100">
                <p className="text-3xl font-extrabold text-blue-600 mb-1">{stat.num}</p>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">What We Stand For</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <v.icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">The People</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Meet the Team</h2>
            <p className="text-gray-500 mt-3 max-w-md mx-auto text-sm">A small, passionate team on a mission to fix travel in Africa.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {team.map(member => (
              <div key={member.name} className="text-center">
                <div className={`w-16 h-16 ${member.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm`}>
                  <span className="text-white font-extrabold text-lg">{member.initials}</span>
                </div>
                <p className="font-bold text-gray-800 text-sm">{member.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-700 py-14 px-4 text-center text-white">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Ready to fly smarter?</h2>
        <p className="text-blue-200 mb-6 text-sm">Book your next flight with Aerwiz and experience the difference.</p>
        <a href="/" className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm shadow-md">
          Search Flights
        </a>
      </div>
    </div>
  );
};

export default AboutPage;
