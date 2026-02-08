import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { sellersAPI } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SellerProfilePage = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sellerRes, productsRes] = await Promise.all([
          sellersAPI.getProfile(id),
          sellersAPI.getProducts(id)
        ]);
        setSeller(sellerRes.data.data);
        setProducts(productsRes.data.data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!seller) return <div className="text-center py-16"><h2 className="text-2xl font-bold">Seller not found</h2></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Seller Header */}
      <div className="bg-white rounded-xl border p-6 mb-8">
        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary-700 font-bold text-3xl">
              {(seller.companyName || seller.name).charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{seller.companyName || seller.name}</h1>
            {seller.companyAddress && (
              <p className="text-gray-500 mt-1">
                📍 {seller.companyAddress.city}, {seller.companyAddress.state}, {seller.companyAddress.country}
              </p>
            )}
            {seller.companyDescription && (
              <p className="text-gray-700 mt-3">{seller.companyDescription}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
              {seller.establishedYear && <span>🏢 Est. {seller.establishedYear}</span>}
              {seller.employeeCount && <span>👥 {seller.employeeCount} employees</span>}
              {seller.productCount !== undefined && <span>📦 {seller.productCount} products</span>}
              {seller.gstNumber && <span>📋 GST Verified</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <h2 className="text-xl font-semibold mb-4">Products by {seller.companyName || seller.name}</h2>
      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <p className="text-gray-500">No products listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerProfilePage;
