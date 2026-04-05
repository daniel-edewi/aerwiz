import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { bookingsAPI, paymentsAPI } from '../services/api';
import useFlightStore from '../store/flightStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Plane, Tag, Plus, Trash2, Clock, ChevronDown, ChevronUp, Check, AlertCircle, Luggage, Info, Lock, Gift, Award } from 'lucide-react';

const formatPrice = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const formatDuration = (dur) => dur?.replace('PT', '').replace('H', 'h ').replace('M', 'm') || '';

const COUNTRIES = [
  { code: 'NG', name: 'Nigeria' }, { code: 'GH', name: 'Ghana' }, { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' }, { code: 'ET', name: 'Ethiopia' }, { code: 'EG', name: 'Egypt' },
  { code: 'GB', name: 'United Kingdom' }, { code: 'US', name: 'United States' }, { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' }, { code: 'DE', name: 'Germany' }, { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' }, { code: 'ES', name: 'Spain' }, { code: 'NL', name: 'Netherlands' },
  { code: 'AE', name: 'United Arab Emirates' }, { code: 'QA', name: 'Qatar' }, { code: 'SA', name: 'Saudi Arabia' },
  { code: 'IN', name: 'India' }, { code: 'CN', name: 'China' }, { code: 'JP', name: 'Japan' },
  { code: 'BR', name: 'Brazil' }, { code: 'MX', name: 'Mexico' }, { code: 'SN', name: 'Senegal' },
  { code: 'CI', name: "Côte d'Ivoire" }, { code: 'CM', name: 'Cameroon' }, { code: 'TZ', name: 'Tanzania' },
  { code: 'UG', name: 'Uganda' }, { code: 'RW', name: 'Rwanda' }, { code: 'MA', name: 'Morocco' },
  { code: 'TN', name: 'Tunisia' }, { code: 'TR', name: 'Turkey' }, { code: 'PK', name: 'Pakistan' },
  { code: 'SG', name: 'Singapore' }, { code: 'MY', name: 'Malaysia' }, { code: 'ZW', name: 'Zimbabwe' },
  { code: 'ZM', name: 'Zambia' }, { code: 'AO', name: 'Angola' }, { code: 'MZ', name: 'Mozambique' },
].sort((a, b) => a.name.localeCompare(b.name));

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
  ET: { program: 'ShebaMiles', url: 'https://www.ethiopianairlines.com/shebamiles' },
  KQ: { program: 'Flying Blue', url: 'https://www.flyingblue.com' },
  AF: { program: 'Flying Blue', url: 'https://www.flyingblue.com' },
  KL: { program: 'Flying Blue', url: 'https://www.flyingblue.com' },
  LH: { program: 'Miles & More', url: 'https://www.miles-and-more.com' },
  BA: { program: 'Executive Club', url: 'https://www.britishairways.com/executive-club' },
  TK: { program: 'Miles&Smiles', url: 'https://www.turkishairlines.com/miles-smiles' },
};

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors';
const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1';

