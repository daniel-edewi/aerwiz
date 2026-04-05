const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST /api/affiliate/apply
router.post('/apply', async (req, res) => {
  const { name, email, phone, platform, audience } = req.body;
  if (!name || !email) return res.status(400).json({ success: false, message: 'Name and email are required' });
  try {
    // Notify team
    await transporter.sendMail({
      from: `"Aerwiz Affiliates" <${process.env.EMAIL_USER}>`,
      to: 'support@aerwiz.com',
      replyTo: email,
      subject: `[Aerwiz] New Affiliate Application — ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#1d4ed8;padding:24px 32px;border-radius:12px 12px 0 0;">
            <h2 style="color:white;margin:0;">New Affiliate Application</h2>
          </div>
          <div style="background:#f8fafc;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px;width:120px;">Name</td><td style="padding:8px 0;font-weight:600;color:#1e293b;">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Email</td><td style="padding:8px 0;font-weight:600;color:#1e293b;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Phone</td><td style="padding:8px 0;font-weight:600;color:#1e293b;">${phone || 'Not provided'}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Platform</td><td style="padding:8px 0;font-weight:600;color:#1e293b;">${platform || 'Not specified'}</td></tr>
            </table>
            <div style="margin-top:20px;padding:16px;background:white;border-radius:8px;border:1px solid #e2e8f0;">
              <p style="color:#64748b;font-size:12px;margin:0 0 8px;text-transform:uppercase;">About Their Audience</p>
              <p style="color:#1e293b;margin:0;line-height:1.6;">${audience || 'Not provided'}</p>
            </div>
          </div>
        </div>
      `,
    });

    // Confirmation to applicant
    await transporter.sendMail({
      from: `"Aerwiz" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Aerwiz Affiliate Application — Received',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#1d4ed8;padding:24px 32px;border-radius:12px 12px 0 0;">
            <h2 style="color:white;margin:0;">Application Received</h2>
          </div>
          <div style="background:#f8fafc;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
            <p style="color:#1e293b;">Hi ${name},</p>
            <p style="color:#475569;line-height:1.6;">Thank you for applying to the Aerwiz Affiliate Programme. We've received your application and our team will review it within 48 hours.</p>
            <p style="color:#475569;line-height:1.6;">Once approved, you'll receive your unique referral link and access to your affiliate dashboard.</p>
            <p style="color:#475569;">If you have any questions in the meantime, reply to this email or WhatsApp us on <strong>+234 800 000 0000</strong>.</p>
            <br/>
            <p style="color:#94a3b8;font-size:13px;">The Aerwiz Team</p>
          </div>
        </div>
      `,
    });

    res.json({ success: true, message: 'Application received successfully' });
  } catch (err) {
    console.error('Affiliate apply error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit application' });
  }
});

module.exports = router;
