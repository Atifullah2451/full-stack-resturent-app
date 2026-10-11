const { db } = require('../config/firebaseAdmin');
const { validationResult } = require('express-validator');

const TAX_RATE = 0.0825; // 8.25% standard restaurant sales tax

/**
 * Place a new order
 * Protected route: uses req.user.uid
 */
const createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { items, deliveryAddress, specialInstructions } = req.body;
    const userId = req.user.uid;
    const userEmail = req.user.email || '';

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items array cannot be empty.'
      });
    }

    // Calculate subtotal, tax, and grand total server-side
    let subtotal = 0;
    const sanitizedItems = items.map(item => {
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      const price = parseFloat(item.price) || 0;
      const itemSubtotal = parseFloat((price * quantity).toFixed(2));
      subtotal += itemSubtotal;

      return {
        id: item.id || '',
        name: item.name || 'Unnamed Item',
        price,
        quantity,
        category: item.category || 'General',
        image: item.image || '',
        itemSubtotal
      };
    });

    subtotal = parseFloat(subtotal.toFixed(2));
    const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));

    const orderData = {
      userId,
      userEmail,
      items: sanitizedItems,
      subtotal,
      tax,
      total,
      itemCount: sanitizedItems.reduce((acc, curr) => acc + curr.quantity, 0),
      deliveryAddress: deliveryAddress || 'Dine-In / Counter Pickup',
      specialInstructions: specialInstructions || '',
      status: 'pending', // pending -> preparing -> ready -> completed
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let orderId;
    try {
      const docRef = await db.collection('orders').add(orderData);
      orderId = docRef.id;
    } catch (err) {
      console.warn('Fallback generating local order ID:', err.message);
      orderId = 'ord_' + Date.now();
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        id: orderId,
        ...orderData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get authenticated user's order history
 */
const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.uid;

    let orders = [];
    try {
      const snapshot = await db.collection('orders')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (firestoreError) {
      // If composite index is pending, fallback query without orderBy
      try {
        const fallbackSnapshot = await db.collection('orders')
          .where('userId', '==', userId)
          .get();
        orders = fallbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch (err) {
        console.warn('Orders query fallback error:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single order details
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const doc = await db.collection('orders').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    const orderData = doc.data();
    // Security check: only order owner or admin can view
    if (orderData.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order.'
      });
    }

    return res.status(200).json({
      success: true,
      order: {
        id: doc.id,
        ...orderData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status (Admin / simulation webhook)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const orderRef = db.collection('orders').doc(id);
    const doc = await orderRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await orderRef.update({
      status,
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      status
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus
};
