import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { addToCart, selectCartItems } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const freshnessStyles = {
  Fresh: 'badge-fresh',
  Good: 'badge-good',
  Average: 'badge-average',
};

const freshnessDot = {
  Fresh: 'bg-green-500',
  Good: 'bg-blue-500',
  Average: 'bg-amber-500',
};

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80';

const ProductCard = ({ product, distance, onQuickView }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const inCart = cartItems.find((i) => i._id === product._id);
  const user = useSelector((state) => state.auth.user);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    if (user.role === 'farmer') {
      toast.error('Farmers cannot purchase products');
      return;
    }
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`${product.productName} added to cart!`, {
      icon: '🛒',
    });
  };

  const daysFromHarvest = product.harvestDate
    ? Math.floor((new Date() - new Date(product.harvestDate)) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="surface-card overflow-hidden group cursor-pointer hover:shadow-card-hover transition-shadow duration-300"
    >
      <Link to={`/product/${product._id}`}>
        {/* Image */}
        <div className="relative overflow-hidden aspect-[4/3] bg-gray-50">
          <motion.img
            src={product.image || PLACEHOLDER_IMG}
            alt={product.productName}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4 }}
            onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
          />
          {/* Overlays */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span className={freshnessStyles[product.freshness] || 'badge-fresh'}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${freshnessDot[product.freshness] || 'bg-green-500'}`} />
              {product.freshness}
            </span>
            {product.category && (
              <span className="bg-white/90 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {product.category}
              </span>
            )}
          </div>

          {product.quantity <= 5 && product.quantity > 0 && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              Only {product.quantity} left
            </span>
          )}

          {/* Quick View */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-end justify-center pb-3">
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="opacity-0 group-hover:opacity-100 bg-white text-primary text-xs font-semibold px-3 py-1.5 rounded-full shadow-soft transition-all duration-200"
              onClick={(e) => {
                e.preventDefault();
                onQuickView && onQuickView(product);
              }}
            >
              Quick View
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-1 line-clamp-1">
            {product.productName}
          </h3>

          {/* Farmer */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary text-[10px] font-bold">
                {product.farmerId?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-500 line-clamp-1">
              {product.farmerId?.farmName || product.farmerId?.name || 'Local Farm'}
            </span>
          </div>

          {/* Distance & Harvest */}
          <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
            {distance !== undefined && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {distance} km
              </span>
            )}
            {daysFromHarvest !== null && (
              <span className="flex items-center gap-1">
                🌾 {daysFromHarvest === 0 ? 'Today' : `${daysFromHarvest}d ago`}
              </span>
            )}
          </div>

          {/* Price & Cart */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-lg font-bold text-primary">₹{product.price}</span>
              <span className="text-xs text-gray-400">/{product.unit || 'kg'}</span>
              {product.marketPrice > 0 && product.price < product.marketPrice && (
                <div className="text-xs text-gray-400 line-through">
                  ₹{product.marketPrice}
                </div>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={product.quantity === 0}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                inCart
                  ? 'bg-primary text-white shadow-green'
                  : product.quantity === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#20dc3e] text-[#0f2e17] hover:bg-[#18c535]'
              }`}
            >
              {product.quantity === 0 ? 'Out' : inCart ? 'Added' : 'Add to Cart'}
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
