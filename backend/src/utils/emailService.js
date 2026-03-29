const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000
});

transporter.verify((error, success) => {
  if (error) {
    console.log('Email server error:', error.message);
  } else {
    console.log('Email server is ready to send messages');
  }
});

const sendWelcomeEmail = async (user) => {
  try {
    await transporter.sendMail({
      from: `"Aerwiz" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Welcome to Aerwiz! ✈️',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px;">✈️ Aerwiz</h1>
            <p style="color: #bfdbfe; margin-top: 8px;">Fly Anywhere, Anytime</p>
          </div>
          <div style="background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1e3a8a;">Welcome aboard, ${user.firstName}! 🎉</h2>
            <p style="color: #4b5563; line-height: 1.6;">Your Aerwiz account has been created successfully. You can now search and book flights across the world at the best prices.</p>
            <div style="background: #eff6ff; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h3 style="color: #1e3a8a; margin-top: 0;">What you can do with Aerwiz:</h3>
              <ul style="color: #4b5563; line-height: 2;">
                <li>✈️ Search hundreds of airlines</li>
                <li>💰 Find the lowest fares in NGN</li>
                <li>📱 Book in minutes</li>
                <li>💳 Pay securely with Paystack</li>
              </ul>
            </div>
            <div style="text-align: center; margin-top: 32px;">
              <a href="${process.env.FRONTEND_URL}" style="background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Search Flights Now</a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; text-align: center;">© 2026 Aerwiz. All rights reserved.</p>
          </div>
        </div>
      `
    });
  } catch (e) {
    console.log('sendWelcomeEmail error:', e.message);
  }
};

