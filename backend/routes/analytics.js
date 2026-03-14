const express = require('express');
const router = express.Router();
const {
  createAnalytics,
  getFarmerAnalytics,
  updateAnalytics,
  deleteAnalytics,
} = require('../controllers/analyticsController');
const { protect, farmerOnly } = require('../middleware/auth');

router.post('/', protect, farmerOnly, createAnalytics);
router.get('/my-analytics', protect, farmerOnly, getFarmerAnalytics);
router.put('/:id', protect, farmerOnly, updateAnalytics);
router.delete('/:id', protect, farmerOnly, deleteAnalytics);

module.exports = router;
