// src/routes/products.js
const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { db } = require('../services/firebase');

// GET /api/products - list with filters
router.get('/', async (req, res) => {
  try {
    const { category, subCategory, featured, sale, sort, q, limit = 20, page = 1 } = req.query;

    let query = db.collection('products').where('isActive', '==', true);

    if (category) query = query.where('category', '==', category);
    if (subCategory) query = query.where('subCategory', '==', subCategory);
    if (featured === 'true') query = query.where('isFeatured', '==', true);

    const snap = await query.limit(Number(limit)).get();
    let products = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Search filter (basic - use Algolia for production)
    if (q) {
      const term = q.toLowerCase();
      products = products.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.tags?.some(t => t.toLowerCase().includes(term))
      );
    }

    if (sort === 'price_asc') products.sort((a, b) => a.discountPrice - b.discountPrice);
    if (sort === 'price_desc') products.sort((a, b) => b.discountPrice - a.discountPrice);
    if (sort === 'newest') products.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

    res.json({ products, total: products.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const snap = await db.collection('products').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ message: 'Product not found' });
    res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products - admin only
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const ref = await db.collection('products').add({
      ...req.body,
      isActive: true,
      createdAt: new Date(),
    });
    const snap = await ref.get();
    res.status(201).json({ id: snap.id, ...snap.data() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/products/:id - admin only
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.collection('products').doc(req.params.id).update({
      ...req.body,
      updatedAt: new Date(),
    });
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/products/:id - admin only (soft delete)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.collection('products').doc(req.params.id).update({ isActive: false });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
