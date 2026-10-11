const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');

// All order routes require authenticated user
router.use(verifyFirebaseToken);

router.post(
  '/',
  [
    body('items').isArray({ min: 1 }).withMessage('At least 1 item is required to place an order'),
    body('items.*.id').notEmpty().withMessage('Item ID is required'),
    body('items.*.price').isNumeric().withMessage('Item price must be a number'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be an integer >= 1')
  ],
  createOrder
);

router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
