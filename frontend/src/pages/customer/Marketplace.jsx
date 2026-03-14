import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProducts, setFilter, clearFilters } from '../../redux/slices/productSlice';
import ProductCard from '../../components/common/ProductCard';
import { SkeletonGrid } from '../../components/common/SkeletonCard';
import ModalPopup from '../../components/common/ModalPopup';
import ProductDetail from './ProductDetail';

const CATEGORIES = ['All', 'Vegetable', 'Rice', 'Wheat', 'Fruit', 'Dairy', 'Spice', 'Other'];
const FRESHNESS = ['All', 'Fresh', 'Good', 'Average'];

export default function Marketplace() {
  const dispatch = useDispatch();
  const { items, isLoading, filters, pagination } = useSelector((s) => s.products);
  const [page, setPage] = useState(1);
  const [quickViewId, setQuickViewId] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const load = useCallback(() => {
    dispatch(fetchProducts({ ...filters, page, limit: 12 }));
  }, [dispatch, filters, page]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!mobileFiltersOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileFiltersOpen]);

  const handleFilter = (key, value) => {
    dispatch(setFilter({ key, value }));
  };

  const quickViewProduct = items.find((p) => p._id === quickViewId);
  const activeFilterCount = [filters.search, filters.category, filters.freshness, filters.minPrice, filters.maxPrice]
    .filter(Boolean)
    .length;
  const filterPanel = (
    <div className="surface-card p-4 space-y-4">
      <div className="flex items-center justify-between gap-3 xl:hidden">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Refine products</h2>
          <p className="text-xs text-gray-500">Narrow the list by category, freshness, and price.</p>
        </div>
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(false)}
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-100"
          aria-label="Close filters"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div>
        <label className="form-label">Search Products</label>
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => handleFilter('search', e.target.value)}
          placeholder="Search fresh vegetables, fruits..."
          className="input-field"
        />
      </div>

      <div>
        <label className="form-label">Category</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => handleFilter('category', c === 'All' ? '' : c)}
              className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-colors ${
                (filters.category || '') === (c === 'All' ? '' : c)
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">Freshness</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
          {FRESHNESS.map((f) => (
            <button
              key={f}
              onClick={() => handleFilter('freshness', f === 'All' ? '' : f)}
              className={`text-xs px-2 py-1.5 rounded-lg border transition-colors ${
                (filters.freshness || '') === (f === 'All' ? '' : f)
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-100 text-gray-600 hover:border-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">Price Range (INR)</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => handleFilter('minPrice', e.target.value)}
            className="input-field w-full"
            min="0"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => handleFilter('maxPrice', e.target.value)}
            className="input-field w-full"
            min="0"
          />
        </div>
      </div>

      <button
        onClick={() => dispatch(clearFilters())}
        className="btn-secondary w-full text-sm py-2"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <div className="app-shell py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card p-5 sm:p-6 mb-6 bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-600 text-white"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="title-brand text-2xl sm:text-3xl font-bold">FreshRoots</h1>
              <p className="text-sm text-emerald-100 mt-1">
                Fresh from the Soil, Delivered with Care.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="chip !bg-white/10 !border-white/20 !text-white">Local Farms</span>
              <span className="chip !bg-white/10 !border-white/20 !text-white">Daily Picks</span>
              <span className="chip !bg-white/10 !border-white/20 !text-white">Fast Delivery</span>
            </div>
          </div>
        </motion.div>

        <div className="xl:hidden flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Browse the market</p>
            <p className="text-xs text-gray-500">
              {activeFilterCount > 0 ? `${activeFilterCount} active filters` : 'All products visible'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="btn-secondary text-sm py-2 px-4 whitespace-nowrap"
          >
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden xl:block xl:w-72 shrink-0 space-y-5 xl:sticky xl:top-20 h-fit"
          >
            {filterPanel}
          </motion.aside>

          <div className="flex-1">
            {isLoading ? (
              <SkeletonGrid count={12} />
            ) : items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="surface-card text-center py-20 text-gray-400"
              >
                <p className="text-5xl mb-3">🌾</p>
                <p className="font-semibold text-lg text-gray-600">No products found</p>
                <p className="text-sm mt-1">Try resetting your filters</p>
              </motion.div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <p className="text-xs text-gray-500">
                    Showing {items.length} of {pagination?.total || items.length} products
                  </p>
                  <span className="chip">Live Inventory</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {items.map((product, i) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        delay={i * 0.04}
                        onQuickView={() => setQuickViewId(product._id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {pagination?.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-8 flex-wrap">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                          p === page
                            ? 'bg-primary text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ModalPopup
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewId(null)}
        title={quickViewProduct?.productName}
        size="lg"
      >
        {quickViewProduct && <ProductDetail product={quickViewProduct} embedded />}
      </ModalPopup>

      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="xl:hidden fixed inset-0 bg-slate-950/45 z-40"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="xl:hidden fixed top-0 right-0 h-full w-full max-w-sm z-50 p-4"
            >
              <div className="h-full overflow-y-auto">
                {filterPanel}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
