const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getFarmerOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, farmerOnly } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getUserOrders);
router.get('/farmer-orders', protect, farmerOnly, getFarmerOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, farmerOnly, updateOrderStatus);

module.exports = router;
