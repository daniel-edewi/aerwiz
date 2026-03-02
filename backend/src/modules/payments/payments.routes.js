const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment } = require('./payments.controller');
const { protect } = require('../../middleware/auth');

router.post('/initialize', protect, initializePayment);
router.get('/verify/:reference', protect, verifyPayment);

module.exports = router;