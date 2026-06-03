const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');
const cloudinary = require('../config/cloudinary');
const { verifyToken } = require('../middleware/auth');
const { getPriceSuggestion } = require('../utils/groqService');

// Get all approved listings with search/filter
router.get('/', async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, condition, sortBy } = req.query;
    let query = admin.firestore().collection('listings').where('status', '==', 'approved');
    if (category) query = query.where('category', '==', category);
    if (condition) query = query.where('condition', '==', condition);

    const snap = await query.get();
    let listings = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (keyword) {
      const kw = keyword.toLowerCase();
      listings = listings.filter(l =>
        l.title.toLowerCase().includes(kw) || l.description.toLowerCase().includes(kw)
      );
    }
    if (minPrice) listings = listings.filter(l => l.price >= Number(minPrice));
    if (maxPrice) listings = listings.filter(l => l.price <= Number(maxPrice));

    if (sortBy === 'price-low') listings.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') listings.sort((a, b) => b.price - a.price);
    else listings.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    res.json({ count: listings.length, listings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const doc = await admin.firestore().collection('listings').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: 'Listing not found' });
    await doc.ref.update({ views: admin.firestore.FieldValue.increment(1) });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create listing
router.post('/', verifyToken, async (req, res) => {
  const { title, price, description, category, condition, images } = req.body;
  try {
    const userDoc = await admin.firestore().collection('users').doc(req.userId).get();
    const user = userDoc.data();

    // Upload images to Cloudinary
    const uploadedImages = [];
    for (const img of images) {
      const result = await cloudinary.uploader.upload(img, { folder: 'quicksell' });
      uploadedImages.push({ url: result.secure_url, publicId: result.public_id });
    }

    const ref = await admin.firestore().collection('listings').add({
      title, price: Number(price), description, category, condition,
      images: uploadedImages,
      sellerId: req.userId,
      sellerName: user.name,
      sellerPhoto: user.photoURL || '',
      sellerPhone: user.phone || '',
      status: 'pending',
      views: 0, reports: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await admin.firestore().collection('users').doc(req.userId).update({
      listings: admin.firestore.FieldValue.arrayUnion(ref.id)
    });
    res.status(201).json({ message: 'Listing submitted for approval!', listingId: ref.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update listing
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const doc = await admin.firestore().collection('listings').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: 'Not found' });
    if (doc.data().sellerId !== req.userId) return res.status(403).json({ message: 'Unauthorized' });
    const { title, price, description, category, condition } = req.body;
    await doc.ref.update({
      ...(title && { title }), ...(price && { price: Number(price) }),
      ...(description && { description }), ...(category && { category }),
      ...(condition && { condition }), status: 'pending',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ message: 'Listing updated and resubmitted for approval.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete listing
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const doc = await admin.firestore().collection('listings').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: 'Not found' });
    if (doc.data().sellerId !== req.userId) return res.status(403).json({ message: 'Unauthorized' });
    for (const img of doc.data().images || []) {
      await cloudinary.uploader.destroy(img.publicId).catch(() => {});
    }
    await doc.ref.delete();
    await admin.firestore().collection('users').doc(req.userId).update({
      listings: admin.firestore.FieldValue.arrayRemove(req.params.id)
    });
    res.json({ message: 'Listing deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// My listings
router.get('/user/mine', verifyToken, async (req, res) => {
  try {
    const snap = await admin.firestore().collection('listings')
      .where('sellerId', '==', req.userId).get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Price suggestion
router.post('/suggest-price', async (req, res) => {
  const { category, condition, description } = req.body;
  try {
    const price = await getPriceSuggestion(category, condition, description);
    res.json({ suggestedPrice: price });
  } catch (err) {
    res.status(500).json({ message: 'Could not generate suggestion' });
  }
});

module.exports = router;
