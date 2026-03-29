import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { bookingsAPI, paymentsAPI } from '../services/api';
import useFlightStore from '../store/flightStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Plane, ChevronDown, Tag, Plus, Trash2, Clock, AlertCircle, Luggage, Info } from 'lucide-react';

const formatPrice = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const formatDuration = (dur) => dur?.replace('PT', '').replace('H', 'h ').replace('M', 'm') || '';

const COUNTRIES = [
  { code: 'NG', name: 'Nigeria' }, { code: 'GH', name: 'Ghana' }, { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' }, { code: 'ET', name: 'Ethiopia' }, { code: 'EG', name: 'Egypt' },
  { code: 'GB', name: 'United Kingdom' }, { code: 'US', name: 'United States' }, { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' }, { code: 'DE', code2: 'DE', name: 'Germany' }, { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' }, { code: 'ES', name: 'Spain' }, { code: 'NL', name: 'Netherlands' },
  { code: 'AE', name: 'United Arab Emirates' }, { code: 'QA', name: 'Qatar' }, { code: 'SA', name: 'Saudi Arabia' },
  { code: 'IN', name: 'India' }, { code: 'CN', name: 'China' }, { code: 'JP', name: 'Japan' },
  { code: 'BR', name: 'Brazil' }, { code: 'MX', name: 'Mexico' }, { code: 'SN', name: 'Senegal' },
  { code: 'CI', name: "Côte d'Ivoire" }, { code: 'CM', name: 'Cameroon' }, { code: 'TZ', name: 'Tanzania' },
  { code: 'UG', name: 'Uganda' }, { code: 'RW', name: 'Rwanda' }, { code: 'MA', name: 'Morocco' },
  { code: 'TN', name: 'Tunisia' }, { code: 'DZ', name: 'Algeria' }, { code: 'LY', name: 'Libya' },
  { code: 'SO', name: 'Somalia' }, { code: 'SD', name: 'Sudan' }, { code: 'CD', name: 'DR Congo' },
  { code: 'AO', name: 'Angola' }, { code: 'ZM', name: 'Zambia' }, { code: 'ZW', name: 'Zimbabwe' },
  { code: 'BW', name: 'Botswana' }, { code: 'MZ', name: 'Mozambique' }, { code: 'MG', name: 'Madagascar' },
  { code: 'TR', name: 'Turkey' }, { code: 'PK', name: 'Pakistan' }, { code: 'BD', name: 'Bangladesh' },
  { code: 'SG', name: 'Singapore' }, { code: 'MY', name: 'Malaysia' }, { code: 'TH', name: 'Thailand' },
  { code: 'ID', name: 'Indonesia' }, { code: 'PH', name: 'Philippines' }, { code: 'KR', name: 'South Korea' },
  { code: 'NG', name: 'Nigeria' },
].filter((v, i, a) => a.findIndex(t => t.code === v.code) === i).sort((a, b) => a.name.localeCompare(b.name));

const AIRLINE_NAMES = {
  AT: 'Royal Air Maroc', KQ: 'Kenya Airways', MS: 'EgyptAir',
  ET: 'Ethiopian Airlines', EK: 'Emirates', QR: 'Qatar Airways',
  LH: 'Lufthansa', AF: 'Air France', KL: 'KLM', WB: 'RwandAir',
  BA: 'British Airways', TK: 'Turkish Airlines', DL: 'Delta',
  UA: 'United Airlines', AA: 'American Airlines', TC: 'Air Tanzania'
};

const AIRLINE_MILES = {
  EK: { program: 'Skywards', url: 'https://www.emirates.com/skywards' },
  QR: { program: 'Privilege Club', url: 'https://www.qatarairways.com/privilege-club' },
  ET: { program: 'ShebaMiles', url: 'https://www.ethiopianairlines.com/aa/shebamiles' },
  KQ: { program: 'Flying Blue', url: 'https://www.flyingblue.com' },
  AF: { program: 'Flying Blue', url: 'https://www.flyingblue.com' },
  KL: { program: 'Flying Blue', url: 'https://www.flyingblue.com' },
  LH: { program: 'Miles & More', url: 'https://www.miles-and-more.com' },
  BA: { program: 'Executive Club', url: 'https://www.britishairways.com/executive-club' },
  TK: { program: 'Miles&Smiles', url: 'https://www.turkishairlines.com/miles-smiles' },
  AT: { program: 'Safar Flyer', url: 'https://www.royalairmaroc.com/safar-flyer' },
};

const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm';

const Field = ({ label, children, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const defaultPassenger = (index, selectedSeat) => ({
  type: 'ADULT', title: 'MR', firstName: '', lastName: '',
  dateOfBirth: '', nationality: 'NG', passportNumber: '',
  passportExpiry: '', email: index === 0 ? '' : '',
  phone: index === 0 ? '' : '',
  seatNumber: index === 0 ? (selectedSeat?.id || '') : ''
});

const PriceSummary = ({ selectedFlight, grandTotal, finalAmount, promo, passengers, mobile = false }) => (
  <div className={`space-y-1 text-sm ${mobile ? 'border-t pt-3' : 'border-t pt-4 space-y-2'}`}>
    <div className="flex justify-between">
      <span className="text-gray-500">Base fare x{passengers}</span>
      <span>{formatPrice(parseFloat(selectedFlight.price.base) * passengers)}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-500">Taxes and fees</span>
      <span>{formatPrice(grandTotal - parseFloat(selectedFlight.price.base))}</span>
    </div>
    {promo && (
      <div className="flex justify-between text-green-600 font-medium">
        <span>🎟️ {promo.code}</span>
        <span>-{formatPrice(promo.discount)}</span>
      </div>
    )}
    <div className={`flex justify-between font-bold text-blue-600 pt-1 border-t ${mobile ? '' : 'pt-2'}`}>
      <span>Total</span>
      <span>{formatPrice(finalAmount)}</span>
    </div>
  </div>
);

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedFlight, searchParams } = useFlightStore();
  const { isAuthenticated, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [promo, setPromo] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const selectedSeat = location.state?.selectedSeat;

  const numPassengers = searchParams.adults || 1;
  const [passengers, setPassengers] = useState(
    Array.from({ length: numPassengers }, (_, i) => defaultPassenger(i, selectedSeat))
  );

  const updatePassenger = (index, field, value) => {
    setPassengers(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const addPassenger = () => {
    if (passengers.length >= 6) return toast.error('Maximum 6 passengers per booking');
    setPassengers(prev => [...prev, defaultPassenger(prev.length, null)]);
  };

  const removePassenger = (index) => {
    if (passengers.length <= 1) return;
    setPassengers(prev => prev.filter((_, i) => i !== index));
  };

  if (!selectedFlight) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">No flight selected</h2>
          <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Search Flights</button>
        </div>
      </div>
    );
  }

  const itinerary = selectedFlight.itineraries[0];
  const segments = itinerary.segments;
  const segment = segments[0];
  const lastSegment = segments[segments.length - 1];
  const stops = segments.length - 1;
  const duration = itinerary.duration;
  const fareDetails = selectedFlight.travelerPricings[0].fareDetailsBySegment[0];
  const cabin = fareDetails.cabin;
  const includedBags = fareDetails.includedCheckedBags;
  const includedCabinBags = fareDetails.includedCabinBags;
  const airlineCode = segment.carrierCode;
  const milesProgram = AIRLINE_MILES[airlineCode];
  const grandTotal = parseFloat(selectedFlight.price.grandTotal);
  const finalAmount = promo ? promo.finalAmount : grandTotal;

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || 'https://aerwiz-production.up.railway.app/api'}/promo/validate`,
        { code: promoCode, amount: grandTotal },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setPromo(res.data.data);
      toast.success(`Promo applied! You save ${formatPrice(res.data.data.discount)}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invalid promo code');
      setPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) return toast.error('Please accept the Terms and Conditions to continue');
    const primary = passengers[0];
    if (!primary.email || !primary.phone) return toast.error('Please provide email and phone for the primary passenger');
    setLoading(true);
    try {
      const bookingResponse = await bookingsAPI.create({
        flightOffer: selectedFlight,
        contactEmail: primary.email,
        contactPhone: primary.phone,
        passengers,
        promoCode: promo?.code || null,
        discountAmount: promo?.discount || 0
      });
      const booking = bookingResponse.data.data;
      toast.success('Booking created! Redirecting to payment...');
      const paymentResponse = await paymentsAPI.initialize(booking.id);
      window.location.href = paymentResponse.data.data.authorizationUrl;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-700 text-white py-3 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <Plane className="w-5 h-5" />
            <span className="text-lg font-bold">Aerwiz</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-200 text-sm">
            <span className="font-bold text-white">{segment.departure.iataCode}</span>
            <span>→</span>
            <span className="font-bold text-white">{lastSegment.arrival.iataCode}</span>
            <span className="text-blue-300">·</span>
            <span>{formatDuration(duration)}</span>
            {stops > 0 && <span className="text-orange-300">· {stops} stop{stops > 1 ? 's' : ''}</span>}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center space-x-2 text-xs sm:text-sm">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full font-medium">1. Passenger Details</span>
          <span className="text-gray-400">→</span>
          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full">2. Seat Selection</span>
          <span className="text-gray-400">→</span>
          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full">3. Payment</span>
        </div>
      </div>

      {/* Mobile Summary Toggle */}
      <div className="lg:hidden bg-white border-b border-gray-200">
        <button onClick={() => setShowSummary(!showSummary)} className="w-full flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Flight Summary</span>
            <span className="font-bold text-blue-600 text-sm">{formatPrice(finalAmount)}</span>
            {promo && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Promo applied</span>}
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showSummary ? 'rotate-180' : ''}`} />
        </button>
        {showSummary && (
          <div className="px-4 pb-4">
            <FlightSummaryContent
              segments={segments} segment={segment} lastSegment={lastSegment}
              duration={duration} stops={stops} cabin={cabin}
              includedBags={includedBags} includedCabinBags={includedCabinBags}
              airlineCode={airlineCode} milesProgram={milesProgram}
              selectedFlight={selectedFlight} grandTotal={grandTotal}
              finalAmount={finalAmount} promo={promo}
              passengers={passengers.length} selectedSeat={selectedSeat}
              mobile={true}
            />
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Form */}
          <div className="lg:col-span-2 space-y-4">

            {/* Guest notice */}
            {!isAuthenticated && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-gray-600">
                Already have an account?{' '}
                <span onClick={() => navigate('/login')} className="text-blue-600 underline cursor-pointer font-medium">Sign in for faster checkout</span>
                {' '}or continue as guest below.
              </div>
            )}

            {/* Passengers */}
            {passengers.map((passenger, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800">
                    {index === 0 ? 'Primary Passenger' : `Passenger ${index + 1}`}
                    <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{passenger.type}</span>
                  </h2>
                  {index > 0 && (
                    <button type="button" onClick={() => removePassenger(index)} className="text-red-400 hover:text-red-600 flex items-center space-x-1 text-xs">
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Title" required>
                      <select value={passenger.title} onChange={(e) => updatePassenger(index, 'title', e.target.value)} className={inputClass}>
                        <option value="MR">Mr</option>
                        <option value="MRS">Mrs</option>
                        <option value="MS">Ms</option>
                        <option value="DR">Dr</option>
                        <option value="PROF">Prof</option>
                      </select>
                    </Field>
                    <Field label="Passenger Type">
                      <select value={passenger.type} onChange={(e) => updatePassenger(index, 'type', e.target.value)} className={inputClass}>
                        <option value="ADULT">Adult (12+)</option>
                        <option value="CHILD">Child (2-11)</option>
                        <option value="INFANT">Infant (0-2)</option>
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="First Name" required>
                      <input type="text" value={passenger.firstName} onChange={(e) => updatePassenger(index, 'firstName', e.target.value)} className={inputClass} required placeholder="As on passport" />
                    </Field>
                    <Field label="Last Name" required>
                      <input type="text" value={passenger.lastName} onChange={(e) => updatePassenger(index, 'lastName', e.target.value)} className={inputClass} required placeholder="As on passport" />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Date of Birth" required>
                      <input type="date" value={passenger.dateOfBirth} onChange={(e) => updatePassenger(index, 'dateOfBirth', e.target.value)} className={inputClass} required />
                    </Field>
                    <Field label="Nationality" required>
                      <select value={passenger.nationality} onChange={(e) => updatePassenger(index, 'nationality', e.target.value)} className={inputClass}>
                        {COUNTRIES.map(c => (
                          <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Passport Number">
                      <input type="text" value={passenger.passportNumber} onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value.toUpperCase())} className={inputClass} placeholder="e.g. A12345678" />
                    </Field>
                    <Field label="Passport Expiry">
                      <input type="date" value={passenger.passportExpiry} onChange={(e) => updatePassenger(index, 'passportExpiry', e.target.value)} className={inputClass} />
                    </Field>
                  </div>

                  {index === 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Email" required>
                        <input type="email" value={passenger.email} onChange={(e) => updatePassenger(index, 'email', e.target.value)} className={inputClass} required placeholder="Booking confirmation sent here" />
                      </Field>
                      <Field label="Phone" required>
                        <input type="tel" value={passenger.phone} onChange={(e) => updatePassenger(index, 'phone', e.target.value)} className={inputClass} required placeholder="+234 800 000 0000" />
                      </Field>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add Passenger */}
            {passengers.length < 6 && (
              <button type="button" onClick={addPassenger}
                className="w-full flex items-center justify-center space-x-2 border-2 border-dashed border-blue-300 rounded-xl py-3 text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium">
                <Plus className="w-4 h-4" />
                <span>Add Another Passenger</span>
              </button>
            )}

            {/* Seat Selection */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Seat Selection</h2>
              <div className="bg-blue-50 rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  {selectedSeat ? (
                    <>
                      <p className="text-sm font-medium text-gray-700">Seat {selectedSeat.id} selected</p>
                      <p className="text-xs text-gray-400 mt-0.5">{selectedSeat.extraLegroom ? 'Extra Legroom 🟢' : 'Standard seat'}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-700">No seat selected</p>
                      <p className="text-xs text-gray-400 mt-0.5">Choose your preferred seat on the next step</p>
                    </>
                  )}
                </div>
                <button type="button" onClick={() => navigate('/seats')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                  {selectedSeat ? 'Change Seat' : 'Select Seat →'}
                </button>
              </div>
            </div>

            {/* Promo Code */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Tag className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-bold text-gray-800">Promo Code</h2>
              </div>
              {promo ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-bold text-green-700">🎉 {promo.code} applied!</p>
                    <p className="text-xs text-green-600">{promo.description} · You save {formatPrice(promo.discount)}</p>
                  </div>
                  <button type="button" onClick={() => { setPromo(null); setPromoCode(''); }}
                    className="text-red-400 hover:text-red-600 text-xs font-medium ml-3">Remove</button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyPromo())}
                    placeholder="Enter promo code" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-widest" />
                  <button type="button" onClick={applyPromo} disabled={promoLoading || !promoCode.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors">
                    {promoLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded" />
                <span className="text-sm text-gray-600">
                  I have read and agree to the{' '}
                  <button type="button" onClick={() => setShowTerms(!showTerms)} className="text-blue-600 underline font-medium">
                    Terms and Conditions
                  </button>
                  {' '}and{' '}
                  <span className="text-blue-600 underline cursor-pointer font-medium">Privacy Policy</span>
                  . I understand that ticket names must match passport exactly.
                </span>
              </label>
              {showTerms && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4 text-xs text-gray-600 space-y-2 max-h-48 overflow-y-auto border border-gray-200">
                  <p className="font-bold text-gray-700">Terms and Conditions</p>
                  <p>1. All bookings are subject to airline availability and fare rules.</p>
                  <p>2. Passenger names must match exactly as they appear on valid travel documents.</p>
                  <p>3. Aerwiz acts as an intermediary between passengers and airlines.</p>
                  <p>4. Cancellation and refund policies vary by airline and fare type.</p>
                  <p>5. Aerwiz is not responsible for flight delays, cancellations, or schedule changes by airlines.</p>
                  <p>6. Payment is processed securely via Paystack.</p>
                  <p>7. Booking confirmation is sent to the email provided.</p>
                  <p>8. Full terms and conditions will be available at aerwiz.com/terms.</p>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleBooking}
              disabled={loading || !acceptedTerms}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl disabled:opacity-50 text-base transition-colors shadow-lg">
              {loading ? 'Processing...' : `Proceed to Payment · ${formatPrice(finalAmount)}`}
            </button>
          </div>

          {/* Right - Flight Summary */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4 space-y-4">
              <h2 className="text-lg font-bold text-gray-800">Flight Summary</h2>
              <FlightSummaryContent
                segments={segments} segment={segment} lastSegment={lastSegment}
                duration={duration} stops={stops} cabin={cabin}
                includedBags={includedBags} includedCabinBags={includedCabinBags}
                airlineCode={airlineCode} milesProgram={milesProgram}
                selectedFlight={selectedFlight} grandTotal={grandTotal}
                finalAmount={finalAmount} promo={promo}
                passengers={passengers.length} selectedSeat={selectedSeat}
                mobile={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FlightSummaryContent = ({
  segments, segment, lastSegment, duration, stops, cabin,
  includedBags, includedCabinBags, airlineCode, milesProgram,
  selectedFlight, grandTotal, finalAmount, promo, passengers, selectedSeat, mobile
}) => {
  const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const formatDuration = (dur) => dur?.replace('PT', '').replace('H', 'h ').replace('M', 'm') || '';

  return (
    <div className="space-y-4">
      {/* Route */}
      <div className="flex items-center justify-between">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800">{formatTime(segment.departure.at)}</p>
          <p className="text-sm font-bold text-gray-700">{segment.departure.iataCode}</p>
          {segment.departure.terminal && (
            <p className="text-xs text-gray-400">Terminal {segment.departure.terminal}</p>
          )}
        </div>
        <div className="text-center flex-1 px-2">
          <div className="flex items-center justify-center space-x-1 text-gray-400">
            <Clock className="w-3 h-3" />
            <span className="text-xs">{formatDuration(duration)}</span>
          </div>
          <div className="flex items-center justify-center my-1">
            <div className="h-px w-8 bg-gray-300"></div>
            <Plane className="w-3 h-3 text-blue-500 mx-1" />
            <div className="h-px w-8 bg-gray-300"></div>
          </div>
          <p className={`text-xs font-medium ${stops === 0 ? 'text-green-600' : 'text-orange-500'}`}>
            {stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800">{formatTime(lastSegment.arrival.at)}</p>
          <p className="text-sm font-bold text-gray-700">{lastSegment.arrival.iataCode}</p>
          {lastSegment.arrival.terminal && (
            <p className="text-xs text-gray-400">Terminal {lastSegment.arrival.terminal}</p>
          )}
        </div>
      </div>

      {/* Segments / Transits */}
      {segments.length > 1 && (
        <div className="bg-orange-50 rounded-lg p-3 space-y-2">
          <p className="text-xs font-bold text-orange-700">Transit Information</p>
          {segments.map((seg, i) => (
            <div key={i} className="text-xs text-gray-600">
              <p className="font-medium">{seg.departure.iataCode} → {seg.arrival.iataCode}</p>
              <p className="text-gray-400">{AIRLINE_NAMES[seg.carrierCode] || seg.carrierCode} · {seg.carrierCode}{seg.number} · {formatDuration(seg.duration)}</p>
              {i < segments.length - 1 && (
                <p className="text-orange-600 mt-1">⏱ Layover at {seg.arrival.iataCode}{seg.arrival.terminal ? ` Terminal ${seg.arrival.terminal}` : ''}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Flight Info */}
      <div className="space-y-2 text-xs text-gray-600 border-t pt-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Airline</span>
          <span className="font-medium">{AIRLINE_NAMES[airlineCode] || airlineCode}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Flight</span>
          <span className="font-medium">{segment.carrierCode}{segment.number}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Aircraft</span>
          <span className="font-medium">{segment.aircraft?.code || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Cabin</span>
          <span className="font-medium">{cabin}</span>
        </div>
      </div>

      {/* Baggage */}
      <div className="bg-blue-50 rounded-lg p-3 space-y-1">
        <p className="text-xs font-bold text-blue-700 flex items-center space-x-1">
          <Luggage className="w-3 h-3" />
          <span>Baggage Allowance</span>
        </p>
        <div className="text-xs text-gray-600 space-y-1">
          {includedCabinBags ? (
            <p>✅ Cabin bag: {includedCabinBags.quantity} x {includedCabinBags.weight ? `${includedCabinBags.weight}${includedCabinBags.weightUnit}` : 'included'}</p>
          ) : (
            <p>✅ Cabin bag: 1 x 7kg (standard)</p>
          )}
          {includedBags ? (
            <p>✅ Checked bag: {includedBags.quantity} x {includedBags.weight ? `${includedBags.weight}${includedBags.weightUnit}` : 'included'}</p>
          ) : (
            <p className="text-orange-600">❌ No checked bag included</p>
          )}
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="bg-yellow-50 rounded-lg p-3">
        <p className="text-xs font-bold text-yellow-700 flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Cancellation Policy</span>
        </p>
        <p className="text-xs text-gray-600 mt-1">Cancellation fees vary by fare type. Contact Aerwiz support for refund requests. Refunds processed within 7-14 business days.</p>
      </div>

      {/* Airline Miles */}
      {milesProgram && (
        <div className="bg-purple-50 rounded-lg p-3">
          <p className="text-xs font-bold text-purple-700">✈️ Earn Miles</p>
          <p className="text-xs text-gray-600 mt-1">
            Eligible for <span className="font-medium">{milesProgram.program}</span> miles.{' '}
            <a href={milesProgram.url} target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">Enroll here</a>
          </p>
        </div>
      )}

      {/* Selected Seat */}
      {selectedSeat && (
        <div className="bg-green-50 rounded-lg px-3 py-2 text-xs">
          <span className="text-gray-500">Seat: </span>
          <span className="font-bold text-green-600">{selectedSeat.id}</span>
          {selectedSeat.extraLegroom && <span className="ml-2 text-green-600">· Extra Legroom</span>}
        </div>
      )}

      {/* Price Summary */}
      <PriceSummary
        selectedFlight={selectedFlight} grandTotal={grandTotal}
        finalAmount={finalAmount} promo={promo}
        passengers={passengers} mobile={mobile}
      />
    </div>
  );
};

export default BookingPage;