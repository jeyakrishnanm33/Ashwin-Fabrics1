// backend/src/routes/reviews.js
const express = require('express');
const router  = express.Router();
const { db }  = require('../services/firebase');

// In-memory fallback when Firestore not available
let mockReviews = [];

// GET /api/reviews/:productId
router.get('/:productId', async (req, res) => {
  try {
    if (db) {
      const snap = await db.collection('reviews')
        .where('productId', '==', req.params.productId)
        .get();
      const reviews = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return res.json({ reviews });
    }
    const reviews = mockReviews.filter(r => r.productId === req.params.productId);
    res.json({ reviews });
  } catch (err) {
    res.json({ reviews: [] });
  }
});

// POST /api/reviews
router.post('/', async (req, res) => {
  try {
    const { productId, rating, title, body } = req.body;
    if (!productId || !rating) return res.status(400).json({ error: 'productId and rating required' });

    const review = {
      productId,
      rating: Number(rating),
      title: title || '',
      body: body || '',
      userId: req.user?.uid || 'anonymous',
      userName: req.user?.name || 'Anonymous',
      verified: false,
      helpful: 0,
      createdAt: new Date().toISOString(),
    };

    if (db) {
      const ref = await db.collection('reviews').add(review);
      // Update product rating average
      try {
        const allSnap = await db.collection('reviews').where('productId', '==', productId).get();
        const allReviews = allSnap.docs.map(d => d.data());
        const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
        await db.collection('products').doc(productId).update({
          'ratings.average': Math.round(avg * 10) / 10,
          'ratings.count': allReviews.length,
        });
      } catch (_) {}
      return res.json({ id: ref.id, ...review });
    }

    const id = Date.now().toString();
    mockReviews.push({ id, ...review });
    res.json({ id, ...review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/reviews/:id
router.put('/:id', async (req, res) => {
  try {
    const { rating, title, body } = req.body;
    const update = { rating: Number(rating), title: title || '', body: body || '' };

    if (db) {
      await db.collection('reviews').doc(req.params.id).update(update);
      return res.json({ id: req.params.id, ...update });
    }
    mockReviews = mockReviews.map(r => r.id === req.params.id ? { ...r, ...update } : r);
    res.json({ id: req.params.id, ...update });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews/:id/helpful
router.post('/:id/helpful', async (req, res) => {
  try {
    if (db) {
      const ref = db.collection('reviews').doc(req.params.id);
      const snap = await ref.get();
      if (snap.exists) {
        const current = snap.data().helpful || 0;
        await ref.update({ helpful: current + 1 });
      }
      return res.json({ success: true });
    }
    mockReviews = mockReviews.map(r =>
      r.id === req.params.id ? { ...r, helpful: (r.helpful || 0) + 1 } : r
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
