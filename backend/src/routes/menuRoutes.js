const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getCategories,
  getMenuItemById
} = require('../controllers/menuController');

// Public endpoints - anyone can read menu and categories
router.get('/', getMenuItems);
router.get('/categories', getCategories);
router.get('/:id', getMenuItemById);

module.exports = router;
