import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Plus, Trash2, ShoppingBag } from 'lucide-react';

const formatPrice = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

const AIRLINES = {
  AT: { name: 'Royal Air Maroc', carry_on: 10, checked_1: 15000, checked_2: 20000, overweight_per_kg: 2000, oversize: 25000 },
  EK: { name: 'Emirates', carry_on: 0, checked_1: 0, checked_2: 25000, overweight_per_kg: 3000, oversize: 30000 },
  QR: { name: 'Qatar Airways', carry_on: 0, checked_1: 0, checked_2: 22000, overweight_per_kg: 2500, oversize: 28000 },
  ET: { name: 'Ethiopian Airlines', carry_on: 0, checked_1: 0, checked_2: 18000, overweight_per_kg: 1500, oversize: 20000 },
  KQ: { name: 'Kenya Airways', carry_on: 5000, checked_1: 12000, checked_2: 18000, overweight_per_kg: 1800, oversize: 22000 },
  LH: { name: 'Lufthansa', carry_on: 0, checked_1: 20000, checked_2: 28000, overweight_per_kg: 3500, oversize: 35000 },
  BA: { name: 'British Airways', carry_on: 0, checked_1: 18000, checked_2: 25000, overweight_per_kg: 3000, oversize: 32000 },
  TK: { name: 'Turkish Airlines', carry_on: 0, checked_1: 0, checked_2: 20000, overweight_per_kg: 2000, oversize: 25000 },
  AF: { name: 'Air France', carry_on: 0, checked_1: 22000, checked_2: 30000, overweight_per_kg: 3500, oversize: 35000 },
  MS: { name: 'EgyptAir', carry_on: 0, checked_1: 8000, checked_2: 15000, overweight_per_kg: 1200, oversize: 18000 },
};

const CABIN_ALLOWANCES = {
  ECONOMY: { carry_on_kg: 7, checked_kg: 23, checked_bags: 1 },
  PREMIUM_ECONOMY: { carry_on_kg: 10, checked_kg: 23, checked_bags: 2 },
  BUSINESS: { carry_on_kg: 14, checked_kg: 32, checked_bags: 2 },
  FIRST: { carry_on_kg: 14, checked_kg: 32, checked_bags: 3 },
};

