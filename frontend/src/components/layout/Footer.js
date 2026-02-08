import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-white">
                Trade<span className="text-primary-400">Connect</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Your trusted B2B marketplace connecting buyers and sellers across industries. 
              Find verified suppliers, quality products, and grow your business.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-white transition-colors">Browse Products</Link></li>
              <li><Link to="/categories" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link to="/register?role=seller" className="hover:text-white transition-colors">Become a Seller</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register as Buyer</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Top Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products?category=industrial-machinery" className="hover:text-white transition-colors">Industrial Machinery</Link></li>
              <li><Link to="/products?category=electronics-electrical" className="hover:text-white transition-colors">Electronics & Electrical</Link></li>
              <li><Link to="/products?category=chemicals-solvents" className="hover:text-white transition-colors">Chemicals & Solvents</Link></li>
              <li><Link to="/products?category=textiles-apparel" className="hover:text-white transition-colors">Textiles & Apparel</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <span>📧</span>
                <span>support@tradeconnect.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>📞</span>
                <span>+91-1800-XXX-XXXX</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>📍</span>
                <span>Bengaluru, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} TradeConnect. All rights reserved. Built for learning purposes.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
