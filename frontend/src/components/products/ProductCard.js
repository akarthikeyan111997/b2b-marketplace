import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const formatPrice = (min, max, unit) => {
    const fmt = (n) => new Intl.NumberFormat('en-IN').format(n);
    if (max && max !== min) {
      return `₹${fmt(min)} - ₹${fmt(max)} ${unit}`;
    }
    return `₹${fmt(min)} ${unit}`;
  };

  const placeholderImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=300&background=e2e8f0&color=475569&font-size=0.25`;

  return (
    <div className="card group">
      <Link to={`/products/${product.slug || product._id}`}>
        <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
          <img
            src={product.images?.[0] ? `http://localhost:5001${product.images[0]}` : placeholderImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = placeholderImage; }}
          />
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/products/${product.slug || product._id}`}>
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 line-clamp-1 mb-2">
          {product.shortDescription || product.description?.substring(0, 80)}
        </p>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-lg font-bold text-primary-700">
            {formatPrice(product.priceMin, product.priceMax, product.priceUnit)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>MOQ: {product.moq} {product.moqUnit}</span>
          {product.category && (
            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
              {product.category.name || product.category}
            </span>
          )}
        </div>
        {product.seller && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Link
              to={`/sellers/${product.seller._id || product.seller}`}
              className="text-xs text-gray-600 hover:text-primary-600 flex items-center"
            >
              <span className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center mr-1.5">
                <span className="text-primary-700 text-[10px] font-bold">
                  {(product.seller.companyName || product.seller.name || 'S').charAt(0)}
                </span>
              </span>
              {product.seller.companyName || product.seller.name || 'Seller'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
