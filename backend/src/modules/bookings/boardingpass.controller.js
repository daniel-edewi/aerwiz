const prisma = require('../../config/prisma');
const generateBoardingPass = require('../../utils/generateBoardingPass');

const downloadBoardingPass = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;

    const booking = await prisma.booking.findFirst({
      where: { id, userId },
      include: { passengers: true }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const passenger = booking.passengers[0];
    const pdfBuffer = await generateBoardingPass(booking, passenger);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=boarding-pass-${booking.bookingReference}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { downloadBoardingPass };