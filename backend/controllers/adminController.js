const User = require('../models/User');
const Product = require('../models/Product');
const Inquiry = require('../models/Inquiry');
const Category = require('../models/Category');

// @desc    Get admin dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res) => {
  try {
    const [
      totalBuyers,
      totalSellers,
      pendingSellers,
      totalProducts,
      pendingProducts,
      activeProducts,
      totalInquiries,
      pendingInquiries,
      totalCategories
    ] = await Promise.all([
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({ role: 'seller' }),
      User.countDocuments({ role: 'seller', isApproved: false }),
      Product.countDocuments(),
      Product.countDocuments({ isApproved: false }),
      Product.countDocuments({ isActive: true, isApproved: true }),
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: 'pending' }),
      Category.countDocuments({ isActive: true })
    ]);

    // Recent activity - last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentUsers, recentProducts, recentInquiries] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Product.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Inquiry.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    res.json({
      success: true,
      data: {
        users: {
          totalBuyers,
          totalSellers,
          pendingSellers,
          recentSignups: recentUsers
        },
        products: {
          total: totalProducts,
          pending: pendingProducts,
          active: activeProducts,
          recentlyAdded: recentProducts
        },
        inquiries: {
          total: totalInquiries,
          pending: pendingInquiries,
          recentInquiries
        },
        categories: totalCategories
      }
    });
  } catch (error) {
    console.error('GetAnalytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all users (with filters)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20, approved } = req.query;
    const query = {};

    if (role) query.role = role;
    if (approved === 'true') query.isApproved = true;
    if (approved === 'false') query.isApproved = false;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('GetUsers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Approve or reject a seller
// @route   PUT /api/admin/users/:id/approve
// @access  Private (Admin)
exports.approveSeller = async (req, res) => {
  try {
    const { approved } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'seller') {
      return res.status(400).json({ success: false, message: 'User is not a seller' });
    }

    user.isApproved = approved;
    await user.save();

    res.json({
      success: true,
      message: approved ? 'Seller approved successfully' : 'Seller approval revoked',
      data: user
    });
  } catch (error) {
    console.error('ApproveSeller error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-active
// @access  Private (Admin)
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot deactivate admin accounts' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: user.isActive ? 'User activated' : 'User deactivated',
      data: user
    });
  } catch (error) {
    console.error('ToggleUserActive error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all products for moderation
// @route   GET /api/admin/products
// @access  Private (Admin)
exports.getProductsForModeration = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status === 'pending') query.isApproved = false;
    else if (status === 'approved') query.isApproved = true;
    else if (status === 'inactive') query.isActive = false;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name')
        .populate('seller', 'name companyName email')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('GetProductsForModeration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Approve or reject a product
// @route   PUT /api/admin/products/:id/approve
// @access  Private (Admin)
exports.approveProduct = async (req, res) => {
  try {
    const { approved } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.isApproved = approved;
    product.isActive = approved;
    await product.save();

    res.json({
      success: true,
      message: approved ? 'Product approved' : 'Product rejected',
      data: product
    });
  } catch (error) {
    console.error('ApproveProduct error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Toggle product featured status
// @route   PUT /api/admin/products/:id/feature
// @access  Private (Admin)
exports.toggleFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    res.json({
      success: true,
      message: product.isFeatured ? 'Product featured' : 'Product unfeatured',
      data: product
    });
  } catch (error) {
    console.error('ToggleFeatured error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a product (admin)
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('DeleteProduct error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
