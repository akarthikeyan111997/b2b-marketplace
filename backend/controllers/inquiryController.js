const Inquiry = require('../models/Inquiry');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// @desc    Create an inquiry (buyer sends to seller)
// @route   POST /api/inquiries
// @access  Private (Buyer)
exports.createInquiry = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { productId, subject, message, quantity, quantityUnit, buyerPhone, buyerCompany, deliveryLocation } = req.body;

    // Find the product and its seller
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Prevent seller from inquiring on own product
    if (product.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send an inquiry for your own product'
      });
    }

    const inquiry = await Inquiry.create({
      buyer: req.user._id,
      seller: product.seller,
      product: productId,
      subject,
      message,
      quantity,
      quantityUnit,
      buyerPhone,
      buyerCompany,
      deliveryLocation
    });

    // Increment product inquiry count
    product.inquiryCount += 1;
    await product.save();

    await inquiry.populate([
      { path: 'product', select: 'name images priceMin priceMax' },
      { path: 'seller', select: 'name companyName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Inquiry sent successfully',
      data: inquiry
    });
  } catch (error) {
    console.error('CreateInquiry error:', error);
    res.status(500).json({ success: false, message: 'Server error creating inquiry' });
  }
};

// @desc    Get buyer's inquiries
// @route   GET /api/inquiries/my-inquiries
// @access  Private (Buyer)
exports.getMyInquiries = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = { buyer: req.user._id };
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const [inquiries, total] = await Promise.all([
      Inquiry.find(query)
        .populate('product', 'name images priceMin priceMax slug')
        .populate('seller', 'name companyName')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Inquiry.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: inquiries,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('GetMyInquiries error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get seller's received inquiries
// @route   GET /api/inquiries/seller-inquiries
// @access  Private (Seller)
exports.getSellerInquiries = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = { seller: req.user._id };
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const [inquiries, total] = await Promise.all([
      Inquiry.find(query)
        .populate('product', 'name images priceMin priceMax slug')
        .populate('buyer', 'name email phone')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Inquiry.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: inquiries,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('GetSellerInquiries error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Respond to an inquiry (seller)
// @route   PUT /api/inquiries/:id/respond
// @access  Private (Seller)
exports.respondToInquiry = async (req, res) => {
  try {
    const { response } = req.body;

    if (!response || response.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response message is required'
      });
    }

    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    if (inquiry.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this inquiry'
      });
    }

    inquiry.sellerResponse = response;
    inquiry.status = 'responded';
    inquiry.respondedAt = new Date();
    await inquiry.save();

    await inquiry.populate([
      { path: 'product', select: 'name images' },
      { path: 'buyer', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Response sent successfully',
      data: inquiry
    });
  } catch (error) {
    console.error('RespondToInquiry error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Mark inquiry as read (seller)
// @route   PUT /api/inquiries/:id/read
// @access  Private (Seller)
exports.markAsRead = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    if (inquiry.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (inquiry.status === 'pending') {
      inquiry.status = 'read';
      await inquiry.save();
    }

    res.json({ success: true, data: inquiry });
  } catch (error) {
    console.error('MarkAsRead error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single inquiry detail
// @route   GET /api/inquiries/:id
// @access  Private (Buyer or Seller involved)
exports.getInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('product', 'name images priceMin priceMax slug')
      .populate('buyer', 'name email phone')
      .populate('seller', 'name companyName email phone');

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    // Only buyer, seller, or admin can view
    const userId = req.user._id.toString();
    if (
      inquiry.buyer._id.toString() !== userId &&
      inquiry.seller._id.toString() !== userId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: inquiry });
  } catch (error) {
    console.error('GetInquiry error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
