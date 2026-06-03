const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const admin = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');
const { sendVerificationEmail, sendWelcomeEmail } = require('../utils/emailService');

const signToken = (uid) => jwt.sign({ uid }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Register
router.post('/register', async (req, res) => {
  const { email, password, name, phone } = req.body;
  try {
    const userRecord = await admin.auth().createUser({ email, password, displayName: name });
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid, email, name, phone: phone || '',
      photoURL: '', isAdmin: false, isBlocked: false,
      emailVerified: false, wishlist: [], listings: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await sendVerificationEmail(email, name, userRecord.uid);
    res.status(201).json({ message: 'Account created! Please verify your email.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email } = req.body;
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const userDoc = await admin.firestore().collection('users').doc(userRecord.uid).get();
    const userData = userDoc.data();
    if (userData.isBlocked) return res.status(403).json({ message: 'Account blocked. Contact support.' });
    const token = signToken(userRecord.uid);
    res.json({ token, user: { ...userData, uid: userRecord.uid } });
  } catch (err) {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Google Login
router.post('/google', async (req, res) => {
  const { idToken } = req.body;
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decoded;
    const userRef = admin.firestore().collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      await userRef.set({
        uid, email, name: name || '', photoURL: picture || '',
        phone: '', isAdmin: false, isBlocked: false,
        emailVerified: true, wishlist: [], listings: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      await sendWelcomeEmail(email, name);
    }
    const userData = (await userRef.get()).data();
    if (userData.isBlocked) return res.status(403).json({ message: 'Account blocked.' });
    const token = signToken(uid);
    res.json({ token, user: userData });
  } catch (err) {
    res.status(400).json({ message: 'Google authentication failed' });
  }
});

// Verify Email
router.get('/verify-email', async (req, res) => {
  const { uid } = req.query;
  try {
    await admin.firestore().collection('users').doc(uid).update({ emailVerified: true });
    await admin.auth().updateUser(uid, { emailVerified: true });
    res.json({ message: 'Email verified successfully!' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const doc = await admin.firestore().collection('users').doc(req.userId).get();
    if (!doc.exists) return res.status(404).json({ message: 'User not found' });
    res.json(doc.data());
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update profile
router.put('/profile', verifyToken, async (req, res) => {
  const { name, phone, photoURL } = req.body;
  try {
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (photoURL) updates.photoURL = photoURL;
    await admin.firestore().collection('users').doc(req.userId).update(updates);
    res.json({ message: 'Profile updated!' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
