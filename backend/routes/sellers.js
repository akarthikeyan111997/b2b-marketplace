const express = require('express');
const router = express.Router();
const {
  getSellerProfile,
  getSellerProducts,
  getFeaturedSellers
} = require('../controllers/sellerController');

// Featured sellers must be before /:id
router.get('/featured', getFeaturedSellers);
router.get('/:id', getSellerProfile);
router.get('/:id/products', getSellerProducts);

module.exports = router;
