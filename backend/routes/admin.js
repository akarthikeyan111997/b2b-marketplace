const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAnalytics,
  getUsers,
  approveSeller,
  toggleUserActive,
  getProductsForModeration,
  approveProduct,
  toggleFeatured,
  deleteProduct
} = require('../controllers/adminController');

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.put('/users/:id/approve', approveSeller);
router.put('/users/:id/toggle-active', toggleUserActive);
router.get('/products', getProductsForModeration);
router.put('/products/:id/approve', approveProduct);
router.put('/products/:id/feature', toggleFeatured);
router.delete('/products/:id', deleteProduct);

module.exports = router;
