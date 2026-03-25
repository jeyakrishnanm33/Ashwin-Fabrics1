// src/routes/recommendations.js
const router = require('express').Router();
const axios = require('axios');
const { authenticate } = require('../middleware/auth');
const { db } = require('../services/firebase');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// GET /api/recommendations/user/:userId
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const response = await axios.get(`${ML_URL}/recommend/user/${req.params.userId}?limit=${req.query.limit || 10}`);
    
    // Hydrate with product data from Firestore
    const productIds = response.data.recommendations || [];
    const products = await Promise.all(
      productIds.map(async (id) => {
        const snap = await db.collection('products').doc(id).get();
        return snap.exists ? { id: snap.id, ...snap.data() } : null;
      })
    );

    res.json({ recommendations: products.filter(Boolean) });
  } catch (err) {
    // Fallback: return popular products if ML service is down
    try {
      const snap = await db.collection('products')
        .where('isFeatured', '==', true)
        .limit(10)
        .get();
      const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      res.json({ recommendations: products, fallback: true });
    } catch (_) {
      res.json({ recommendations: [] });
    }
  }
});

// GET /api/recommendations/product/:productId - similar products
router.get('/product/:productId', async (req, res) => {
  try {
    const response = await axios.get(`${ML_URL}/recommend/product/${req.params.productId}?limit=6`);
    const productIds = response.data.similar || [];

    const products = await Promise.all(
      productIds.map(async (id) => {
        const snap = await db.collection('products').doc(id).get();
        return snap.exists ? { id: snap.id, ...snap.data() } : null;
      })
    );

    res.json({ similar: products.filter(Boolean) });
  } catch (err) {
    res.json({ similar: [] });
  }
});

// POST /api/recommendations/log - log user interaction
router.post('/log', authenticate, async (req, res) => {
  try {
    const { productId, action } = req.body;
    const ref = db.collection('userInteractions').doc(req.user.uid);
    const snap = await ref.get();
    const data = snap.exists ? snap.data() : {};

    if (action === 'view') {
      const views = data.viewedProducts || [];
      if (!views.includes(productId)) views.unshift(productId);
      await ref.set({ ...data, viewedProducts: views.slice(0, 50), updatedAt: new Date() });
    }

    res.json({ ok: true });
  } catch (_) {
    res.json({ ok: false });
  }
});

module.exports = router;
