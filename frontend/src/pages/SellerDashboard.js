import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, inquiriesAPI, categoriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '', description: '', shortDescription: '', category: '',
    priceMin: '', priceMax: '', priceUnit: 'per piece', moq: '1', moqUnit: 'pieces', tags: ''
  });
  const [productImages, setProductImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [responseForm, setResponseForm] = useState({ id: null, text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, inqRes, catRes] = await Promise.all([
        productsAPI.getMyProducts(),
        inquiriesAPI.getSellerInquiries(),
        categoriesAPI.getAll()
      ]);
      setProducts(prodRes.data.data || []);
      setInquiries(inqRes.data.data || []);
      setCategories(catRes.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(productForm).forEach(([key, val]) => {
        if (key === 'tags') formData.append(key, val);
        else formData.append(key, val);
      });
      productImages.forEach(img => formData.append('images', img));
      await productsAPI.create(formData);
      setShowAddProduct(false);
      setProductForm({ name: '', description: '', shortDescription: '', category: '', priceMin: '', priceMax: '', priceUnit: 'per piece', moq: '1', moqUnit: 'pieces', tags: '' });
      setProductImages([]);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productsAPI.delete(id);
      fetchData();
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const handleRespond = async (inquiryId) => {
    if (!responseForm.text.trim()) return;
    try {
      await inquiriesAPI.respond(inquiryId, responseForm.text);
      setResponseForm({ id: null, text: '' });
      fetchData();
    } catch (error) {
      alert('Failed to send response');
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  const pendingInquiries = inquiries.filter(i => i.status === 'pending' || i.status === 'read').length;
  const activeProducts = products.filter(p => p.isActive && p.isApproved).length;
  const pendingProducts = products.filter(p => !p.isApproved).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600">{user?.companyName || 'Your Business'}</p>
          {!user?.isApproved && (
            <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-yellow-700 text-sm">
              ⚠️ Your seller account is pending admin approval. You cannot add products yet.
            </div>
          )}
        </div>
        {user?.isApproved && (
          <button onClick={() => setShowAddProduct(true)} className="btn-primary">+ Add Product</button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-primary-600">{products.length}</div>
          <div className="text-sm text-gray-500">Total Products</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{activeProducts}</div>
          <div className="text-sm text-gray-500">Active Products</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-yellow-600">{pendingProducts}</div>
          <div className="text-sm text-gray-500">Pending Approval</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-accent-600">{pendingInquiries}</div>
          <div className="text-sm text-gray-500">New Inquiries</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-6">
        {['overview', 'products', 'inquiries'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 font-medium capitalize ${activeTab === tab ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab} {tab === 'inquiries' && pendingInquiries > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingInquiries}</span>}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {(activeTab === 'overview' || activeTab === 'products') && (
        <div className="mb-8">
          {activeTab === 'overview' && <h2 className="text-xl font-semibold mb-4">Your Products</h2>}
          {products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <p className="text-gray-500">No products yet. Add your first product!</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Product</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Price</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Views</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.slice(0, activeTab === 'overview' ? 5 : undefined).map(p => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.category?.name}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">₹{p.priceMin?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        {p.isApproved && p.isActive ? <span className="badge-success">Active</span>
                          : !p.isApproved ? <span className="badge-warning">Pending</span>
                          : <span className="badge-danger">Inactive</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{p.viewCount}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteProduct(p._id)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Inquiries Tab */}
      {(activeTab === 'overview' || activeTab === 'inquiries') && (
        <div>
          {activeTab === 'overview' && <h2 className="text-xl font-semibold mb-4">Recent Inquiries</h2>}
          {inquiries.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <p className="text-gray-500">No inquiries yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.slice(0, activeTab === 'overview' ? 3 : undefined).map(inq => (
                <div key={inq._id} className="bg-white rounded-xl border p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{inq.subject}</h3>
                      <p className="text-sm text-gray-500">From: {inq.buyer?.name} • Product: {inq.product?.name}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      inq.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      inq.status === 'responded' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>{inq.status}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{inq.message}</p>
                  {inq.quantity && <p className="text-xs text-gray-500">Qty: {inq.quantity} {inq.quantityUnit} • Location: {inq.deliveryLocation}</p>}
                  {inq.sellerResponse && (
                    <div className="mt-3 bg-green-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-green-700 mb-1">Your Response:</p>
                      <p className="text-sm text-green-800">{inq.sellerResponse}</p>
                    </div>
                  )}
                  {inq.status !== 'responded' && (
                    <div className="mt-3">
                      {responseForm.id === inq._id ? (
                        <div className="flex gap-2">
                          <input type="text" value={responseForm.text}
                            onChange={(e) => setResponseForm({ ...responseForm, text: e.target.value })}
                            className="input-field text-sm" placeholder="Type your response..." />
                          <button onClick={() => handleRespond(inq._id)} className="btn-primary btn-sm">Send</button>
                          <button onClick={() => setResponseForm({ id: null, text: '' })} className="btn-secondary btn-sm">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setResponseForm({ id: inq._id, text: '' })} className="text-primary-600 text-sm font-medium hover:underline">
                          Reply to inquiry →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Product</h2>
              <button onClick={() => setShowAddProduct(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input type="text" value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="input-field" required>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="input-field" rows={4} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <input type="text" value={productForm.shortDescription}
                  onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                  className="input-field" maxLength={300} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹) *</label>
                  <input type="number" value={productForm.priceMin}
                    onChange={(e) => setProductForm({ ...productForm, priceMin: e.target.value })}
                    className="input-field" required min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
                  <input type="number" value={productForm.priceMax}
                    onChange={(e) => setProductForm({ ...productForm, priceMax: e.target.value })}
                    className="input-field" min="0" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Unit</label>
                  <select value={productForm.priceUnit}
                    onChange={(e) => setProductForm({ ...productForm, priceUnit: e.target.value })}
                    className="input-field">
                    {['per piece','per kg','per ton','per meter','per liter','per set','per lot','per dozen'].map(u =>
                      <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MOQ *</label>
                  <input type="number" value={productForm.moq}
                    onChange={(e) => setProductForm({ ...productForm, moq: e.target.value })}
                    className="input-field" required min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MOQ Unit</label>
                  <select value={productForm.moqUnit}
                    onChange={(e) => setProductForm({ ...productForm, moqUnit: e.target.value })}
                    className="input-field">
                    {['pieces','kg','tons','meters','liters','sets','lots','dozens'].map(u =>
                      <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input type="text" value={productForm.tags}
                  onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                  className="input-field" placeholder="e.g. steel, industrial, heavy duty" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                <input type="file" multiple accept="image/*"
                  onChange={(e) => setProductImages(Array.from(e.target.files))}
                  className="input-field" />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
                {submitting ? 'Adding Product...' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
