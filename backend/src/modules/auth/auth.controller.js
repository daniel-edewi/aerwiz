const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { Resend } = require('resend');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();


const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

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
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, email: true, firstName: true, lastName: true, phone: true, nationality: true, dateOfBirth: true, passportNumber: true, passportExpiry: true, role: true, createdAt: true } });
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
    // Always return success to prevent email enumeration
    if (!user) return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry }
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'https://aerwiz.com'}/reset-password?token=${token}`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Aerwiz <noreply@aerwiz.com>',
      to: email,
      subject: 'Reset your Aerwiz password',
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px;border-radius:16px;">
          <div style="text-align:center;margin-bottom:32px;">
            <svg viewBox="0 0 800 300" height="48" xmlns="http://www.w3.org/2000/svg">
              <text x="400" y="210" text-anchor="middle" font-family="system-ui,sans-serif" font-size="160" font-weight="800" letter-spacing="-5">
                <tspan fill="#1e3a5f">aer</tspan><tspan fill="#2563eb">wiz</tspan>
              </text>
            </svg>
          </div>
          <div style="background:white;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
            <h2 style="color:#1e293b;margin:0 0 8px;font-size:22px;">Reset your password</h2>
            <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;">
              Hi ${user.firstName}, we received a request to reset your Aerwiz password. Click the button below to set a new password.
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${resetUrl}" style="background:#2563eb;color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;display:inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:24px 0 0;">
              This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password will not change.
            </p>
            <p style="color:#94a3b8;font-size:12px;margin:8px 0 0;">
              Or copy this link: <a href="${resetUrl}" style="color:#2563eb;">${resetUrl}</a>
            </p>
          </div>
          <p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:24px;">
            © 2026 Aerwiz. All Rights Reserved.
          </p>
        </div>
      `
    });

    res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    console.error('Forgot password error:', JSON.stringify(err));
    res.status(500).json({ success: false, message: 'Failed to send reset email' });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ success: false, message: 'Token and password are required' });
  if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset link. Please request a new one.' });

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExpiry: null }
    });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { register, login, getProfile, forgotPassword, resetPassword };
