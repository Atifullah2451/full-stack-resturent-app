const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');
const {
  syncProfile,
  getProfile,
  updateProfile
} = require('../controllers/authController');

// All profile endpoints are protected by Firebase token
router.post(
  '/sync',
  verifyFirebaseToken,
  [
    body('name').optional().isString().trim(),
    body('phone').optional().isString().trim(),
    body('address').optional().isString().trim()
  ],
  syncProfile
);

router.get('/profile', verifyFirebaseToken, getProfile);

router.put(
  '/profile',
  verifyFirebaseToken,
  [
    body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number format'),
    body('address').optional().isString()
  ],
  updateProfile
);

module.exports = router;
