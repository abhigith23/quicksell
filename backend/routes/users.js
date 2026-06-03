// routes/users.js
const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

router.get('/:id', async (req, res) => {
  try {
    const doc = await admin.firestore().collection('users').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: 'User not found' });
    const { email, phone, isBlocked, isAdmin, ...publicData } = doc.data();
    res.json(publicData);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id/listings', async (req, res) => {
  try {
    const snap = await admin.firestore().collection('listings')
      .where('sellerId', '==', req.params.id).where('status', '==', 'approved').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
