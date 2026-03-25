// src/middleware/auth.js
const { auth, db } = require('../services/firebase');

// Verify Firebase ID token
const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = await auth.verifyIdToken(token);
    req.user = decoded;

    // Attach Firestore profile
    const snap = await db.collection('users').doc(decoded.uid).get();
    req.userProfile = snap.exists ? snap.data() : null;

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Require admin role
const requireAdmin = (req, res, next) => {
  if (req.userProfile?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = { authenticate, requireAdmin };
