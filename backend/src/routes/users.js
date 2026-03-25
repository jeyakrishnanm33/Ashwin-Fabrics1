// src/routes/users.js
const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { db } = require('../services/firebase');

// GET /api/users/me - get own profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const snap = await db.collection('users').doc(req.user.uid).get();
    if (!snap.exists) return res.status(404).json({ message: 'User not found' });
    res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/me - update own profile
router.put('/me', authenticate, async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'addresses', 'preferences'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    updates.updatedAt = new Date();
    await db.collection('users').doc(req.user.uid).update(updates);
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users - admin: list all users
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const snap = await db.collection('users').orderBy('createdAt', 'desc').limit(100).get();
    res.json({ users: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/users/:id/role - admin: change user role
router.patch('/:id/role', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.collection('users').doc(req.params.id).update({ role: req.body.role });
    res.json({ message: 'Role updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
