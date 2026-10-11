const { db } = require('../config/firebaseAdmin');
const { validationResult } = require('express-validator');

/**
 * Sync or create user profile in Firestore
 * Called after Firebase Auth signup on the mobile client.
 */
const syncProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { uid, email } = req.user;
    const { name, phone, address } = req.body;

    const userRef = db.collection('users').doc(uid);
    const existingDoc = await userRef.get();

    const userData = {
      uid,
      email: email || '',
      name: name || (existingDoc.exists ? existingDoc.data().name : ''),
      phone: phone || (existingDoc.exists ? existingDoc.data().phone : ''),
      address: address || (existingDoc.exists ? existingDoc.data().address : ''),
      updatedAt: new Date().toISOString()
    };

    if (!existingDoc.exists) {
      userData.createdAt = new Date().toISOString();
      userData.role = 'customer';
    }

    await userRef.set(userData, { merge: true });

    const finalDoc = await userRef.get();

    return res.status(200).json({
      success: true,
      message: 'Profile synchronized successfully',
      user: finalDoc.data()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const doc = await db.collection('users').doc(uid).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found in database.'
      });
    }

    return res.status(200).json({
      success: true,
      user: doc.data()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { uid } = req.user;
    const { name, phone, address } = req.body;

    const updates = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (address !== undefined) updates.address = address.trim();

    const userRef = db.collection('users').doc(uid);
    await userRef.set(updates, { merge: true });

    const updatedDoc = await userRef.get();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedDoc.data()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  syncProfile,
  getProfile,
  updateProfile
};
