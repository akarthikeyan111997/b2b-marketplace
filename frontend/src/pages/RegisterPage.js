import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'seller' ? 'seller' : 'buyer';

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', role: defaultRole, companyName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.role === 'seller' && !formData.companyName.trim()) {
      setError('Company name is required for sellers');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...data } = formData;
      await register(data);
      if (formData.role === 'seller') navigate('/seller/dashboard');
      else navigate('/buyer/dashboard');
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || 'Registration failed. Please check your details.');
      } else if (err.request) {
        setError('Unable to connect to the server. Please make sure the backend is running on port 5001.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join TradeConnect marketplace</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {/* Role Toggle */}
          <div className="flex rounded-lg border border-gray-200 mb-6 overflow-hidden">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'buyer' })}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                formData.role === 'buyer'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              🛒 I'm a Buyer
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'seller' })}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                formData.role === 'seller'
                  ? 'bg-accent-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              🏪 I'm a Seller
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text" name="name" value={formData.name}
                onChange={handleChange} className="input-field"
                placeholder="Your full name" required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" name="email" value={formData.email}
                onChange={handleChange} className="input-field"
                placeholder="you@example.com" required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
              <input
                type="tel" name="phone" value={formData.phone}
                onChange={handleChange} className="input-field"
                placeholder="+91-XXXXXXXXXX"
              />
            </div>

            {formData.role === 'seller' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text" name="companyName" value={formData.companyName}
                  onChange={handleChange} className="input-field"
                  placeholder="Your company name" required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password" name="password" value={formData.password}
                onChange={handleChange} className="input-field"
                placeholder="Min 6 characters" required minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password" name="confirmPassword" value={formData.confirmPassword}
                onChange={handleChange} className="input-field"
                placeholder="Confirm your password" required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Creating Account...' : `Register as ${formData.role === 'seller' ? 'Seller' : 'Buyer'}`}
            </button>
          </form>

          {formData.role === 'seller' && (
            <p className="mt-3 text-xs text-gray-500 text-center">
              Seller accounts require admin approval before listing products.
            </p>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
