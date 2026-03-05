const prisma = require('../../config/prisma');
const { searchFlights } = require('../flights/flights.service');
const { sendPriceAlertEmail } = require('../../utils/emailService');

const createAlert = async (req, res) => {
  try {
    const { origin, destination, targetPrice, cabinClass, departureDate } = req.body;
    const userId = req.user.userId || req.user.id;

    const alert = await prisma.priceAlert.create({
      data: { userId, origin: origin.toUpperCase(), destination: destination.toUpperCase(), targetPrice: parseFloat(targetPrice), cabinClass: cabinClass || 'ECONOMY', departureDate }
    });

    res.status(201).json({ success: true, message: 'Price alert created!', data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAlerts = async (req, res) => {
  try {
    const alerts = await prisma.priceAlert.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.priceAlert.deleteMany({ where: { id, userId: req.user.userId } });
    res.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const checkAlerts = async () => {
  console.log('🔔 Checking price alerts...');
  try {
    const alerts = await prisma.priceAlert.findMany({
      where: { isActive: true },
      include: { user: true }
    });

    for (const alert of alerts) {
      try {
        const date = alert.departureDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const results = await searchFlights({ origin: alert.origin, destination: alert.destination, departureDate: date, adults: 1, cabinClass: alert.cabinClass });

        if (results && results.length > 0) {
          const lowestPrice = Math.min(...results.map(f => parseFloat(f.price.grandTotal)));

          await prisma.priceAlert.update({ where: { id: alert.id }, data: { lastChecked: new Date(), lastPrice: lowestPrice } });

          if (lowestPrice <= alert.targetPrice) {
            await sendPriceAlertEmail(alert.user, alert, lowestPrice);
            await prisma.priceAlert.update({ where: { id: alert.id }, data: { isActive: false, triggeredAt: new Date() } });
            console.log(`✅ Alert triggered for ${alert.user.email}: ${alert.origin}-${alert.destination} at ₦${lowestPrice}`);
          }
        }
      } catch (e) {
        console.log(`Alert check error for ${alert.id}:`, e.message);
      }
    }
  } catch (error) {
    console.log('checkAlerts error:', error.message);
  }
};

module.exports = { createAlert, getAlerts, deleteAlert, checkAlerts };