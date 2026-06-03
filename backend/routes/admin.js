const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');
const { verifyAdmin } = require('../middleware/auth');
const { sendListingStatusEmail } = require('../utils/emailService');

// Dashboard stats
router.get('/dashboard', verifyAdmin, async (req, res) => {
  try {
    const [users, listings, reports] = await Promise.all([
      admin.firestore().collection('users').get(),
      admin.firestore().collection('listings').get(),
      admin.firestore().collection('reports').get()
    ]);
    const listingData = listings.docs.map(d => d.data());
    res.json({
      totalUsers: users.size,
      totalListings: listings.size,
      pendingListings: listingData.filter(l => l.status === 'pending').length,
      approvedListings: listingData.filter(l => l.status === 'approved').length,
      rejectedListings: listingData.filter(l => l.status === 'rejected').length,
      totalReports: reports.size,
      unresolvedReports: reports.docs.filter(d => !d.data().resolved).length
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all listings (for admin)
router.get('/listings', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = admin.firestore().collection('listings');
    if (status) query = query.where('status', '==', status);
    const snap = await query.orderBy('createdAt', 'desc').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Approve listing
router.post('/listings/:id/approve', verifyAdmin, async (req, res) => {
  try {
    const doc = await admin.firestore().collection('listings').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: 'Not found' });
    await doc.ref.update({ status: 'approved', approvedAt: admin.firestore.FieldValue.serverTimestamp() });
    // Get seller email and notify
    const sellerDoc = await admin.firestore().collection('users').doc(doc.data().sellerId).get();
    if (sellerDoc.exists) {
      await sendListingStatusEmail(sellerDoc.data().email, sellerDoc.data().name, doc.data().title, 'approved');
    }
    // Add notification
    await admin.firestore().collection('notifications').add({
      userId: doc.data().sellerId, type: 'listing_approved',
      title: 'Listing Approved ✅', message: `Your listing "${doc.data().title}" is now live!`,
      read: false, createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ message: 'Listing approved!' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Reject listing
router.post('/listings/:id/reject', verifyAdmin, async (req, res) => {
  const { reason } = req.body;
  try {
    const doc = await admin.firestore().collection('listings').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: 'Not found' });
    await doc.ref.update({ status: 'rejected', rejectionReason: reason, rejectedAt: admin.firestore.FieldValue.serverTimestamp() });
    const sellerDoc = await admin.firestore().collection('users').doc(doc.data().sellerId).get();
    if (sellerDoc.exists) {
      await sendListingStatusEmail(sellerDoc.data().email, sellerDoc.data().name, doc.data().title, 'rejected', reason);
    }
    await admin.firestore().collection('notifications').add({
      userId: doc.data().sellerId, type: 'listing_rejected',
      title: 'Listing Rejected ❌', message: `Your listing "${doc.data().title}" was rejected. Reason: ${reason}`,
      read: false, createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ message: 'Listing rejected.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all users
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const snap = await admin.firestore().collection('users').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Block/unblock user
router.post('/users/:id/block', verifyAdmin, async (req, res) => {
  const { reason } = req.body;
  try {
    await admin.firestore().collection('users').doc(req.params.id).update({
      isBlocked: true, blockReason: reason || 'Violated terms',
      blockedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ message: 'User blocked.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/users/:id/unblock', verifyAdmin, async (req, res) => {
  try {
    await admin.firestore().collection('users').doc(req.params.id).update({
      isBlocked: false, blockReason: '', unblockedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ message: 'User unblocked.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Categories CRUD
router.get('/categories', verifyAdmin, async (req, res) => {
  try {
    const snap = await admin.firestore().collection('categories').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/categories', verifyAdmin, async (req, res) => {
  const { name, icon } = req.body;
  try {
    const ref = await admin.firestore().collection('categories').add({ name, icon, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    res.status(201).json({ id: ref.id, name, icon });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/categories/:id', verifyAdmin, async (req, res) => {
  try {
    await admin.firestore().collection('categories').doc(req.params.id).update(req.body);
    res.json({ message: 'Category updated.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/categories/:id', verifyAdmin, async (req, res) => {
  try {
    await admin.firestore().collection('categories').doc(req.params.id).delete();
    res.json({ message: 'Category deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Reports
router.get('/reports', verifyAdmin, async (req, res) => {
  try {
    const snap = await admin.firestore().collection('reports').orderBy('createdAt', 'desc').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/reports/:id/resolve', verifyAdmin, async (req, res) => {
  const { action } = req.body;
  try {
    const reportDoc = await admin.firestore().collection('reports').doc(req.params.id).get();
    const report = reportDoc.data();
    if (action === 'delete_listing') {
      await admin.firestore().collection('listings').doc(report.listingId).delete();
    } else if (action === 'block_user') {
      await admin.firestore().collection('users').doc(report.reportedUserId).update({ isBlocked: true });
    }
    await reportDoc.ref.update({ resolved: true, action, resolvedAt: admin.firestore.FieldValue.serverTimestamp() });
    res.json({ message: 'Report resolved.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
