// src/routes/bulkOrders.js
const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { db } = require('../services/firebase');

// POST /api/bulk-orders - submit inquiry
router.post('/', authenticate, async (req, res) => {
  try {
    const bulk = {
      ...req.body,
      userId: req.user.uid,
      status: 'inquiry',
      quotedPrice: null,
      adminNotes: '',
      createdAt: new Date(),
    };
    const ref = await db.collection('bulkOrders').add(bulk);
    res.status(201).json({ id: ref.id, ...bulk });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bulk-orders/my - user's bulk orders
router.get('/my', authenticate, async (req, res) => {
  try {
    const snap = await db.collection('bulkOrders')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();
    res.json({ orders: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bulk-orders - admin: all bulk orders
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const snap = await db.collection('bulkOrders').orderBy('createdAt', 'desc').get();
    res.json({ orders: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/bulk-orders/:id - admin: update status/quote
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.collection('bulkOrders').doc(req.params.id).update({
      ...req.body,
      updatedAt: new Date(),
    });
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
