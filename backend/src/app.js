
// Temporary debug route

app.get('/api/debug-env', (req, res) => {
  res.json({
    hasResendKey: !!process.env.RESEND_API_KEY,
    resendKeyPrefix: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 8) : 'NOT SET',
    nodeEnv: process.env.NODE_ENV
  });
});

module.exports = app;
