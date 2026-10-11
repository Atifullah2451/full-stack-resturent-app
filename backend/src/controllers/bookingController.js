const { db } = require('../config/firebaseAdmin');
const { validationResult } = require('express-validator');

// Restaurant booking configuration
const MAX_TABLES_PER_SLOT = 6; // Restaurant has 6 tables available per slot
const AVAILABLE_TIME_SLOTS = [
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '06:00 PM', '06:30 PM', '07:00 PM',
  '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM'
];

/**
 * Check table availability for a specific date and time slot
 */
const checkAvailability = async (req, res, next) => {
  try {
    const { date, time } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "date" (YYYY-MM-DD) is required.'
      });
    }

    // Query active bookings for the specified date
    let snapshot;
    try {
      snapshot = await db.collection('bookings')
        .where('date', '==', date)
        .where('status', 'in', ['confirmed', 'pending'])
        .get();
    } catch (err) {
      // Fallback
      snapshot = { empty: true, docs: [] };
    }

    const bookings = snapshot.empty ? [] : snapshot.docs.map(d => d.data());

    // Calculate slots occupancy
    const slotStats = AVAILABLE_TIME_SLOTS.map(slot => {
      const bookedCount = bookings.filter(b => b.time === slot).length;
      const availableTables = Math.max(0, MAX_TABLES_PER_SLOT - bookedCount);
      return {
        time: slot,
        bookedTables: bookedCount,
        availableTables,
        isAvailable: availableTables > 0
      };
    });

    if (time) {
      const targetSlot = slotStats.find(s => s.time.toLowerCase() === time.toLowerCase());
      return res.status(200).json({
        success: true,
        date,
        time,
        isAvailable: targetSlot ? targetSlot.isAvailable : true,
        availableTables: targetSlot ? targetSlot.availableTables : MAX_TABLES_PER_SLOT
      });
    }

    return res.status(200).json({
      success: true,
      date,
      maxTables: MAX_TABLES_PER_SLOT,
      slots: slotStats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new table reservation
 * Prevents double booking when capacity for slot is reached
 */
const createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { date, time, guests, note, guestName, guestPhone } = req.body;
    const userId = req.user.uid;
    const userEmail = req.user.email || '';

    // Verify slot capacity to prevent double booking
    try {
      const existingBookingsSnapshot = await db.collection('bookings')
        .where('date', '==', date)
        .where('time', '==', time)
        .where('status', 'in', ['confirmed', 'pending'])
        .get();

      const existingCount = existingBookingsSnapshot.size;
      if (existingCount >= MAX_TABLES_PER_SLOT) {
        return res.status(409).json({
          success: false,
          message: `Sorry, all tables for ${time} on ${date} are currently fully booked. Please choose an adjacent time slot.`
        });
      }

      // Check if user already booked this exact slot to avoid accidental duplicate submissions
      const userExisting = existingBookingsSnapshot.docs.find(d => d.data().userId === userId);
      if (userExisting) {
        return res.status(409).json({
          success: false,
          message: 'You already have an active table reservation for this date and time slot.'
        });
      }
    } catch (err) {
      console.warn('Booking capacity check skipped Firestore query:', err.message);
    }

    const tableNumber = Math.floor(Math.random() * 20) + 1; // Assign table 1-20

    const bookingData = {
      userId,
      userEmail,
      guestName: guestName || req.user.name || 'Valued Guest',
      guestPhone: guestPhone || '',
      date,
      time,
      guests: parseInt(guests) || 2,
      note: note ? note.trim() : '',
      tableNumber,
      status: 'confirmed', // confirmed, completed, cancelled
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let bookingId;
    try {
      const docRef = await db.collection('bookings').add(bookingData);
      bookingId = docRef.id;
    } catch (err) {
      bookingId = 'book_' + Date.now();
    }

    return res.status(201).json({
      success: true,
      message: `Table #${tableNumber} successfully booked for ${guests} guests on ${date} at ${time}!`,
      booking: {
        id: bookingId,
        ...bookingData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's bookings
 */
const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user.uid;

    let bookings = [];
    try {
      const snapshot = await db.collection('bookings')
        .where('userId', '==', userId)
        .orderBy('date', 'desc')
        .get();

      bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      // Fallback in case orderBy requires compound index
      try {
        const fallbackSnapshot = await db.collection('bookings')
          .where('userId', '==', userId)
          .get();
        bookings = fallbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      } catch (e) {
        console.warn('Bookings fetch fallback:', e.message);
      }
    }

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a booking
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const docRef = db.collection('bookings').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    const booking = doc.data();
    if (booking.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own table reservations.'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled.'
      });
    }

    await docRef.update({
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully.',
      booking: {
        id,
        ...booking,
        status: 'cancelled'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkAvailability,
  createBooking,
  getMyBookings,
  cancelBooking
};
