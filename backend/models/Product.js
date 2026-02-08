const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required']
  },
  images: [{
    type: String
  }],
  priceMin: {
    type: Number,
    required: [true, 'Minimum price is required'],
    min: [0, 'Price cannot be negative']
  },
  priceMax: {
    type: Number,
    min: [0, 'Price cannot be negative']
  },
  priceUnit: {
    type: String,
    default: 'per piece',
    enum: ['per piece', 'per kg', 'per ton', 'per meter', 'per liter', 'per set', 'per lot', 'per dozen']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  moq: {
    type: Number,
    required: [true, 'Minimum Order Quantity is required'],
    min: [1, 'MOQ must be at least 1'],
    default: 1
  },
  moqUnit: {
    type: String,
    default: 'pieces',
    enum: ['pieces', 'kg', 'tons', 'meters', 'liters', 'sets', 'lots', 'dozens']
  },
  specifications: [{
    key: { type: String, trim: true },
    value: { type: String, trim: true }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  inquiryCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Text index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ isActive: 1, isApproved: 1 });
productSchema.index({ createdAt: -1 });

// Generate slug from name before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);
  }
  // Ensure priceMax >= priceMin
  if (this.priceMax && this.priceMax < this.priceMin) {
    this.priceMax = this.priceMin;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
