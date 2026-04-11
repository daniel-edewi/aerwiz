const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const https = require('https');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sendEmail = (to, subject, html) => {
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
        console.log('Brevo response status:', res.statusCode);
        console.log('Brevo response body:', data);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Brevo failed: ${data}`));
        }
      });
    });
    req.on('error', (err) => {
      console.error('Brevo request error:', err.message);
      reject(err);
    });
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Brevo request timed out'));
    });
    req.write(body);
    req.end();
  });
};

router.post('/forgot', async (req, res) => {
  const { email } = req.body;
  console.log('FORGOT PASSWORD FOR:', email);
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.user.update({ where: { email }, data: { resetToken: token, resetTokenExpiry: expiry } });
    const resetUrl = `https://aerwiz.com/reset-password?token=${token}`;
    const result = await sendEmail(
      email,
      'Reset your Aerwiz password',
      `<div style="font-family:sans-serif;padding:32px;max-width:500px;margin:0 auto;">
        <h2 style="color:#1e3a5f;">Reset your password</h2>
        <p>Hi ${user.firstName}, click below to reset your Aerwiz password.</p>
        <a href="${resetUrl}" style="background:#2563eb;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:700;margin:20px 0;">Reset Password</a>
        <p style="color:#94a3b8;font-size:12px;">Expires in 1 hour. Didn't request this? Ignore this email.</p>
      </div>`
    );
    console.log('Email sent successfully:', result.messageId);
    res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    console.error('FORGOT ERROR:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

router.post('/reset', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ success: false, message: 'Token and password required' });
  if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
  try {
    const user = await prisma.user.findFirst({ where: { resetToken: token, resetTokenExpiry: { gt: new Date() } } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset link' });
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed, resetToken: null, resetTokenExpiry: null } });
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error('RESET ERROR:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
