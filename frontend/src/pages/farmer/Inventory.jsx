import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchFarmerProducts, deleteProduct } from '../../redux/slices/productSlice';
import { productAPI } from '../../services/api';
import ModalPopup from '../../components/common/ModalPopup';
import { SkeletonRow } from '../../components/common/SkeletonCard';

const FRESHNESS_COLORS = {
  Fresh: 'badge-fresh',
  Good: 'badge-good',
  Average: 'badge-average',
};

export default function Inventory() {
  const dispatch = useDispatch();
  const { farmerProducts, isLoading } = useSelector((s) => s.products);
  const user = useSelector((s) => s.auth.user);
  const [deleteId, setDeleteId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchFarmerProducts(user._id));
    }
  }, [dispatch, user?._id]);

  const handleToggle = async (product) => {
    setTogglingId(product._id);
    try {
      const form = new FormData();
      form.append('isAvailable', !product.isAvailable);
      await productAPI.update(product._id, form);
      dispatch(fetchFarmerProducts());
      toast.success(
        !product.isAvailable ? 'Product marked available' : 'Product hidden from marketplace'
      );
    } catch {
      toast.error('Failed to update product');
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeletingId(deleteId);
    setDeleteId(null);
    try {
      await dispatch(deleteProduct(deleteId)).unwrap();
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = farmerProducts.filter((p) =>
    p.productName?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Inventory</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {farmerProducts.length} products listed
            </p>
          </div>
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field w-56"
          />
        </div>

        {/* Table */}
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-center">Freshness</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-4 py-3">
                        <SkeletonRow />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-14 text-gray-400">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filtered.map((product, i) => (
                      <motion.tr
                        key={product._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.productName}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <span className="font-medium text-gray-800 truncate max-w-[160px]">
                              {product.productName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{product.category}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-800">
                          ₹{product.price}/{product.unit}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold ${
                            product.quantity <= 5 ? 'text-red-500' : 'text-gray-800'
                          }`}
                        >
                          {product.quantity} {product.unit}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`badge ${FRESHNESS_COLORS[product.freshness]}`}>
                            {product.freshness}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggle(product)}
                            disabled={togglingId === product._id}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                              product.isAvailable
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {togglingId === product._id
                              ? '…'
                              : product.isAvailable
                              ? 'Available'
                              : 'Hidden'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setDeleteId(product._id)}
                              disabled={deletingId === product._id}
                              className="text-red-400 hover:text-red-600 text-sm px-2 py-1 rounded transition-colors"
                              title="Delete"
                            >
                              {deletingId === product._id ? '…' : '🗑'}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      <ModalPopup
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Product"
        size="sm"
      >
        <p className="text-gray-600 text-sm mb-5">
          Are you sure you want to delete this product? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-ghost flex-1">
            Cancel
          </button>
          <button onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl flex-1 transition-colors">
            Delete
          </button>
        </div>
      </ModalPopup>
    </div>
  );
}
