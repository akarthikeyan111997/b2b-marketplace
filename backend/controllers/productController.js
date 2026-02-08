const Product = require('../models/Product');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

// @desc    Get all products (public, with search & filters)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const {
      search, category, minPrice, maxPrice,
      sort, page = 1, limit = 12, featured
    } = req.query;

    const query = { isActive: true, isApproved: true };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category) {
      const cat = await Category.findOne({
        $or: [{ _id: category }, { slug: category }]
      });
      if (cat) query.category = cat._id;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.priceMin = {};
      if (minPrice) query.priceMin.$gte = Number(minPrice);
      if (maxPrice) query.priceMin.$lte = Number(maxPrice);
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { priceMin: 1 };
    else if (sort === 'price_desc') sortOption = { priceMin: -1 };
    else if (sort === 'popular') sortOption = { viewCount: -1 };
    else if (sort === 'name') sortOption = { name: 1 };
    else if (search) sortOption = { score: { $meta: 'textScore' }, createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('seller', 'name companyName companyAddress')
        .sort(sortOption)
        .skip(skip)
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
    console.error('GetProducts error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
};

// @desc    Get single product by ID or slug
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    let product = await Product.findOne({
      $or: [
        ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
        { slug: id }
      ]
    })
      .populate('category', 'name slug')
      .populate('seller', 'name companyName companyDescription companyAddress phone email website establishedYear employeeCount');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('GetProduct error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching product' });
  }
};

// @desc    Create a product (seller only)
// @route   POST /api/products
// @access  Private (Seller)
exports.createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Check if seller is approved
    if (!req.user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your seller account is pending approval'
      });
    }

    const productData = {
      ...req.body,
      seller: req.user._id
    };

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const product = await Product.create(productData);
    await product.populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product created successfully. Awaiting admin approval.',
      data: product
    });
  } catch (error) {
    console.error('CreateProduct error:', error);
    res.status(500).json({ success: false, message: 'Server error creating product' });
  }
};

// @desc    Update a product (seller only, own products)
// @route   PUT /api/products/:id
// @access  Private (Seller)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Ensure seller owns this product
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    const updates = { ...req.body };

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      updates.images = [...(product.images || []), ...newImages];
    }

    // Don't allow changing seller
    delete updates.seller;

    product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('UpdateProduct error:', error);
    res.status(500).json({ success: false, message: 'Server error updating product' });
  }
};

// @desc    Delete a product (seller only, own products)
// @route   DELETE /api/products/:id
// @access  Private (Seller)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Ensure seller owns this product
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('DeleteProduct error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting product' });
  }
};

// @desc    Get seller's own products
// @route   GET /api/products/seller/my-products
// @access  Private (Seller)
exports.getMyProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = { seller: req.user._id };
    if (status === 'active') { query.isActive = true; query.isApproved = true; }
    else if (status === 'pending') { query.isApproved = false; }
    else if (status === 'inactive') { query.isActive = false; }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

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
    console.error('GetMyProducts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Remove a product image
// @route   DELETE /api/products/:id/images/:imageIndex
// @access  Private (Seller)
exports.removeProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const imageIndex = parseInt(req.params.imageIndex);
    if (imageIndex < 0 || imageIndex >= product.images.length) {
      return res.status(400).json({ success: false, message: 'Invalid image index' });
    }

    product.images.splice(imageIndex, 1);
    await product.save();

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('RemoveProductImage error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
