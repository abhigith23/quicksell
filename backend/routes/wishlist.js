// routes/wishlist.js
const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const userDoc = await admin.firestore().collection('users').doc(req.userId).get();
    const wishlistIds = userDoc.data().wishlist || [];
    if (!wishlistIds.length) return res.json([]);
    const listings = await Promise.all(
      wishlistIds.map(id => admin.firestore().collection('listings').doc(id).get())
    );
    res.json(listings.filter(d => d.exists).map(d => ({ id: d.id, ...d.data() })));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:listingId', verifyToken, async (req, res) => {
  try {
    await admin.firestore().collection('users').doc(req.userId).update({
      wishlist: admin.firestore.FieldValue.arrayUnion(req.params.listingId)
    });
    res.json({ message: 'Added to wishlist' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:listingId', verifyToken, async (req, res) => {
  try {
    await admin.firestore().collection('users').doc(req.userId).update({
      wishlist: admin.firestore.FieldValue.arrayRemove(req.params.listingId)
    });
    res.json({ message: 'Removed from wishlist' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
