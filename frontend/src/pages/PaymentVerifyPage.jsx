import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentsAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { Plane, CheckCircle, XCircle, Loader } from 'lucide-react';

const PaymentVerifyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const [status, setStatus] = useState('loading');
  const [bookingReference, setBookingReference] = useState('');
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) {
      setStatus('error');
      setError('No payment reference found.');
      return;
    }
    verifyPayment(reference);
  }, []);

  const verifyPayment = async (reference) => {
    try {
      const res = await paymentsAPI.verify(reference);
      const data = res.data.data;
      setBookingReference(data.bookingReference);
      setAmount(data.amount);
      setStatus('success');
    } catch (e) {
      setStatus('error');
      setError(e.response?.data?.message || 'Payment verification failed. Please contact support.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Plane className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">Aerwiz</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <Loader className="w-16 h-16 text-blue-600 mx-auto animate-spin" />
              <h2 className="text-xl font-bold text-gray-800">Verifying Payment...</h2>
              <p className="text-gray-500 text-sm">Please wait while we confirm your payment.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-800">Payment Successful!</h2>
              <p className="text-gray-500">Your booking has been confirmed.</p>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 my-4">
                <p className="text-sm text-gray-500 mb-1">Booking Reference</p>
                <p className="text-2xl font-bold text-green-600 font-mono tracking-widest">{bookingReference}</p>
                <p className="text-sm text-gray-500 mt-2">Amount Paid: <span className="font-bold text-gray-700">
                  {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)}
                </span></p>
              </div>

              <p className="text-sm text-gray-500">
                A confirmation email has been sent to your email address with your booking details and boarding pass.
              </p>

              <div className="space-y-3 mt-6">
                {isAuthenticated ? (
                  <button onClick={() => navigate('/dashboard')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
                    View My Bookings
                  </button>
                ) : (
                  <>
                    <button onClick={() => navigate('/register')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
                      Create Account to Manage Booking
                    </button>
                    <button onClick={() => navigate('/')}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors">
                      Back to Home
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-800">Payment Failed</h2>
              <p className="text-gray-500 text-sm">{error}</p>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 my-4">
                <p className="text-sm text-red-600">
                  If you were charged, please contact us at <span className="font-bold">support@aerwiz.com</span> with your payment reference.
                </p>
              </div>

              <div className="space-y-3 mt-6">
                <button onClick={() => navigate('/')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
                  Search Flights Again
                </button>
                {isAuthenticated && (
                  <button onClick={() => navigate('/dashboard')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors">
                    View My Bookings
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentVerifyPage;