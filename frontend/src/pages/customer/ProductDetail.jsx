import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { addToCart } from '../../redux/slices/cartSlice';
import { productAPI, farmerAPI } from '../../services/api';
import { PageLoader } from '../../components/common/Loader';

const FRESHNESS_COLORS = {
  Fresh: 'badge-fresh',
  Good: 'badge-good',
  Average: 'badge-average',
};

export default function ProductDetail({ product: propProduct, embedded = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const cartItems = useSelector((s) => s.cart.items);

  const [product, setProduct] = useState(propProduct || null);
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(!propProduct);
  const [qty, setQty] = useState(1);

  const productId = propProduct?._id || id;

  useEffect(() => {
    if (propProduct) return;
    (async () => {
      setLoading(true);
      try {
        const res = await productAPI.getById(productId);
        setProduct(res.data);
      } catch {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    })();
  }, [productId, propProduct]);

  useEffect(() => {
    if (!product?.farmerId) return;
    (async () => {
      try {
        const farmerId =
          typeof product.farmerId === 'object' ? product.farmerId._id : product.farmerId;
        const res = await farmerAPI.getProfile(farmerId);
        setFarmer(res.data?.farmer || null);
      } catch {}
    })();
  }, [product]);

  if (loading) return embedded ? null : <PageLoader />;
  if (!product) return null;

  const cartItem = cartItems.find((i) => i._id === product._id);
  const inCart = !!cartItem;
  const harvestDays = Math.floor(
    (Date.now() - new Date(product.harvestDate)) / (1000 * 60 * 60 * 24)
  );

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to add to cart');
      if (!embedded) navigate('/login');
      return;
    }
    if (user.role === 'farmer') {
      toast.error('Farmers cannot purchase products');
      return;
    }
    dispatch(addToCart({ ...product, selectedQty: qty }));
    toast.success(`${product.productName} added to cart!`);
  };

  return (
    <div className={embedded ? '' : 'min-h-screen bg-background py-10'}>
      <div className={embedded ? '' : 'max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'}>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl overflow-hidden bg-white shadow-soft aspect-square"
          >
            <img
              src={product.image}
              alt={product.productName}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap gap-2">
              <span className={`badge ${FRESHNESS_COLORS[product.freshness]}`}>
                {product.freshness}
              </span>
              <span className="badge bg-gray-100 text-gray-600">{product.category}</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">{product.productName}</h1>

            {product.description && (
              <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>
            )}

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">₹{product.price}</span>
              <span className="text-gray-400 text-sm">per {product.unit}</span>
              {product.marketPrice && product.marketPrice > product.price && (
                <span className="text-gray-400 text-sm line-through">₹{product.marketPrice}</span>
              )}
            </div>

            <div className="text-sm text-gray-600 space-y-1.5">
              <p>
                <span className="font-medium">Available: </span>
                <span className={product.quantity <= 5 ? 'text-red-500 font-semibold' : ''}>
                  {product.quantity} {product.unit}
                </span>
              </p>
              <p>
                <span className="font-medium">Harvested: </span>
                {harvestDays === 0 ? 'Today' : `${harvestDays} days ago`}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-xl border border-gray-200 font-bold text-gray-700 hover:border-primary hover:text-primary transition-colors"
              >
                −
              </button>
              <span className="font-semibold text-gray-900 w-8 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.quantity, q + 1))}
                className="w-9 h-9 rounded-xl border border-gray-200 font-bold text-gray-700 hover:border-primary hover:text-primary transition-colors"
              >
                +
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={product.quantity === 0}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                inCart
                  ? 'bg-green-600 text-white cursor-default'
                  : product.quantity === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {inCart ? '✓ In Cart' : product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </motion.button>

            {/* Farmer Info */}
            {farmer && (
              <div className="bg-green-50 rounded-2xl p-4">
                <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Sold by</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {farmer.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{farmer.farmName || farmer.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      ⭐ {farmer.rating?.toFixed(1) || '—'}
                      {farmer.totalRatings ? ` (${farmer.totalRatings} reviews)` : ''}
                    </p>
                  </div>
                </div>
                {farmer.farmDescription && (
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">{farmer.farmDescription}</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
