const { sendBookingConfirmationEmail } = require('../../utils/emailService');
const prisma = require('../../config/prisma');
const { v4: uuidv4 } = require('uuid');

const generateBookingReference = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = 'AWZ';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

const createBooking = async (userId, bookingData) => {
  const {
    flightOffer,
    passengers,
    contactEmail,
    contactPhone
  } = bookingData;

  const segment = flightOffer.itineraries[0].segments[0];
  const lastSegment = flightOffer.itineraries[0].segments[flightOffer.itineraries[0].segments.length - 1];

  const bookingReference = generateBookingReference();

  const booking = await prisma.booking.create({
    data: {
      bookingReference,
      userId,
      flightData: flightOffer,
      origin: segment.departure.iataCode,
      destination: lastSegment.arrival.iataCode,
      departureDate: new Date(segment.departure.at),
      arrivalDate: new Date(lastSegment.arrival.at),
      airline: segment.carrierCode,
      flightNumber: `${segment.carrierCode}${segment.number}`,
      cabinClass: flightOffer.travelerPricings[0].fareDetailsBySegment[0].cabin,
      tripType: flightOffer.itineraries.length > 1 ? 'ROUND_TRIP' : 'ONE_WAY',
      baseFare: parseFloat(flightOffer.price.base),
      taxes: parseFloat(flightOffer.price.grandTotal) - parseFloat(flightOffer.price.base),
      serviceFee: 0,
      totalAmount: parseFloat(flightOffer.price.grandTotal),
      currency: flightOffer.price.currency,
      status: 'PENDING',
      passengers: {
        create: passengers.map(p => ({
          type: p.type || 'ADULT',
          title: p.title,
          firstName: p.firstName,
          lastName: p.lastName,
          dateOfBirth: new Date(p.dateOfBirth),
          nationality: p.nationality,
          passportNumber: p.passportNumber,
          passportExpiry: p.passportExpiry ? new Date(p.passportExpiry) : null,
          email: p.email || contactEmail,
          phone: p.phone || contactPhone
        }))
      }
    },
    include: {
      passengers: true
    }
  });
  try {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  await sendBookingConfirmationEmail(user, booking);
} catch (e) { console.log('Email error:', e.message); }

  return booking;
};

const getUserBookings = async (userId) => {
  return await prisma.booking.findMany({
    where: { userId },
    include: { passengers: true, payment: true },
    orderBy: { createdAt: 'desc' }
  });
};

const getBookingById = async (bookingId, userId) => {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: { passengers: true, payment: true }
  });

  if (!booking) throw new Error('Booking not found');
  return booking;
};

const getBookingByReference = async (reference, userId) => {
  const booking = await prisma.booking.findFirst({
    where: { bookingReference: reference, userId },
    include: { passengers: true, payment: true }
  });

  if (!booking) throw new Error('Booking not found');
  return booking;
};

const cancelBooking = async (bookingId, userId) => {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId }
  });

  if (!booking) throw new Error('Booking not found');
  if (booking.status === 'CANCELLED') throw new Error('Booking already cancelled');
  if (booking.status === 'CONFIRMED') throw new Error('Confirmed bookings cannot be cancelled online. Please contact support');

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' }
  });
};

module.exports = { createBooking, getUserBookings, getBookingById, getBookingByReference, cancelBooking };
