const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer is required']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  quantity: {
    type: Number,
    min: [1, 'Quantity must be at least 1']
  },
  quantityUnit: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'read', 'responded', 'closed'],
    default: 'pending'
  },
  sellerResponse: {
    type: String,
    maxlength: [2000, 'Response cannot exceed 2000 characters']
  },
  respondedAt: {
    type: Date
  },
  buyerPhone: {
    type: String,
    trim: true
  },
  buyerCompany: {
    type: String,
    trim: true
  },
  deliveryLocation: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
inquirySchema.index({ buyer: 1, createdAt: -1 });
inquirySchema.index({ seller: 1, createdAt: -1 });
inquirySchema.index({ product: 1 });
inquirySchema.index({ status: 1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
