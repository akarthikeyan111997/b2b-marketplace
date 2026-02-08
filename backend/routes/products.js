const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  removeProductImage
} = require('../controllers/productController');

// Validation rules
const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('priceMin').isNumeric().withMessage('Minimum price is required'),
  body('moq').optional().isInt({ min: 1 }).withMessage('MOQ must be at least 1')
];

// Public routes
router.get('/', getProducts);

// Seller's own products (must be before /:id route)
router.get('/seller/my-products', protect, authorize('seller'), getMyProducts);

// Public single product
router.get('/:id', getProduct);

// Seller-only routes
router.post(
  '/',
  protect,
  authorize('seller'),
  upload.array('images', 5),
  productValidation,
  createProduct
);

router.put(
  '/:id',
  protect,
  authorize('seller', 'admin'),
  upload.array('images', 5),
  updateProduct
);

router.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct);
router.delete('/:id/images/:imageIndex', protect, authorize('seller', 'admin'), removeProductImage);

module.exports = router;
