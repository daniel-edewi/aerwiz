const paymentsService = require('./payments.service');

const initializePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required' });
    }

    const result = await paymentsService.initializePayment(req.user.id, bookingId);
    res.json({
      success: true,
      message: 'Payment initialized',
      data: result
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const result = await paymentsService.verifyPayment(reference);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { initializePayment, verifyPayment };