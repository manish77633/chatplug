const router = require('express').Router();
const crypto = require('crypto');

// Verify webhook signature
const verifySignature = (req, res, next) => {
  const sig = req.headers['x-embediq-signature'];
  const body = JSON.stringify(req.body);
  const expected = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET).update(body).digest('hex');
  if (sig !== `sha256=${expected}`)
    return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
  next();
};

// Webhook receiver (external services can push events here)
router.post('/receive', verifySignature, async (req, res) => {
  const { event, data } = req.body;
  console.log('[Webhook]', event, data);
  // Handle events: payment.success, user.created, etc.
  res.json({ success: true, received: true });
});

module.exports = router;
