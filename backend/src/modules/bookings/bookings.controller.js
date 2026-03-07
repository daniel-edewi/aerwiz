const bookingsService = require('./bookings.service');

const createBooking = async (req, res) => {
  try {
    const booking = await bookingsService.createBooking(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const bookings = await bookingsService.getUserBookings(req.user.id);
    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await bookingsService.getBookingById(req.params.id, req.user.id);
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const getBookingByReference = async (req, res) => {
  try {
    const booking = await bookingsService.getBookingByReference(req.params.reference, req.user.id);
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await bookingsService.cancelBooking(req.params.id, req.user.id);
    res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const changeBookingDate = async (req, res) => {
  try {
    const { newDepartureDate } = req.body;
    if (!newDepartureDate) return res.status(400).json({ success: false, message: 'newDepartureDate is required' });
    const booking = await bookingsService.changeBookingDate(req.params.id, req.user.id, newDepartureDate);
    res.json({ success: true, message: 'Booking date updated successfully', data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const changeBookingRoute = async (req, res) => {
  try {
    const { origin, destination } = req.body;
    if (!origin || !destination) return res.status(400).json({ success: false, message: 'origin and destination are required' });
    const booking = await bookingsService.changeBookingRoute(req.params.id, req.user.id, { origin, destination });
    res.json({ success: true, message: 'Booking route updated successfully', data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { createBooking, getUserBookings, getBookingById, getBookingByReference, cancelBooking, changeBookingDate, changeBookingRoute };
