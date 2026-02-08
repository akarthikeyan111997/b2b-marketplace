import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminPanel = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [userFilter, setUserFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, usersRes, productsRes] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getUsers({ limit: 50 }),
        adminAPI.getProducts({ limit: 50 })
      ]);
      setAnalytics(analyticsRes.data.data);
      setUsers(usersRes.data.data || []);
      setProducts(productsRes.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSeller = async (id, approved) => {
    try {
      await adminAPI.approveSeller(id, approved);
      fetchData();
    } catch (error) { alert('Failed'); }
  };

  const handleToggleActive = async (id) => {
    try {
      await adminAPI.toggleUserActive(id);
      fetchData();
    } catch (error) { alert('Failed'); }
  };

  const handleApproveProduct = async (id, approved) => {
    try {
      await adminAPI.approveProduct(id, approved);
      fetchData();
    } catch (error) { alert('Failed'); }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await adminAPI.toggleFeatured(id);
      fetchData();
    } catch (error) { alert('Failed'); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await adminAPI.deleteProduct(id);
      fetchData();
    } catch (error) { alert('Failed'); }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  const filteredUsers = users.filter(u => !userFilter || u.role === userFilter);
  const filteredProducts = products.filter(p => {
    if (productFilter === 'pending') return !p.isApproved;
    if (productFilter === 'approved') return p.isApproved;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Panel</h1>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border"><div className="text-2xl font-bold text-primary-600">{analytics.users.totalBuyers}</div><div className="text-xs text-gray-500">Buyers</div></div>
          <div className="bg-white rounded-xl p-4 border"><div className="text-2xl font-bold text-accent-600">{analytics.users.totalSellers}</div><div className="text-xs text-gray-500">Sellers</div></div>
          <div className="bg-white rounded-xl p-4 border"><div className="text-2xl font-bold text-yellow-600">{analytics.users.pendingSellers}</div><div className="text-xs text-gray-500">Pending Sellers</div></div>
          <div className="bg-white rounded-xl p-4 border"><div className="text-2xl font-bold text-green-600">{analytics.products.active}</div><div className="text-xs text-gray-500">Active Products</div></div>
          <div className="bg-white rounded-xl p-4 border"><div className="text-2xl font-bold text-red-600">{analytics.products.pending}</div><div className="text-xs text-gray-500">Pending Products</div></div>
          <div className="bg-white rounded-xl p-4 border"><div className="text-2xl font-bold text-blue-600">{analytics.inquiries.total}</div><div className="text-xs text-gray-500">Total Inquiries</div></div>
          <div className="bg-white rounded-xl p-4 border"><div className="text-2xl font-bold text-purple-600">{analytics.categories}</div><div className="text-xs text-gray-500">Categories</div></div>
          <div className="bg-white rounded-xl p-4 border"><div className="text-2xl font-bold text-teal-600">{analytics.users.recentSignups}</div><div className="text-xs text-gray-500">New Users (30d)</div></div>
          <div className="bg-white rounded-xl p-4 border"><div className="text-2xl font-bold text-indigo-600">{analytics.products.recentlyAdded}</div><div className="text-xs text-gray-500">New Products (30d)</div></div>
          <div className="bg-white rounded-xl p-4 border"><div className="text-2xl font-bold text-pink-600">{analytics.inquiries.recentInquiries}</div><div className="text-xs text-gray-500">New Inquiries (30d)</div></div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-6">
        {['overview', 'users', 'products'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 font-medium capitalize ${activeTab === tab ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Users Management */}
      {(activeTab === 'overview' || activeTab === 'users') && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">User Management</h2>
            <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="input-field w-40">
              <option value="">All Roles</option>
              <option value="buyer">Buyers</option>
              <option value="seller">Sellers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">User</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Role</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Joined</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.slice(0, activeTab === 'overview' ? 10 : undefined).map(u => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                      {u.companyName && <div className="text-xs text-gray-400">{u.companyName}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'seller' ? 'bg-accent-100 text-accent-700' : 'bg-blue-100 text-blue-700'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {u.isActive ? <span className="badge-success">Active</span> : <span className="badge-danger">Inactive</span>}
                        {u.role === 'seller' && (u.isApproved ? <span className="badge-info">Approved</span> : <span className="badge-warning">Pending</span>)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {u.role === 'seller' && !u.isApproved && (
                        <button onClick={() => handleApproveSeller(u._id, true)} className="text-green-600 hover:text-green-700 text-sm font-medium">Approve</button>
                      )}
                      {u.role === 'seller' && u.isApproved && (
                        <button onClick={() => handleApproveSeller(u._id, false)} className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">Revoke</button>
                      )}
                      {u.role !== 'admin' && (
                        <button onClick={() => handleToggleActive(u._id)} className={`text-sm font-medium ${u.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}>
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Moderation */}
      {(activeTab === 'overview' || activeTab === 'products') && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Product Moderation</h2>
            <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="input-field w-40">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          </div>
          <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Product</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Seller</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Price</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.slice(0, activeTab === 'overview' ? 10 : undefined).map(p => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.category?.name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.seller?.companyName || p.seller?.name}</td>
                    <td className="px-4 py-3 text-sm">₹{p.priceMin?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {p.isApproved ? <span className="badge-success">Approved</span> : <span className="badge-warning">Pending</span>}
                        {p.isFeatured && <span className="badge-info">Featured</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {!p.isApproved ? (
                        <button onClick={() => handleApproveProduct(p._id, true)} className="text-green-600 hover:text-green-700 text-sm font-medium">Approve</button>
                      ) : (
                        <button onClick={() => handleApproveProduct(p._id, false)} className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">Reject</button>
                      )}
                      <button onClick={() => handleToggleFeatured(p._id)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        {p.isFeatured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button onClick={() => handleDeleteProduct(p._id)} className="text-red-600 hover:text-red-700 text-sm font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
