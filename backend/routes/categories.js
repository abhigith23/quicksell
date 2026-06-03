// routes/categories.js
const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');

router.get('/', async (req, res) => {
  try {
    const snap = await admin.firestore().collection('categories').orderBy('name').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) {
    // Return default categories if Firestore is empty
    res.json([
      { id: '1', name: 'Electronics', icon: '📱' },
      { id: '2', name: 'Vehicles', icon: '🚗' },
      { id: '3', name: 'Furniture', icon: '🛋️' },
      { id: '4', name: 'Books', icon: '📚' },
      { id: '5', name: 'Clothing', icon: '👕' },
      { id: '6', name: 'Property', icon: '🏠' }
    ]);
  }
});

module.exports = router;
