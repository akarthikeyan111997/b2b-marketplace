import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesAPI.getAll()
      .then(res => setCategories(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">All Categories</h1>
      <p className="text-gray-600 mb-8">Browse products by industry category</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <Link key={cat._id} to={`/products?category=${cat.slug}`}
            className="card p-6 flex items-start space-x-4 group">
            <div className="text-4xl">{cat.icon}</div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 text-lg">{cat.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