const BaggagePage = () => {
  const navigate = useNavigate();
  const [airline, setAirline] = useState('EK');
  const [cabin, setCabin] = useState('ECONOMY');
  const [bags, setBags] = useState([{ type: 'checked', weight: 23 }]);
  const [carryOn, setCarryOn] = useState(false);

  const addBag = () => setBags([...bags, { type: 'checked', weight: 23 }]);
  const removeBag = (i) => setBags(bags.filter((_, idx) => idx !== i));
  const updateBag = (i, field, value) => {
    const updated = [...bags];
    updated[i] = { ...updated[i], [field]: value };
    setBags(updated);
  };

  const allowance = CABIN_ALLOWANCES[cabin];
  const airlineRates = AIRLINES[airline];

  const calculate = () => {
    let total = 0;
    let breakdown = [];

    // Carry-on fee
    if (carryOn && airlineRates.carry_on > 0) {
      total += airlineRates.carry_on;
      breakdown.push({ label: 'Carry-on bag fee', amount: airlineRates.carry_on });
    }

    // Checked bags
    bags.forEach((bag, i) => {
      const bagNum = i + 1;
      let bagFee = 0;
      let bagBreakdown = [];

      // Base fee
      if (bagNum === 1 && bagNum > allowance.checked_bags) {
        bagFee += airlineRates.checked_1;
        bagBreakdown.push(`Base: ${formatPrice(airlineRates.checked_1)}`);
      } else if (bagNum === 2 && bagNum > allowance.checked_bags) {
        bagFee += airlineRates.checked_2;
        bagBreakdown.push(`Base: ${formatPrice(airlineRates.checked_2)}`);
      } else if (bagNum > 2) {
        bagFee += airlineRates.checked_2 * 1.5;
        bagBreakdown.push(`Base: ${formatPrice(airlineRates.checked_2 * 1.5)}`);
      }

      // Overweight fee
      if (bag.weight > allowance.checked_kg) {
        const extraKg = bag.weight - allowance.checked_kg;
        const overweightFee = extraKg * airlineRates.overweight_per_kg;
        bagFee += overweightFee;
        bagBreakdown.push(`Overweight (${extraKg}kg): ${formatPrice(overweightFee)}`);
      }

      // Oversize fee (if weight > 32kg treat as oversize)
      if (bag.weight > 32) {
        bagFee += airlineRates.oversize;
        bagBreakdown.push(`Oversize: ${formatPrice(airlineRates.oversize)}`);
      }

      if (bagFee > 0) {
        total += bagFee;
        breakdown.push({ label: `Bag ${bagNum} (${bag.weight}kg)`, amount: bagFee, details: bagBreakdown });
      } else {
        breakdown.push({ label: `Bag ${bagNum} (${bag.weight}kg)`, amount: 0, details: ['Included in fare ✓'] });
      }
    });

    return { total, breakdown };
  };

  const { total, breakdown } = calculate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-700 text-white py-3 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <Plane className="w-5 h-5" />
            <span className="text-lg font-bold">Aerwiz</span>
          </div>
          <button onClick={() => navigate('/')} className="text-blue-200 hover:text-white text-sm">← Home</button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-3 mb-6">
          <ShoppingBag className="w-7 h-7 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Baggage Calculator</h1>
            <p className="text-gray-500 text-sm">Estimate your baggage fees before you fly</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left - Inputs */}
          <div className="space-y-4">
            {/* Airline & Cabin */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-4">Flight Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Airline</label>
                  <select value={airline} onChange={(e) => setAirline(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    {Object.entries(AIRLINES).map(([code, info]) => (
                      <option key={code} value={code}>{info.name} ({code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cabin Class</label>
                  <select value={cabin} onChange={(e) => setCabin(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="ECONOMY">Economy</option>
                    <option value="PREMIUM_ECONOMY">Premium Economy</option>
                    <option value="BUSINESS">Business</option>
                    <option value="FIRST">First Class</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Allowance Info */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="font-bold text-blue-800 text-sm mb-3">Your Free Allowance</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white rounded-lg p-2">
                  <p className="text-lg font-bold text-blue-600">{allowance.carry_on_kg}kg</p>
                  <p className="text-xs text-gray-500">Carry-on</p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-lg font-bold text-blue-600">{allowance.checked_bags}</p>
                  <p className="text-xs text-gray-500">Free bags</p>
                </div>
                <div className="bg-white rounded-lg p-2">
                  <p className="text-lg font-bold text-blue-600">{allowance.checked_kg}kg</p>
                  <p className="text-xs text-gray-500">Per bag</p>
                </div>
              </div>
            </div>

            {/* Carry-on */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-3">Carry-on Bag</h2>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={carryOn} onChange={(e) => setCarryOn(e.target.checked)}
                  className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">I have a carry-on bag</p>
                  <p className="text-xs text-gray-400">Max {allowance.carry_on_kg}kg allowed free</p>
                </div>
                {airlineRates.carry_on > 0 && (
                  <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                    +{formatPrice(airlineRates.carry_on)}
                  </span>
                )}
                {airlineRates.carry_on === 0 && (
                  <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Free</span>
                )}
              </label>
            </div>

            {/* Checked Bags */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800">Checked Bags</h2>
                <button onClick={addBag} disabled={bags.length >= 5}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-40">
                  <Plus className="w-4 h-4" />
                  <span>Add Bag</span>
                </button>
              </div>
              <div className="space-y-3">
                {bags.map((bag, i) => (
                  <div key={i} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl">🧳</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Bag {i + 1}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <input type="range" min={1} max={50} value={bag.weight}
                          onChange={(e) => updateBag(i, 'weight', parseInt(e.target.value))}
                          className="flex-1 h-2 accent-blue-600" />
                        <span className="text-sm font-bold text-gray-700 w-12 text-right">{bag.weight}kg</span>
                      </div>
                      {bag.weight > allowance.checked_kg && (
                        <p className="text-xs text-orange-500 mt-1">⚠️ {bag.weight - allowance.checked_kg}kg overweight</p>
                      )}
                      {bag.weight > 32 && (
                        <p className="text-xs text-red-500">⚠️ Oversize bag</p>
                      )}
                    </div>
                    {bags.length > 1 && (
                      <button onClick={() => removeBag(i)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Results */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-4">
              <h2 className="font-bold text-gray-800 mb-4">Fee Breakdown</h2>

              <div className="space-y-3 mb-4">
                {breakdown.map((item, i) => (
                  <div key={i} className={`rounded-lg p-3 ${item.amount > 0 ? 'bg-orange-50' : 'bg-green-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <span className={`text-sm font-bold ${item.amount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        {item.amount > 0 ? formatPrice(item.amount) : 'Free ✓'}
                      </span>
                    </div>
                    {item.details && (
                      <div className="mt-1 space-y-0.5">
                        {item.details.map((d, j) => (
                          <p key={j} className="text-xs text-gray-500">{d}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {carryOn && airlineRates.carry_on === 0 && (
                  <div className="bg-green-50 rounded-lg p-3 flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Carry-on bag</span>
                    <span className="text-sm font-bold text-green-600">Free ✓</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-gray-800">Total Baggage Fees</span>
                  <span className={`text-2xl font-bold ${total > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {total > 0 ? formatPrice(total) : 'Free!'}
                  </span>
                </div>

                {total > 0 ? (
                  <div className="bg-orange-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-orange-700">💡 <strong>Tip:</strong> Pack lighter or upgrade your cabin class to reduce baggage fees.</p>
                  </div>
                ) : (
                  <div className="bg-green-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-green-700">Your bags are within the free allowance!</p>
                  </div>
                )}

                <button onClick={() => navigate('/')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
                  Search Flights
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaggagePage;