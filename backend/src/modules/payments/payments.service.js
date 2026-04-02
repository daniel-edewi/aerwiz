const { sendPaymentConfirmationEmail } = require('../../utils/emailService');
const https = require('https');
const prisma = require('../../config/prisma');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

const makePaystackRequest = (path, method, data) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path,
      method,
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (parsed.status) resolve(parsed);
          else reject(new Error(parsed.message || 'Paystack error'));
        } catch (e) {
          reject(new Error('Invalid Paystack response'));
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

const initializePayment = async (userId, bookingId) => {
  // Find booking - for guests userId is null so search by id only
  const booking = await prisma.booking.findFirst({
    where: userId
      ? { id: bookingId, userId }
      : { id: bookingId },
    include: { passengers: true }
  });

  if (!booking) throw new Error('Booking not found');
  if (booking.status === 'CANCELLED') throw new Error('Booking is cancelled');

  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId }
  });

  if (existingPayment && existingPayment.status === 'SUCCESS') {
    throw new Error('Booking already paid');
  }

  // Get email - from user account or from passenger details
  let email = booking.contactEmail;
  if (!email && booking.passengers && booking.passengers.length > 0) {
    email = booking.passengers[0].email;
  }
  if (!email) throw new Error('No email found for payment');

  const amountInKobo = Math.round(booking.totalAmount * 100);

  const paystackData = JSON.stringify({
    email,
    amount: amountInKobo,
    currency: 'NGN',
    reference: `AWZ-${booking.bookingReference}-${Date.now()}`,
    metadata: {
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      userId: userId || 'guest'
    },
    callback_url: `${process.env.FRONTEND_URL}/payment/verify`
  });

  const response = await makePaystackRequest('/transaction/initialize', 'POST', paystackData);

  if (existingPayment) {
    await prisma.payment.update({
      where: { bookingId },
      data: { providerReference: response.data.reference, status: 'PENDING' }
    });
  } else {
    await prisma.payment.create({
      data: {
        bookingId,
        ...(userId && { userId }),
        amount: booking.totalAmount,
        currency: 'NGN',
        provider: 'PAYSTACK',
        providerReference: response.data.reference,
        status: 'PENDING'
      }
    });
  }

  return {
    authorizationUrl: response.data.authorization_url,
    reference: response.data.reference,
    bookingReference: booking.bookingReference,
    amount: booking.totalAmount,
    currency: 'NGN'
  };
};

const verifyPayment = async (reference) => {
  const response = await makePaystackRequest(`/transaction/verify/${reference}`, 'GET');

  const payment = await prisma.payment.findFirst({
    where: { providerReference: reference },
    include: { booking: { include: { passengers: true } } }
  });

  if (!payment) throw new Error('Payment record not found');

  if (response.data.status === 'success') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'SUCCESS', providerResponse: response.data, paidAt: new Date() }
    });
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'PAYMENT_PENDING' }
    });

    try {
      if (payment.userId) {
        const user = await prisma.user.findUnique({ where: { id: payment.userId } });
        await sendPaymentConfirmationEmail(user, payment.booking, payment);
      } else {
        // Guest - use passenger email
        const guestEmail = payment.booking.passengers?.[0]?.email;
        const guestName = payment.booking.passengers?.[0]?.firstName || 'Guest';
        if (guestEmail) {
          await sendPaymentConfirmationEmail(
            { email: guestEmail, firstName: guestName },
            payment.booking,
            payment
          );
        }
      }
    } catch (e) { console.log('Email error:', e.message); }

    return {
      success: true,
      message: 'Payment successful',
      bookingReference: payment.booking.bookingReference,
      amount: response.data.amount / 100,
      currency: response.data.currency
    };
  } else {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED', providerResponse: response.data }
    });
    throw new Error('Payment verification failed');
  }
};

// Broadcast payment to admin
    try {
      const { broadcastToAdmins } = require('../admin/admin.controller');
      broadcastToAdmins({
        type: 'payment_received',
        message: `Payment confirmed for booking ${booking.bookingReference}`,
        booking: {
          id: booking.id,
          reference: booking.bookingReference,
          route: `${booking.origin} → ${booking.destination}`,
          amount: booking.totalAmount,
          status: 'CONFIRMED',
          createdAt: new Date()
        }
      });
    } catch (e) {}

module.exports = { initializePayment, verifyPayment };