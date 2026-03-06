const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../../middleware/auth');
const { validatePromo, createPromo, getAllPromos, togglePromo, deletePromo } = require('./promo.controller');

// Public - validate promo code
router.post('/validate', protect, validatePromo);

// Admin only
router.post('/', protect, adminOnly, createPromo);
router.get('/', protect, adminOnly, getAllPromos);
router.patch('/:id/toggle', protect, adminOnly, togglePromo);
router.delete('/:id', protect, adminOnly, deletePromo);

module.exports = router;