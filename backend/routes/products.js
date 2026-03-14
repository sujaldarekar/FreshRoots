const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  getFarmerProducts,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, farmerOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/farmer/:farmerId', getFarmerProducts);
router.get('/:id', getProductById);
router.post('/', protect, farmerOnly, upload.single('image'), createProduct);
router.put('/:id', protect, farmerOnly, upload.single('image'), updateProduct);
router.delete('/:id', protect, farmerOnly, deleteProduct);

module.exports = router;
