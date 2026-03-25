// src/routes/payments.js
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder',
});

// POST /api/payments/create-order
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payments/verify
router.post('/verify', authenticate, (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder')
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
    if (expected !== razorpaySignature) {
      return res.status(400).json({ valid: false, message: 'Invalid signature' });
    }
    res.json({ valid: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
