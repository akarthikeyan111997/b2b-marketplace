import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI, inquiriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, isBuyer } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    subject: '', message: '', quantity: '', quantityUnit: '', buyerPhone: '', buyerCompany: '', deliveryLocation: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productsAPI.getOne(id);
        setProduct(res.data.data);
        setInquiryForm(prev => ({ ...prev, subject: `Inquiry about ${res.data.data.name}` }));
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await inquiriesAPI.create({ ...inquiryForm, productId: product._id });
      setInquirySent(true);
      setShowInquiry(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (min, max, unit) => {
    const fmt = (n) => new Intl.NumberFormat('en-IN').format(n);
    if (max && max !== min) return `₹${fmt(min)} - ₹${fmt(max)} ${unit}`;
    return `₹${fmt(min)} ${unit}`;
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!product) return <div className="text-center py-16"><h2 className="text-2xl font-bold">Product not found</h2></div>;

  const placeholderImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=500&background=e2e8f0&color=475569&font-size=0.2`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square mb-4">
            <img
              src={product.images?.[selectedImage] ? `http://localhost:5001${product.images[selectedImage]}` : placeholderImage}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = placeholderImage; }}
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${selectedImage === i ? 'border-primary-500' : 'border-gray-200'}`}>
                  <img src={`http://localhost:5001${img}`} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {product.category && (
            <Link to={`/products?category=${product.category.slug}`} className="text-sm text-primary-600 hover:underline">
              {product.category.name}
            </Link>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mt-1 mb-4">{product.name}</h1>

          <div className="bg-primary-50 rounded-xl p-4 mb-6">
            <div className="text-2xl font-bold text-primary-700 mb-1">
              {formatPrice(product.priceMin, product.priceMax, product.priceUnit)}
            </div>
            <div className="text-sm text-gray-600">
              Minimum Order: <strong>{product.moq} {product.moqUnit}</strong>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
          </div>

          {product.specifications?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Specifications</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                {product.specifications.map((spec, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} px-4 py-2`}>
                    <span className="w-1/3 text-sm text-gray-600 font-medium">{spec.key}</span>
                    <span className="w-2/3 text-sm text-gray-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.tags?.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {product.tags.map((tag, i) => (
                <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">{tag}</span>
              ))}
            </div>
          )}

          {/* Inquiry CTA */}
          {inquirySent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
              ✅ Your inquiry has been sent successfully! The seller will respond soon.
            </div>
          ) : (
            <div className="space-y-3">
              {isAuthenticated && isBuyer ? (
                <button onClick={() => setShowInquiry(!showInquiry)} className="btn-accent w-full py-3 text-lg">
                  📩 Send Inquiry to Seller
                </button>
              ) : !isAuthenticated ? (
                <Link to="/login" className="btn-primary w-full py-3 text-lg block text-center">
                  Login to Send Inquiry
                </Link>
              ) : null}
            </div>
          )}

          {/* Seller Info */}
          {product.seller && (
            <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Seller Information</h3>
              <Link to={`/sellers/${product.seller._id}`} className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg -m-2">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-lg">
                    {(product.seller.companyName || product.seller.name).charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{product.seller.companyName || product.seller.name}</p>
                  {product.seller.companyAddress && (
                    <p className="text-sm text-gray-500">
                      {product.seller.companyAddress.city}, {product.seller.companyAddress.state}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Inquiry Form Modal */}
      {showInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Send Inquiry</h2>
              <button onClick={() => setShowInquiry(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input type="text" value={inquiryForm.subject}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, subject: e.target.value })}
                  className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea value={inquiryForm.message}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                  className="input-field" rows={4} required
                  placeholder="Describe your requirements, quantity needed, delivery timeline..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input type="number" value={inquiryForm.quantity}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, quantity: e.target.value })}
                    className="input-field" placeholder="e.g. 100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input type="text" value={inquiryForm.quantityUnit}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, quantityUnit: e.target.value })}
                    className="input-field" placeholder="e.g. pieces" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Phone</label>
                <input type="tel" value={inquiryForm.buyerPhone}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, buyerPhone: e.target.value })}
                  className="input-field" placeholder="+91-XXXXXXXXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input type="text" value={inquiryForm.buyerCompany}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, buyerCompany: e.target.value })}
                  className="input-field" placeholder="Your company name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
                <input type="text" value={inquiryForm.deliveryLocation}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, deliveryLocation: e.target.value })}
                  className="input-field" placeholder="City, State" />
              </div>
              <button type="submit" disabled={submitting} className="btn-accent w-full py-3">
                {submitting ? 'Sending...' : 'Send Inquiry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
