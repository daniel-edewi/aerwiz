import React, { useState, useRef, useEffect } from 'react';
import { Users, ChevronDown, Plus, Minus, UserRound, Baby } from 'lucide-react';

const PassengerSelector = ({ adults, children, infants, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const total = adults + children + infants;

  const update = (type, delta) => {
    const vals = { adults, children, infants };
    const newVal = vals[type] + delta;
    if (type === 'adults' && newVal < 1) return;
    if (type !== 'adults' && newVal < 0) return;
    if (total + delta > 9) return;
    onChange({ [type]: newVal });
  };

  const label = [
    `${adults} Adult${adults !== 1 ? 's' : ''}`,
    children > 0 ? `${children} Child${children !== 1 ? 'ren' : ''}` : null,
    infants > 0 ? `${infants} Infant${infants !== 1 ? 's' : ''}` : null,
  ].filter(Boolean).join(', ');

  const Row = ({ icon, title, subtitle, type, value }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <button type="button" onClick={() => update(type, -1)}
          disabled={type === 'adults' ? value <= 1 : value <= 0}
          className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-5 text-center font-bold text-gray-800 text-sm">{value}</span>
        <button type="button" onClick={() => update(type, 1)}
          disabled={total >= 9}
          className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 bg-white hover:border-blue-400 transition-colors">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-700 truncate">{label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-3 min-w-64">
          <Row icon={<UserRound className="w-5 h-5 text-blue-600" />} title="Adults" subtitle="Age 12+" type="adults" value={adults} />
          <Row icon={<UserRound className="w-4 h-4 text-blue-400" />} title="Children" subtitle="Age 2–11" type="children" value={children} />
          <Row icon={<Baby className="w-5 h-5 text-blue-500" />} title="Infants" subtitle="Under 2, on lap" type="infants" value={infants} />
          <div className="mt-3 pt-2 flex items-center justify-between">
            <p className="text-xs text-gray-400">Max 9 passengers total</p>
            <button type="button" onClick={() => setOpen(false)}
              className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerSelector;
