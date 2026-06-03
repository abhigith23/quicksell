// routes/reports.js
const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, async (req, res) => {
  const { listingId, reportedUserId, reason } = req.body;
  try {
    await admin.firestore().collection('reports').add({
      listingId, reportedUserId, reportedBy: req.userId,
      reason, resolved: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    // Flag the listing
    await admin.firestore().collection('listings').doc(listingId).update({
      reports: admin.firestore.FieldValue.arrayUnion(req.userId)
    });
    res.status(201).json({ message: 'Report submitted. We will review it shortly.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
