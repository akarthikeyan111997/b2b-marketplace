const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get seller public profile
// @route   GET /api/sellers/:id
// @access  Public
exports.getSellerProfile = async (req, res) => {
  try {
    const seller = await User.findOne({
      _id: req.params.id,
      role: 'seller',
      isActive: true,
      isApproved: true
    }).select('-password');

    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    // Get seller's product count
    const productCount = await Product.countDocuments({
      seller: seller._id,
      isActive: true,
      isApproved: true
    });

    res.json({
      success: true,
      data: {
        ...seller.toJSON(),
        productCount
      }
    });
  } catch (error) {
    console.error('GetSellerProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get seller's products (public)
// @route   GET /api/sellers/:id/products
// @access  Public
exports.getSellerProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const query = {
      seller: req.params.id,
      isActive: true,
      isApproved: true
    };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
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
    console.error('GetSellerProducts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get featured sellers
// @route   GET /api/sellers/featured
// @access  Public
exports.getFeaturedSellers = async (req, res) => {
  try {
    const sellers = await User.find({
      role: 'seller',
      isActive: true,
      isApproved: true
    })
      .select('name companyName companyDescription companyAddress avatar establishedYear')
      .limit(8)
      .lean();

    // Get product counts for each seller
    const sellersWithCounts = await Promise.all(
      sellers.map(async (seller) => {
        const productCount = await Product.countDocuments({
          seller: seller._id,
          isActive: true,
          isApproved: true
        });
        return { ...seller, productCount };
      })
    );

    res.json({ success: true, data: sellersWithCounts });
  } catch (error) {
    console.error('GetFeaturedSellers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
