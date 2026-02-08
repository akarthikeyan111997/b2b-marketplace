const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  createInquiry,
  getMyInquiries,
  getSellerInquiries,
  respondToInquiry,
  markAsRead,
  getInquiry
} = require('../controllers/inquiryController');

const inquiryValidation = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required')
];

// Buyer routes
router.post('/', protect, authorize('buyer'), inquiryValidation, createInquiry);
router.get('/my-inquiries', protect, authorize('buyer'), getMyInquiries);

// Seller routes
router.get('/seller-inquiries', protect, authorize('seller'), getSellerInquiries);
router.put('/:id/respond', protect, authorize('seller'), respondToInquiry);
router.put('/:id/read', protect, authorize('seller'), markAsRead);

// Shared route (buyer, seller, admin)
router.get('/:id', protect, getInquiry);

module.exports = router;
