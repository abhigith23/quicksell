// routes/chat.js
const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

router.get('/rooms', verifyToken, async (req, res) => {
  try {
    const snap = await admin.firestore().collection('chatRooms')
      .where('participants', 'array-contains', req.userId).orderBy('lastMessageAt', 'desc').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/rooms', verifyToken, async (req, res) => {
  const { sellerId, listingId, listingTitle } = req.body;
  try {
    const roomId = [req.userId, sellerId].sort().join('_') + '_' + listingId;
    const roomRef = admin.firestore().collection('chatRooms').doc(roomId);
    const room = await roomRef.get();
    if (!room.exists) {
      const buyerDoc = await admin.firestore().collection('users').doc(req.userId).get();
      const sellerDoc = await admin.firestore().collection('users').doc(sellerId).get();
      await roomRef.set({
        participants: [req.userId, sellerId],
        listingId, listingTitle,
        buyerId: req.userId, buyerName: buyerDoc.data().name, buyerPhoto: buyerDoc.data().photoURL || '',
        sellerId, sellerName: sellerDoc.data().name, sellerPhoto: sellerDoc.data().photoURL || '',
        lastMessage: '', lastMessageAt: admin.firestore.FieldValue.serverTimestamp(), unread: 0
      });
    }
    res.json({ roomId });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/rooms/:roomId/messages', verifyToken, async (req, res) => {
  try {
    const snap = await admin.firestore().collection('chatRooms').doc(req.params.roomId)
      .collection('messages').orderBy('createdAt', 'asc').limit(100).get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
