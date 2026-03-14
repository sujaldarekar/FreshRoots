const express = require('express');
const router = express.Router();
const {
  getAllFarmers,
  getNearbyFarmers,
  getFarmerProfile,
  rateFarmer,
} = require('../controllers/farmerController');
const { protect } = require('../middleware/auth');

router.get('/', getAllFarmers);
router.get('/nearby', getNearbyFarmers);
router.get('/:id', getFarmerProfile);
router.post('/:id/rate', protect, rateFarmer);

module.exports = router;
