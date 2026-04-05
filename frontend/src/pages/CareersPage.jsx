import React, { useState } from 'react';
import { MapPin, Clock, Briefcase, ArrowRight, Users, Zap, Heart } from 'lucide-react';

const JOBS = [
  { id: 1, title: 'Senior Frontend Engineer', dept: 'Engineering', location: 'Lagos / Remote', type: 'Full-time', level: 'Senior', desc: 'Build and maintain the Aerwiz customer-facing web app using React, Tailwind CSS and modern frontend tooling.' },
  { id: 2, title: 'Backend Engineer (Node.js)', dept: 'Engineering', location: 'Lagos / Remote', type: 'Full-time', level: 'Mid-Senior', desc: 'Design and scale our booking APIs, payment integrations, and Amadeus GDS connectivity.' },
  { id: 3, title: 'Customer Success Agent', dept: 'Support', location: 'Lagos, Nigeria', type: 'Full-time', level: 'Entry', desc: 'Help our customers resolve booking issues, flight changes, and refund requests via chat, email and phone.' },
  { id: 4, title: 'Digital Marketing Manager', dept: 'Marketing', location: 'Lagos / Remote', type: 'Full-time', level: 'Mid', desc: 'Drive customer acquisition through SEO, paid ads, email campaigns and social media across Nigeria and Africa.' },
  { id: 5, title: 'Travel Partnerships Manager', dept: 'Partnerships', location: 'Lagos, Nigeria', type: 'Full-time', level: 'Mid-Senior', desc: 'Build and manage relationships with airlines, travel agencies, and corporate clients across West Africa.' },
  { id: 6, title: 'Product Designer (UI/UX)', dept: 'Design', location: 'Remote', type: 'Full-time', level: 'Mid', desc: 'Design intuitive, beautiful travel experiences that work for every Nigerian — from first-time bookers to frequent flyers.' },
];

const DEPT_COLORS = {
  Engineering: 'bg-blue-100 text-blue-700',
  Support: 'bg-green-100 text-green-700',
  Marketing: 'bg-pink-100 text-pink-700',
  Partnerships: 'bg-purple-100 text-purple-700',
  Design: 'bg-orange-100 text-orange-700',
};

const CareersPage = () => {
  const [selected, setSelected] = useState(null);
  const [dept, setDept] = useState('All');
  const depts = ['All', ...new Set(JOBS.map(j => j.dept))];
  const filtered = dept === 'All' ? JOBS : JOBS.filter(j => j.dept === dept);

  const perks = [
    { icon: Zap, title: 'Remote-friendly', desc: 'Most roles can be done from anywhere in Africa.' },
    { icon: Heart, title: 'Health coverage', desc: 'Full HMO for you and your dependants.' },
    { icon: Users, title: 'Great team', desc: 'Work with people who genuinely care about the mission.' },
    { icon: Briefcase, title: 'Competitive pay', desc: 'Market-rate salaries benchmarked against top Nigerian tech companies.' },
  ];

  return (
    <div className="bg-white">

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16 px-4 text-center">
        <p className="text-blue-300 text-sm font-bold uppercase tracking-widest mb-3">Work With Us</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Join the Aerwiz Team</h1>
        <p className="text-blue-200 max-w-md mx-auto text-sm leading-relaxed">
          We're building the future of travel in Africa. If you're passionate about solving real problems for real people, we want to meet you.
        </p>
      </div>

      {/* Perks */}
      <div className="bg-gray-50 py-12 px-4 border-b border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {perks.map(p => (
            <div key={p.title} className="text-center p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <p.icon className="w-5 h-5 text-blue-600" />
              </div>
              <p className="font-bold text-gray-800 text-sm mb-1">{p.title}</p>
              <p className="text-gray-400 text-xs leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Job listings */}
      <div className="max-w-5xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Open Positions</h2>
            <p className="text-gray-400 text-sm mt-1">{filtered.length} role{filtered.length !== 1 ? 's' : ''} available</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {depts.map(d => (
              <button
                key={d}
                onClick={() => setDept(d)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${dept === d ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map(job => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div
                className="p-5 sm:p-6 cursor-pointer"
                onClick={() => setSelected(selected === job.id ? null : job.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${DEPT_COLORS[job.dept]}`}>{job.dept}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{job.level}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.type}</span>
                    </div>
                  </div>
                  <ArrowRight className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform mt-1 ${selected === job.id ? 'rotate-90' : ''}`} />
                </div>

                {selected === job.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-600 text-sm leading-relaxed mb-5">{job.desc}</p>
                    <a
                      href={`mailto:careers@aerwiz.com?subject=Application: ${job.title}`}
                      className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
                    >
                      <span>Apply for this role</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <p className="text-xs text-gray-400 mt-2">Send your CV to careers@aerwiz.com</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No openings CTA */}
        <div className="mt-10 text-center bg-blue-50 rounded-2xl p-8 border border-blue-100">
          <p className="font-bold text-gray-800 mb-1">Don't see a role that fits?</p>
          <p className="text-gray-500 text-sm mb-4">We're always looking for exceptional people. Send us your CV anyway.</p>
          <a
            href="mailto:careers@aerwiz.com"
            className="inline-block bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-colors"
          >
            Send Speculative Application
          </a>
        </div>
      </div>
    </div>
  );
};

export default CareersPage;
