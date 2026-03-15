const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  getFarmerProducts,
  updateProduct,
  deleteProduct,
  getProductRatings,
  rateProduct,
} = require('../controllers/productController');
const { protect, farmerOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/farmer/:farmerId', getFarmerProducts);
router.get('/:id/ratings', getProductRatings);
router.get('/:id', getProductById);
router.post('/', protect, farmerOnly, upload.single('image'), createProduct);
router.post('/:id/rate', protect, rateProduct);
router.put('/:id', protect, farmerOnly, upload.single('image'), updateProduct);
router.delete('/:id', protect, farmerOnly, deleteProduct);

module.exports = router;
