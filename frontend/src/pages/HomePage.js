import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI, categoriesAPI, sellersAPI } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [featuredSellers, setFeaturedSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, featRes, latestRes, sellerRes] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getAll({ featured: 'true', limit: 4 }),
          productsAPI.getAll({ limit: 8, sort: 'newest' }),
          sellersAPI.getFeatured()
        ]);
        setCategories(catRes.data.data || []);
        setFeaturedProducts(featRes.data.data || []);
        setLatestProducts(latestRes.data.data || []);
        setFeaturedSellers(sellerRes.data.data || []);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading marketplace..." />;

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              India's Trusted B2B Marketplace
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8">
              Connect with verified suppliers, discover quality products, and grow your business with TradeConnect
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex max-w-2xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, suppliers, or categories..."
                className="flex-1 px-6 py-4 rounded-l-xl text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
              <button
                type="submit"
                className="bg-accent-500 hover:bg-accent-600 px-8 py-4 rounded-r-xl font-semibold text-lg transition-colors"
              >
                Search
              </button>
            </form>

            {/* Quick Stats */}
            <div className="flex justify-center space-x-8 mt-10 text-primary-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-sm">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">100+</div>
                <div className="text-sm">Verified Sellers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">10+</div>
                <div className="text-sm">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Buttons */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="btn-primary text-center text-lg px-8 py-3">
              📋 Post Buying Requirement
            </Link>
            <Link to="/register?role=seller" className="btn-accent text-center text-lg px-8 py-3">
              🏪 List Your Products
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
            <p className="text-gray-600 mt-2">Explore products across major industries</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat.slug}`}
                className="bg-white rounded-xl p-4 text-center hover:shadow-lg transition-shadow border border-gray-100 group"
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <h3 className="font-medium text-gray-900 group-hover:text-primary-600 text-sm">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/categories" className="text-primary-600 hover:text-primary-700 font-medium">
              View All Categories →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
                <p className="text-gray-600 mt-1">Handpicked products from top suppliers</p>
              </div>
              <Link to="/products?featured=true" className="text-primary-600 hover:text-primary-700 font-medium hidden sm:block">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Products */}
      {latestProducts.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Latest Products</h2>
                <p className="text-gray-600 mt-1">Recently added to the marketplace</p>
              </div>
              <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium hidden sm:block">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Sellers */}
      {featuredSellers.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Trusted Suppliers</h2>
              <p className="text-gray-600 mt-2">Verified businesses you can rely on</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredSellers.map((seller) => (
                <Link
                  key={seller._id}
                  to={`/sellers/${seller._id}`}
                  className="card p-6 text-center group"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary-700 font-bold text-xl">
                      {(seller.companyName || seller.name).charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">
                    {seller.companyName || seller.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {seller.companyAddress?.city}, {seller.companyAddress?.state}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {seller.productCount || 0} products
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-primary-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-primary-100 text-lg mb-8">
            Join thousands of businesses already trading on TradeConnect. Whether you're buying or selling, we've got you covered.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Started Free
            </Link>
            <Link to="/products" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-700 transition-colors">
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
