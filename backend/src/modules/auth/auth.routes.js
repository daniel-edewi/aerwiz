const express = require('express');
const router = express.Router();
const { register, login, getProfile, forgotPassword, resetPassword } = require('./auth.controller');
const { registerValidation, loginValidation } = require('./auth.validation');
const { protect } = require('../../middleware/auth');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', protect, getProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
