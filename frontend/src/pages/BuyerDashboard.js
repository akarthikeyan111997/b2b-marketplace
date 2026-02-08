import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inquiriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const res = await inquiriesAPI.getMyInquiries();
        setInquiries(res.data.data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  const pendingCount = inquiries.filter(i => i.status === 'pending').length;
  const respondedCount = inquiries.filter(i => i.status === 'responded').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-primary-600">{inquiries.length}</div>
          <div className="text-sm text-gray-500">Total Inquiries</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-sm text-gray-500">Awaiting Response</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{respondedCount}</div>
          <div className="text-sm text-gray-500">Responded</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-8">
        <Link to="/products" className="btn-primary">Browse Products</Link>
        <Link to="/categories" className="btn-secondary">View Categories</Link>
      </div>

      {/* Inquiries */}
      <h2 className="text-xl font-semibold mb-4">Your Inquiries</h2>
      {inquiries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <div className="text-5xl mb-4">📩</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No inquiries yet</h3>
          <p className="text-gray-600 mb-4">Browse products and send inquiries to sellers</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map(inq => (
            <div key={inq._id} className="bg-white rounded-xl border p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{inq.subject}</h3>
                  <p className="text-sm text-gray-500">
                    To: {inq.seller?.companyName || inq.seller?.name} •{' '}
                    <Link to={`/products/${inq.product?.slug || inq.product?._id}`} className="text-primary-600 hover:underline">
                      {inq.product?.name}
                    </Link>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  inq.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  inq.status === 'responded' ? 'bg-green-100 text-green-700' :
                  inq.status === 'read' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}>{inq.status}</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{inq.message}</p>
              {inq.quantity && (
                <p className="text-xs text-gray-500">Qty: {inq.quantity} {inq.quantityUnit} • Delivery: {inq.deliveryLocation}</p>
              )}
              {inq.sellerResponse && (
                <div className="mt-3 bg-green-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-green-700 mb-1">Seller Response:</p>
                  <p className="text-sm text-green-800">{inq.sellerResponse}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {inq.respondedAt && new Date(inq.respondedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
