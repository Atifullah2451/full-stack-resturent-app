const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');
const {
  checkAvailability,
  createBooking,
  getMyBookings,
  cancelBooking
} = require('../controllers/bookingController');

// Public route to view slot availability
router.get(
  '/check-availability',
  [
    query('date').isISO8601().withMessage('Valid date in YYYY-MM-DD format required')
  ],
  checkAvailability
);

// Protected routes
router.use(verifyFirebaseToken);

router.post(
  '/',
  [
    body('date').isISO8601().withMessage('Valid date (YYYY-MM-DD) is required'),
    body('time').notEmpty().withMessage('Time slot is required'),
    body('guests').isInt({ min: 1, max: 20 }).withMessage('Number of guests must be between 1 and 20'),
    body('note').optional().isString()
  ],
  createBooking
);

router.get('/my-bookings', getMyBookings);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;
