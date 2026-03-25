// src/routes/orders.js
const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { db } = require('../services/firebase');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/orders/create-payment - create Razorpay order
router.post('/create-payment', authenticate, async (req, res) => {
  try {
    const { amount } = req.body; // in paise
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/orders - place order after payment
router.post('/', authenticate, async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentId, razorpayOrderId, razorpaySignature } = req.body;

    // Verify Razorpay signature
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${paymentId}`)
      .digest('hex');

    if (expectedSig !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const order = {
      userId: req.user.uid,
      orderType: 'regular',
      items,
      totalAmount,
      shippingAddress,
      paymentId,
      paymentStatus: 'paid',
      status: 'confirmed',
      createdAt: new Date(),
    };

    const ref = await db.collection('orders').add(order);

    // Clear cart
    await db.collection('cart').doc(req.user.uid).set({ items: [], updatedAt: new Date() });

    // Log interaction for ML
    await logPurchaseInteraction(req.user.uid, items);

    res.status(201).json({ orderId: ref.id, ...order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders - user's orders
router.get('/', authenticate, async (req, res) => {
  try {
    const snap = await db.collection('orders')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/all - admin: all orders
router.get('/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const snap = await db.collection('orders').orderBy('createdAt', 'desc').limit(100).get();
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/status - admin update status
router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.collection('orders').doc(req.params.id).update({
      status: req.body.status,
      updatedAt: new Date(),
    });
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function logPurchaseInteraction(userId, items) {
  try {
    const ref = db.collection('userInteractions').doc(userId);
    const snap = await ref.get();
    const existing = snap.exists ? snap.data() : { purchasedProducts: [] };
    const newPurchases = items.map(i => i.productId);
    await ref.set({
      ...existing,
      purchasedProducts: [...(existing.purchasedProducts || []), ...newPurchases],
      updatedAt: new Date(),
    });
  } catch (_) {}
}

module.exports = router;