const Field = ({ label, required, children }) => (
  <div>
    <label className={labelClass}>{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
    {children}
  </div>
);

const AirplaneLoader = () => (
  <span className="inline-flex items-center space-x-2">
    <span className="relative flex items-center justify-center w-5 h-5">
      <span className="animate-spin absolute w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
      <Plane className="w-2.5 h-2.5 text-white" />
    </span>
    <span>Processing...</span>
  </span>
);

const defaultPassenger = (index, selectedSeat) => ({
  type: 'ADULT', title: 'MR', firstName: '', lastName: '',
  dateOfBirth: '', nationality: 'NG', passportNumber: '',
  passportExpiry: '', email: '', phone: '',
  seatNumber: index === 0 ? (selectedSeat?.id || '') : ''
});

const StepIndicator = ({ current }) => {
  const steps = [
    { num: 1, label: 'Passenger Details' },
    { num: 2, label: 'Seat Selection' },
    { num: 3, label: 'Payment' },
    { num: 4, label: 'Confirmation' },
  ];
  return (
    <div className="flex items-center justify-center space-x-1 sm:space-x-2">
      {steps.map((step, i) => (
        <React.Fragment key={step.num}>
          <div className="flex items-center space-x-1.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step.num < current ? 'bg-green-500 text-white' :
              step.num === current ? 'bg-blue-600 text-white' :
              'bg-gray-100 text-gray-400'
            }`}>
              {step.num < current ? <Check className="w-3.5 h-3.5" /> : step.num}
            </div>
            <span className={`hidden sm:block text-xs font-medium ${step.num === current ? 'text-blue-600' : step.num < current ? 'text-green-600' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-px w-6 sm:w-10 ${step.num < current ? 'bg-green-400' : 'bg-gray-200'}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedFlight, searchParams } = useFlightStore();
  const { isAuthenticated, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [promo, setPromo] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showFlightDetails, setShowFlightDetails] = useState(false);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plane className="w-8 h-8 text-blue-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-600 mb-2">No flight selected</h2>
          <p className="text-gray-400 mb-4">Please search for a flight first</p>
          <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700">Search Flights</button>
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
  const isRoundTrip = selectedFlight.itineraries.length > 1;

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
    if (!acceptedTerms) return toast.error('Please accept the Terms and Conditions');
    const primary = passengers[0];
    if (!primary.email || !primary.phone) return toast.error('Please provide email and phone for the primary passenger');
    if (!primary.firstName || !primary.lastName) return toast.error('Please fill in passenger name');
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
      toast.error(error.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header — SVG wordmark logo, no old icon+text */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <StepIndicator current={1} />
          <button onClick={() => navigate('/flights')} className="text-xs text-gray-500 hover:text-blue-600 font-medium hidden sm:block">
            Back to results
          </button>
        </div>
      </header>

      {/* Route Banner */}
      <div className="bg-blue-700 text-white py-3 px-4">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={`https://pics.avs.io/40/40/${airlineCode}.png`} alt={airlineCode}
              className="w-8 h-8 rounded-lg object-contain bg-white/20 p-1"
              onError={(e) => { e.target.style.display = 'none'; }} />
            <div>
              <div className="flex items-center space-x-2 font-bold text-sm sm:text-base">
                <span>{segment.departure.iataCode}</span>
                <span>to</span>
                <span>{lastSegment.arrival.iataCode}</span>
                {isRoundTrip && <span className="text-xs bg-orange-400 px-2 py-0.5 rounded-full">Round Trip</span>}
              </div>
              <p className="text-blue-200 text-xs">
                {AIRLINE_NAMES[airlineCode] || airlineCode} · {formatDate(segment.departure.at)} · {formatDuration(duration)} · {stops === 0 ? 'Direct' : `${stops} stop`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">{formatPrice(finalAmount)}</p>
            <p className="text-blue-200 text-xs">per person</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT - Form */}
          <div className="lg:col-span-2 space-y-5">

            {!isAuthenticated && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center space-x-3">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <span onClick={() => navigate('/login')} className="text-blue-600 underline cursor-pointer font-semibold">Sign in for faster checkout</span>
                  {' '}or continue as guest.
                </p>
              </div>
            )}

            {passengers.map((passenger, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{index + 1}</div>
                    <h2 className="font-bold text-gray-800">
                      {index === 0 ? 'Primary Passenger' : `Passenger ${index + 1}`}
                    </h2>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">{passenger.type}</span>
                  </div>
                  {index > 0 && (
                    <button type="button" onClick={() => removePassenger(index)}
                      className="flex items-center space-x-1 text-red-400 hover:text-red-600 text-xs font-medium">
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    <Field label="Title" required>
                      <select value={passenger.title} onChange={(e) => updatePassenger(index, 'title', e.target.value)} className={inputClass}>
                        <option value="MR">Mr</option>
                        <option value="MRS">Mrs</option>
                        <option value="MS">Ms</option>
                        <option value="DR">Dr</option>
                        <option value="PROF">Prof</option>
                      </select>
                    </Field>
                    <div className="col-span-2 sm:col-span-3">
                      <Field label="Passenger Type">
                        <select value={passenger.type} onChange={(e) => updatePassenger(index, 'type', e.target.value)} className={inputClass}>
                          <option value="ADULT">Adult (12+)</option>
                          <option value="CHILD">Child (2-11)</option>
                          <option value="INFANT">Infant (under 2)</option>
                        </select>
                      </Field>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="First Name (as on passport)" required>
                      <input type="text" value={passenger.firstName}
                        onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                        className={inputClass} placeholder="e.g. John" />
                    </Field>
                    <Field label="Last Name (as on passport)" required>
                      <input type="text" value={passenger.lastName}
                        onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                        className={inputClass} placeholder="e.g. Smith" />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Date of Birth" required>
                      <input type="date" value={passenger.dateOfBirth}
                        onChange={(e) => updatePassenger(index, 'dateOfBirth', e.target.value)}
                        className={inputClass} />
                    </Field>
                    <Field label="Nationality" required>
                      <select value={passenger.nationality}
                        onChange={(e) => updatePassenger(index, 'nationality', e.target.value)}
                        className={inputClass}>
                        {COUNTRIES.map(c => (
                          <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Passport Number">
                      <input type="text" value={passenger.passportNumber}
                        onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value.toUpperCase())}
                        className={inputClass} placeholder="e.g. A12345678" />
                    </Field>
                    <Field label="Passport Expiry Date">
                      <input type="date" value={passenger.passportExpiry}
                        onChange={(e) => updatePassenger(index, 'passportExpiry', e.target.value)}
                        className={inputClass} />
                    </Field>
                  </div>

                  {index === 0 && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact Information</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Email Address" required>
                          <input type="email" value={passenger.email}
                            onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                            className={inputClass} placeholder="confirmation@email.com" />
                        </Field>
                        <Field label="Phone Number" required>
                          <input type="tel" value={passenger.phone}
                            onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                            className={inputClass} placeholder="+234 800 000 0000" />
                        </Field>
                      </div>
                      <p className="text-xs text-gray-400 mt-2 flex items-center space-x-1">
                        <Info className="w-3 h-3" />
                        <span>Booking confirmation and e-ticket will be sent to this email</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {passengers.length < 6 && (
              <button type="button" onClick={addPassenger}
                className="w-full flex items-center justify-center space-x-2 border-2 border-dashed border-blue-200 rounded-2xl py-4 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all text-sm font-semibold">
                <Plus className="w-4 h-4" />
                <span>Add Another Passenger</span>
              </button>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 px-5 py-3">
                <h2 className="font-bold text-gray-800">Seat Selection</h2>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Plane className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      {selectedSeat ? (
                        <>
                          <p className="font-bold text-gray-800">Seat {selectedSeat.id} selected</p>
                          <p className="text-xs text-gray-500">{selectedSeat.extraLegroom ? 'Extra Legroom' : 'Standard seat'} · {cabin}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-gray-700">No seat selected yet</p>
                          <p className="text-xs text-gray-400">Choose your preferred seat on the next step</p>
                        </>
                      )}
                    </div>
                  </div>
                  <button type="button" onClick={() => navigate('/seats')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors flex-shrink-0">
                    {selectedSeat ? 'Change Seat' : 'Select Seat'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center space-x-2">
                <Tag className="w-4 h-4 text-blue-600" />
                <h2 className="font-bold text-gray-800">Promo Code</h2>
              </div>
              <div className="p-5">
                {promo ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <Gift className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-green-700">{promo.code} applied!</p>
                        <p className="text-xs text-green-600">{promo.description} · You save {formatPrice(promo.discount)}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => { setPromo(null); setPromoCode(''); }}
                      className="text-red-400 hover:text-red-600 text-xs font-semibold ml-3">Remove</button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <input type="text" value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyPromo())}
                      placeholder="Enter promo code (e.g. AERWIZ20)"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-widest" />
                    <button type="button" onClick={applyPromo}
                      disabled={promoLoading || !promoCode.trim()}
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-blue-700 transition-colors">
                      {promoLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <label className="flex items-start space-x-3 cursor-pointer">
                <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${acceptedTerms ? 'bg-blue-600 border-blue-600' : 'border-gray-300 hover:border-blue-400'}`}
                  onClick={() => setAcceptedTerms(!acceptedTerms)}>
                  {acceptedTerms && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm text-gray-600 leading-relaxed">
                  I have read and agree to the{' '}
                  <button type="button" onClick={() => setShowTerms(!showTerms)} className="text-blue-600 underline font-semibold">Terms and Conditions</button>
                  {' '}and{' '}
                  <span className="text-blue-600 underline cursor-pointer font-semibold">Privacy Policy</span>.
                  I confirm that all passenger names match their valid travel documents.
                </span>
              </label>

              {showTerms && (
                <div className="mt-4 bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-2 max-h-40 overflow-y-auto border border-gray-200">
                  <p className="font-bold text-gray-700">Aerwiz Terms and Conditions</p>
                  <p>1. All bookings are subject to airline availability and fare rules at time of booking.</p>
                  <p>2. Passenger names must match exactly as they appear on valid travel documents.</p>
                  <p>3. Aerwiz acts as an intermediary between passengers and airlines.</p>
                  <p>4. Cancellation and refund policies vary by airline and fare type.</p>
                  <p>5. Aerwiz is not responsible for flight delays, cancellations, or schedule changes by airlines.</p>
                  <p>6. Payment is processed securely via Paystack. Aerwiz does not store card details.</p>
                  <p>7. Booking confirmation is sent to the email address provided at checkout.</p>
                  <p>8. Full terms available at aerwiz.com/terms.</p>
                </div>
              )}
            </div>

            <button
              onClick={handleBooking}
              disabled={loading || !acceptedTerms}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl disabled:opacity-50 text-base transition-colors shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
              {loading ? <AirplaneLoader /> : (
                <>
                  <span>Proceed to Payment</span>
                  <span className="bg-white/20 px-3 py-0.5 rounded-lg text-sm">{formatPrice(finalAmount)}</span>
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 flex items-center justify-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>Your payment is secured with SSL encryption via Paystack</span>
            </p>
          </div>

          {/* RIGHT - Flight Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-20 overflow-hidden">
              <div className="bg-blue-700 text-white px-5 py-4">
                <h2 className="font-bold text-base">Flight Summary</h2>
                <p className="text-blue-200 text-xs mt-0.5">Review your trip details</p>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{formatTime(segment.departure.at)}</p>
                    <p className="text-sm font-bold text-gray-700">{segment.departure.iataCode}</p>
                    {segment.departure.terminal && <p className="text-xs text-gray-400">T{segment.departure.terminal}</p>}
                    <p className="text-xs text-gray-400">{formatDate(segment.departure.at)}</p>
                  </div>
                  <div className="flex flex-col items-center flex-1 px-3">
                    <div className="flex items-center space-x-1 text-gray-400 text-xs mb-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDuration(duration)}</span>
                    </div>
                    <div className="flex items-center w-full">
                      <div className="h-px flex-1 bg-gray-200"></div>
                      <Plane className="w-4 h-4 text-blue-500 mx-1" />
                      <div className="h-px flex-1 bg-gray-200"></div>
                    </div>
                    <p className={`text-xs mt-1 font-semibold ${stops === 0 ? 'text-green-600' : 'text-orange-500'}`}>
                      {stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{formatTime(lastSegment.arrival.at)}</p>
                    <p className="text-sm font-bold text-gray-700">{lastSegment.arrival.iataCode}</p>
                    {lastSegment.arrival.terminal && <p className="text-xs text-gray-400">T{lastSegment.arrival.terminal}</p>}
                    <p className="text-xs text-gray-400">{formatDate(lastSegment.arrival.at)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-3">
                  <img src={`https://pics.avs.io/50/50/${airlineCode}.png`} alt={airlineCode}
                    className="w-10 h-10 rounded-lg object-contain border border-gray-100 bg-white p-1"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                  <div>
                    <p className="text-sm font-bold text-gray-800">{AIRLINE_NAMES[airlineCode] || airlineCode}</p>
                    <p className="text-xs text-gray-400">{segment.carrierCode}{segment.number} · {cabin}</p>
                    {segment.aircraft?.code && <p className="text-xs text-gray-400">Aircraft: {segment.aircraft.code}</p>}
                  </div>
                </div>

                {stops > 0 && (
                  <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                    <p className="text-xs font-bold text-orange-700 mb-2">Transit Information</p>
                    {segments.map((seg, i) => (
                      <div key={i} className="text-xs text-gray-600 mb-1">
                        <p className="font-medium">{seg.departure.iataCode} to {seg.arrival.iataCode} · {formatDuration(seg.duration)}</p>
                        {i < segments.length - 1 && <p className="text-orange-500">Layover at {seg.arrival.iataCode}</p>}
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <p className="text-xs font-bold text-blue-700 mb-2 flex items-center space-x-1">
                    <Luggage className="w-3.5 h-3.5" />
                    <span>Baggage Allowance</span>
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      {includedCabinBags
                        ? <><span className="text-green-500 font-bold">+</span><span className="text-gray-600">Cabin bag included</span></>
                        : <><span className="text-gray-400">-</span><span className="text-gray-400">Cabin bag: check with airline</span></>}
                    </div>
                    <div className="flex items-center space-x-2">
                      {includedBags
                        ? <><span className="text-green-500 font-bold">+</span><span className="text-gray-600">{includedBags.quantity} checked bag{includedBags.quantity > 1 ? 's' : ''} included{includedBags.weight ? ` (${includedBags.weight}${includedBags.weightUnit})` : ''}</span></>
                        : <><span className="text-orange-400 font-bold">x</span><span className="text-orange-600">No checked bag included</span></>}
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                  <p className="text-xs font-bold text-yellow-700 flex items-center space-x-1 mb-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Cancellation Policy</span>
                  </p>
                  <p className="text-xs text-gray-500">Fees vary by fare type. Refunds processed within 7-14 business days.</p>
                </div>

                {milesProgram && (
                  <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                    <p className="text-xs font-bold text-purple-700 flex items-center space-x-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>Earn Miles</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Eligible for <a href={milesProgram.url} target="_blank" rel="noopener noreferrer" className="text-purple-600 underline font-medium">{milesProgram.program}</a>
                    </p>
                  </div>
                )}

                {selectedSeat && (
                  <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                    <p className="text-xs font-bold text-green-700 flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Selected Seat</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Seat <span className="font-bold">{selectedSeat.id}</span> {selectedSeat.extraLegroom ? '· Extra Legroom' : ''}</p>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Base fare × {passengers.length}</span>
                    <span className="text-gray-700">{formatPrice(parseFloat(selectedFlight.price.base) * passengers.length)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Taxes & fees</span>
                    <span className="text-gray-700">{formatPrice(grandTotal - parseFloat(selectedFlight.price.base))}</span>
                  </div>
                  {promo && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>{promo.code}</span>
                      <span>-{formatPrice(promo.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                    <span className="text-gray-800">Total</span>
                    <span className="text-blue-600 text-lg">{formatPrice(finalAmount)}</span>
                  </div>
                </div>

                <button onClick={() => setShowFlightDetails(!showFlightDetails)}
                  className="w-full flex items-center justify-center space-x-1 text-xs text-blue-600 hover:text-blue-700 font-medium py-1">
                  <span>{showFlightDetails ? 'Hide' : 'Show'} full flight details</span>
                  {showFlightDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showFlightDetails && (
                  <div className="border-t pt-3 space-y-2">
                    {segments.map((seg, i) => (
                      <div key={i} className="text-xs bg-gray-50 rounded-lg p-3 space-y-1">
                        <p className="font-bold text-gray-700">{seg.departure.iataCode} to {seg.arrival.iataCode}</p>
                        <p className="text-gray-500">{AIRLINE_NAMES[seg.carrierCode] || seg.carrierCode} · {seg.carrierCode}{seg.number}</p>
                        <p className="text-gray-500">Dep: {formatTime(seg.departure.at)}{seg.departure.terminal ? ` · T${seg.departure.terminal}` : ''}</p>
                        <p className="text-gray-500">Arr: {formatTime(seg.arrival.at)}{seg.arrival.terminal ? ` · T${seg.arrival.terminal}` : ''}</p>
                        <p className="text-gray-500">Duration: {formatDuration(seg.duration)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;