import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { productAPI } from '../../services/api';

const CATEGORIES = ['Vegetable', 'Rice', 'Wheat', 'Fruit', 'Dairy', 'Spice', 'Other'];
const FRESHNESS = ['Fresh', 'Good', 'Average'];
const UNITS = ['kg', 'g', 'litre', 'piece', 'dozen', 'quintal'];

export default function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    productName: '',
    category: 'Vegetable',
    price: '',
    marketPrice: '',
    quantity: '',
    unit: 'kg',
    freshness: 'Fresh',
    harvestDate: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const errs = {};
    if (!form.productName.trim()) errs.productName = 'Name is required';
    if (!form.price || isNaN(form.price) || +form.price <= 0) errs.price = 'Valid price required';
    if (!form.quantity || isNaN(form.quantity) || +form.quantity <= 0) errs.quantity = 'Valid quantity required';
    if (!form.harvestDate) errs.harvestDate = 'Harvest date required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (imageFile) formData.append('image', imageFile);

      await productAPI.create(formData);
      toast.success('Product added successfully!');
      navigate('/farmer/inventory');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell py-6 sm:py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-3xl mx-auto space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-600 text-white"
        >
          <h1 className="title-brand text-2xl font-bold mb-1">Add Listing</h1>
          <p className="text-sm text-emerald-100">Fill product details to post produce on the market feed.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="phone-shell"
        >
          <div className="h-2.5 bg-gradient-to-r from-emerald-600 via-lime-400 to-emerald-500" />
          <div className="p-6">
            <h2 className="title-brand text-xl font-bold text-gray-900 mb-1">Vegetable Details</h2>
            <p className="text-sm text-gray-500 mb-6">Create a clean listing with price, freshness, and stock details.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="form-label">Product Image</label>
                <div
                  onClick={() => document.getElementById('img-input').click()}
                  className={`border-2 border-dashed rounded-xl p-6 cursor-pointer text-center transition-colors ${
                    preview ? 'border-primary bg-green-50' : 'border-gray-200 hover:border-primary hover:bg-green-50/30'
                  }`}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="mx-auto h-36 w-36 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-gray-400">
                      <p className="text-3xl mb-2">📷</p>
                      <p className="text-sm">Click to upload product image</p>
                      <p className="text-xs text-gray-300">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
                <input
                  id="img-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImage}
                />
              </div>

              <div>
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  name="productName"
                  value={form.productName}
                  onChange={handleChange}
                  className={`input-field ${errors.productName ? 'border-red-400' : ''}`}
                  placeholder="e.g. Organic Tomatoes"
                />
                {errors.productName && (
                  <p className="text-red-500 text-xs mt-1">{errors.productName}</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Category</label>
                  <select name="category" value={form.category} onChange={handleChange} className="input-field">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Freshness</label>
                  <select name="freshness" value={form.freshness} onChange={handleChange} className="input-field">
                    {FRESHNESS.map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Your Price (INR) *</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    className={`input-field ${errors.price ? 'border-red-400' : ''}`}
                    placeholder="0"
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="form-label">Market Price (INR) <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="number"
                    name="marketPrice"
                    value={form.marketPrice}
                    onChange={handleChange}
                    min="0"
                    className="input-field"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    min="1"
                    className={`input-field ${errors.quantity ? 'border-red-400' : ''}`}
                    placeholder="0"
                  />
                  {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                </div>
                <div>
                  <label className="form-label">Unit</label>
                  <select name="unit" value={form.unit} onChange={handleChange} className="input-field">
                    {UNITS.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Harvest Date *</label>
                <input
                  type="date"
                  name="harvestDate"
                  value={form.harvestDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`input-field ${errors.harvestDate ? 'border-red-400' : ''}`}
                />
                {errors.harvestDate && <p className="text-red-500 text-xs mt-1">{errors.harvestDate}</p>}
              </div>

              <div>
                <label className="form-label">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Tell customers about your product - farming methods, origin, etc."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/farmer/inventory')}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-lime flex-1"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-[#0f2e17] border-t-transparent rounded-full"
                      />
                      Uploading...
                    </span>
                  ) : (
                    'Post Listing'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
