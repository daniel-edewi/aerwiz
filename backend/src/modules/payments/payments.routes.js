const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment } = require('./payments.controller');
const { optionalProtect, protect } = require('../../middleware/auth');

router.post('/initialize', optionalProtect, initializePayment);
router.get('/verify/:reference', optionalProtect, verifyPayment);

module.exports = router;