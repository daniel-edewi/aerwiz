const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const https = require('https');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sendBrevoEmail = (to, subject, html) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      sender: { name: 'Aerwiz', email: 'noreply@aerwiz.com' },
      to: [{ email: to }],
      subject,
      htmlContent: html
    });
    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      family: 4,
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(JSON.parse(data));
        else reject(new Error('Brevo error: ' + data));
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
    req.write(body);
    req.end();
  });
};

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const { email, password, firstName, lastName, phone } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, password: hashed, firstName, lastName, phone } });

    res.status(201).json({ success: true, data: { token: generateToken(user.id), user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } } });

    // Send welcome email after responding (non-blocking)
    sendBrevoEmail(
      email,
      'Welcome to Aerwiz, ' + firstName + '!',
      '<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">' +
      '<div style="text-align:center;margin-bottom:24px;">' +
      '<span style="font-size:32px;font-weight:900;color:#1e3a5f;">aer</span><span style="font-size:32px;font-weight:900;color:#2563eb;">wiz</span>' +
      '</div>' +
      '<div style="background:white;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">' +
      '<h2 style="color:#1e293b;margin:0 0 8px;">Welcome aboard, ' + firstName + '!</h2>' +
      '<p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 20px;">Your Aerwiz account has been created. You can now search and book flights across Africa and the world at the best prices.</p>' +
      '<div style="background:#f0f9ff;border-radius:12px;padding:20px;margin:0 0 24px;border:1px solid #bfdbfe;">' +
      '<p style="color:#1e293b;font-size:13px;margin:0 0 8px;font-weight:600;">Your account details:</p>' +
      '<p style="color:#64748b;font-size:13px;margin:0 0 4px;">Email: <strong>' + email + '</strong></p>' +
      '<p style="color:#64748b;font-size:13px;margin:0;">Name: <strong>' + firstName + ' ' + lastName + '</strong></p>' +
      '</div>' +
      '<div style="text-align:center;">' +
      '<a href="https://aerwiz.com" style="background:#2563eb;color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;display:inline-block;">Search Flights Now</a>' +
      '</div>' +
      '<div style="margin-top:24px;padding-top:20px;border-top:1px solid #e2e8f0;">' +
      '<p style="color:#64748b;font-size:13px;margin:0 0 8px;"><strong>What you can do with Aerwiz:</strong></p>' +
      '<p style="color:#94a3b8;font-size:12px;margin:0 0 4px;">✈ Search and book flights across Africa and worldwide</p>' +
      '<p style="color:#94a3b8;font-size:12px;margin:0 0 4px;">🔔 Set price alerts and get notified when fares drop</p>' +
      '<p style="color:#94a3b8;font-size:12px;margin:0 0 4px;">📱 Manage all your bookings from your dashboard</p>' +
      '<p style="color:#94a3b8;font-size:12px;margin:0;">💼 Download e-tickets and boarding passes instantly</p>' +
      '</div></div>' +
      '<p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:20px;">Questions? Contact us at support@aerwiz.com or call +234 800 000 0000<br/>© 2026 Aerwiz. All Rights Reserved.</p>' +
      '</div>'
    ).then(r => console.log('Welcome email sent:', r?.messageId)).catch(e => console.error('Welcome email error:', e.message));

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });
    res.json({ success: true, data: { token: generateToken(user.id), user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, nationality: true, dateOfBirth: true, passportNumber: true, passportExpiry: true, role: true, createdAt: true }
    });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.user.update({ where: { email }, data: { resetToken: token, resetTokenExpiry: expiry } });
    const resetUrl = (process.env.FRONTEND_URL || 'https://aerwiz.com') + '/reset-password?token=' + token;
    await sendBrevoEmail(email, 'Reset your Aerwiz password',
      '<div style="font-family:sans-serif;padding:32px;max-width:500px;margin:0 auto;">' +
      '<h2 style="color:#1e3a5f;">Reset your password</h2>' +
      '<p>Hi ' + user.firstName + ', click below to reset your Aerwiz password.</p>' +
      '<a href="' + resetUrl + '" style="background:#2563eb;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:700;margin:20px 0;">Reset Password</a>' +
      '<p style="color:#94a3b8;font-size:12px;">Expires in 1 hour. Didn\'t request this? Ignore this email.</p>' +
      '</div>'
    );
    res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send reset email' });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ success: false, message: 'Token and password are required' });
  if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
  try {
    const user = await prisma.user.findFirst({ where: { resetToken: token, resetTokenExpiry: { gt: new Date() } } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset link.' });
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed, resetToken: null, resetTokenExpiry: null } });
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { register, login, getProfile, forgotPassword, resetPassword };