const sendBookingConfirmationEmail = async (user, booking) => {
  const formatPrice = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const firstName = user?.firstName || 'Valued Customer';
  const email = user?.email;
  if (!email) return;

  try {
    await transporter.sendMail({
      from: `"Aerwiz" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Booking Confirmed - ${booking.bookingReference} ✈️`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px;">✈️ Aerwiz</h1>
            <p style="color: #bfdbfe; margin-top: 8px;">Booking Confirmation</p>
          </div>
          <div style="background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1e3a8a;">Your booking is confirmed! 🎉</h2>
            <p style="color: #4b5563;">Hi ${firstName}, your flight has been booked successfully.</p>
            <div style="background: #eff6ff; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <div style="text-align: center;">
                  <p style="font-size: 28px; font-weight: bold; color: #1e3a8a; margin: 0;">${booking.origin}</p>
                  <p style="color: #6b7280; margin: 4px 0 0;">Origin</p>
                </div>
                <div style="font-size: 24px;">✈️</div>
                <div style="text-align: center;">
                  <p style="font-size: 28px; font-weight: bold; color: #1e3a8a; margin: 0;">${booking.destination}</p>
                  <p style="color: #6b7280; margin: 4px 0 0;">Destination</p>
                </div>
              </div>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; color: #6b7280;">Booking Reference</td>
                <td style="padding: 12px 0; font-weight: bold; color: #1e3a8a; text-align: right;">${booking.bookingReference}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; color: #6b7280;">Departure Date</td>
                <td style="padding: 12px 0; font-weight: bold; color: #111827; text-align: right;">${formatDate(booking.departureDate)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; color: #6b7280;">Flight</td>
                <td style="padding: 12px 0; font-weight: bold; color: #111827; text-align: right;">${booking.flightNumber}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; color: #6b7280;">Cabin Class</td>
                <td style="padding: 12px 0; font-weight: bold; color: #111827; text-align: right;">${booking.cabinClass}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; color: #6b7280;">Status</td>
                <td style="padding: 12px 0; text-align: right;"><span style="background: #fef3c7; color: #d97706; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">${booking.status}</span></td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #6b7280; font-weight: bold;">Total Amount</td>
                <td style="padding: 12px 0; font-weight: bold; color: #2563eb; font-size: 20px; text-align: right;">${formatPrice(booking.totalAmount)}</td>
              </tr>
            </table>
            <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">⚠️ <strong>Action Required:</strong> Please complete your payment to confirm your booking. Your booking reference is <strong>${booking.bookingReference}</strong>.</p>
            </div>
            <div style="text-align: center; margin-top: 32px;">
              <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">View My Booking</a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; text-align: center;">© 2026 Aerwiz. All rights reserved.</p>
          </div>
        </div>
      `
    });
  } catch (e) {
    console.log('sendBookingConfirmationEmail error:', e.message);
  }
};

const sendPaymentConfirmationEmail = async (user, booking, payment) => {
  const formatPrice = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const firstName = user?.firstName || 'Valued Customer';
  const email = user?.email;
  if (!email) return;

  try {
    await transporter.sendMail({
      from: `"Aerwiz" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Payment Successful - ${booking.bookingReference} 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #065f46, #10b981); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px;">✈️ Aerwiz</h1>
            <p style="color: #a7f3d0; margin-top: 8px;">Payment Successful</p>
          </div>
          <div style="background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="width: 64px; height: 64px; background: #d1fae5; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 32px;">✅</div>
            </div>
            <h2 style="color: #065f46; text-align: center;">Payment Successful!</h2>
            <p style="color: #4b5563; text-align: center;">Hi ${firstName}, your payment of <strong>${formatPrice(booking.totalAmount)}</strong> has been received.</p>
            <div style="background: #ecfdf5; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
              <p style="color: #6b7280; margin: 0 0 4px;">Booking Reference</p>
              <p style="font-size: 28px; font-weight: bold; color: #065f46; margin: 0; letter-spacing: 2px;">${booking.bookingReference}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; color: #6b7280;">Route</td>
                <td style="padding: 12px 0; font-weight: bold; color: #111827; text-align: right;">${booking.origin} → ${booking.destination}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; color: #6b7280;">Departure Date</td>
                <td style="padding: 12px 0; font-weight: bold; color: #111827; text-align: right;">${formatDate(booking.departureDate)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; color: #6b7280;">Flight</td>
                <td style="padding: 12px 0; font-weight: bold; color: #111827; text-align: right;">${booking.flightNumber}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #6b7280; font-weight: bold;">Amount Paid</td>
                <td style="padding: 12px 0; font-weight: bold; color: #059669; font-size: 20px; text-align: right;">${formatPrice(booking.totalAmount)}</td>
              </tr>
            </table>
            <div style="text-align: center; margin-top: 32px;">
              <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #059669; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">View My Booking</a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; text-align: center;">© 2026 Aerwiz. All rights reserved.</p>
          </div>
        </div>
      `
    });
  } catch (e) {
    console.log('sendPaymentConfirmationEmail error:', e.message);
  }
};

const sendPriceAlertEmail = async (user, alert, currentPrice) => {
  const formatPrice = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

  try {
    await transporter.sendMail({
      from: `"Aerwiz" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Price Alert! ${alert.origin} → ${alert.destination} is now ${formatPrice(currentPrice)} 🔔`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px;">✈️ Aerwiz</h1>
            <p style="color: #ddd6fe; margin-top: 8px;">Price Alert Triggered!</p>
          </div>
          <div style="background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="font-size: 48px;">🔔</div>
            </div>
            <h2 style="color: #4f46e5; text-align: center;">Great news, ${user.firstName}!</h2>
            <p style="color: #4b5563; text-align: center;">The price for your route has dropped below your target!</p>
            <div style="background: #f5f3ff; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
              <div style="display: flex; justify-content: center; align-items: center; gap: 16px; margin-bottom: 16px;">
                <span style="font-size: 24px; font-weight: bold; color: #4f46e5;">${alert.origin}</span>
                <span style="font-size: 20px;">✈️</span>
                <span style="font-size: 24px; font-weight: bold; color: #4f46e5;">${alert.destination}</span>
              </div>
              <div style="display: flex; justify-content: center; gap: 32px;">
                <div>
                  <p style="color: #6b7280; margin: 0; font-size: 12px;">YOUR TARGET</p>
                  <p style="color: #dc2626; font-size: 20px; font-weight: bold; margin: 4px 0; text-decoration: line-through;">${formatPrice(alert.targetPrice)}</p>
                </div>
                <div>
                  <p style="color: #6b7280; margin: 0; font-size: 12px;">CURRENT PRICE</p>
                  <p style="color: #059669; font-size: 28px; font-weight: bold; margin: 4px 0;">${formatPrice(currentPrice)}</p>
                </div>
              </div>
            </div>
            <div style="background: #ecfdf5; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
              <p style="color: #065f46; font-weight: bold; margin: 0;">You save ${formatPrice(alert.targetPrice - currentPrice)}! 🎉</p>
            </div>
            <div style="text-align: center; margin-top: 32px;">
              <a href="${process.env.FRONTEND_URL}" style="background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Book Now Before Price Changes</a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; text-align: center;">© 2026 Aerwiz. All rights reserved.</p>
          </div>
        </div>
      `
    });
  } catch (e) {
    console.log('sendPriceAlertEmail error:', e.message);
  }
};

const sendBookingCancellationEmail = async (user, booking) => {
  const firstName = user?.firstName || 'Valued Customer';
  const email = user?.email;
  if (!email) return;

  try {
    await transporter.sendMail({
      from: `"Aerwiz ✈️" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Booking Cancelled - ${booking.bookingReference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✈️ Aerwiz</h1>
            <p style="color: #fca5a5; margin: 10px 0 0;">Booking Cancellation Confirmation</p>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #374151;">Hi ${firstName},</h2>
            <p style="color: #6b7280;">Your booking has been successfully cancelled.</p>
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h3 style="color: #374151; margin-top: 0;">Cancelled Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #6b7280;">Reference</td><td style="font-weight: bold; color: #374151;">${booking.bookingReference}</td></tr>
                <tr><td style="padding: 8px 0; color: #6b7280;">Route</td><td style="font-weight: bold; color: #374151;">${booking.origin} → ${booking.destination}</td></tr>
                <tr><td style="padding: 8px 0; color: #6b7280;">Status</td><td><span style="background: #fee2e2; color: #dc2626; padding: 4px 12px; border-radius: 20px; font-weight: bold;">CANCELLED</span></td></tr>
              </table>
            </div>
            <p style="color: #6b7280; font-size: 14px;">If you paid for this booking, refunds are processed within 5-10 business days depending on your payment method.</p>
            <p style="color: #6b7280; font-size: 14px;">Need help? Contact our support team.</p>
          </div>
        </div>
      `
    });
  } catch (e) {
    console.log('sendBookingCancellationEmail error:', e.message);
  }
};

module.exports = { sendWelcomeEmail, sendBookingConfirmationEmail, sendPaymentConfirmationEmail, sendPriceAlertEmail, sendBookingCancellationEmail };