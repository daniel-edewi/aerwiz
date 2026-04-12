const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const https = require('https');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Store OTPs in memory (keyed by email) — good enough for free tier
const otpStore = new Map();

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
        else reject(new Error(`Brevo error: ${data}`));
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
    req.write(body);
    req.end();
  });
};

// POST /api/otp/send — send OTP to email
router.post('/send', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(email, { otp, expiry, verified: false });

  console.log(`OTP for ${email}: ${otp}`);

  try {
    await sendBrevoEmail(
      email,
      'Your Aerwiz Booking Verification Code',
      `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:28px;font-weight:900;color:#1e3a5f;">aer</span><span style="font-size:28px;font-weight:900;color:#2563eb;">wiz</span>
        </div>
        <div style="background:white;border-radius:12px;padding:32px;border:1px solid #e2e8f0;text-align:center;">
          <h2 style="color:#1e293b;margin:0 0 8px;">Verify your email</h2>
          <p style="color:#64748b;font-size:14px;margin:0 0 24px;">Use this code to verify your email for your Aerwiz booking.</p>
          <div style="background:#f0f9ff;border:2px dashed #bfdbfe;border-radius:12px;padding:20px;margin:0 0 24px;">
            <p style="font-size:40px;font-weight:900;color:#1d4ed8;letter-spacing:12px;margin:0;font-family:monospace;">${otp}</p>
          </div>
          <p style="color:#94a3b8;font-size:12px;margin:0;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        </div>
        <p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:20px;">© 2026 Aerwiz. All Rights Reserved.</p>
      </div>`
    );
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error('OTP send error:', err.message);
    // Still return success so booking isn't blocked — OTP is optional
    res.json({ success: true, message: 'OTP sent', fallback: true });
  }
});

// POST /api/otp/verify — verify OTP
router.post('/verify', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

  const record = otpStore.get(email);
  if (!record) return res.status(400).json({ success: false, message: 'No OTP found for this email. Please request a new code.' });
  if (Date.now() > record.expiry) {
    otpStore.delete(email);
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new code.' });
  }
  if (record.otp !== otp.toString()) return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });

  record.verified = true;
  res.json({ success: true, message: 'Email verified successfully' });
});

module.exports = router;