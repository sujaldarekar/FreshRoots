import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=80';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  const handleRemove = () => {
    dispatch(removeFromCart(item._id));
    toast.success(`${item.productName} removed from cart`);
  };

  const handleQuantityChange = (newQty) => {
    if (newQty < 1) return;
    if (newQty > item.quantity) {
      toast.error(`Only ${item.quantity} ${item.unit || 'kg'} available`);
      return;
    }
    dispatch(updateQuantity({ id: item._id, quantity: newQty }));
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-card border border-primary-50"
    >
      {/* Image */}
      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={item.image || PLACEHOLDER_IMG}
          alt={item.productName}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-800 text-sm truncate">{item.productName}</h4>
        <p className="text-xs text-gray-500 mb-2">
          {item.farmerId?.farmName || item.farmerId?.name || 'Local Farmer'}
        </p>

        {/* Quantity Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuantityChange(item.cartQuantity - 1)}
            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-primary-100 hover:text-primary flex items-center justify-center text-gray-600 font-bold text-sm transition-colors"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-semibold text-gray-800">
            {item.cartQuantity}
          </span>
          <button
            onClick={() => handleQuantityChange(item.cartQuantity + 1)}
            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-primary-100 hover:text-primary flex items-center justify-center text-gray-600 font-bold text-sm transition-colors"
          >
            +
          </button>
          <span className="text-xs text-gray-400">{item.unit || 'kg'}</span>
        </div>
      </div>

      {/* Price & Remove */}
      <div className="flex flex-col items-end gap-3 flex-shrink-0">
        <div className="text-right">
          <div className="font-bold text-primary text-base">
            ₹{(item.price * item.cartQuantity).toFixed(0)}
          </div>
          <div className="text-xs text-gray-400">₹{item.price}/{item.unit || 'kg'}</div>
        </div>
        <button
          onClick={handleRemove}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default CartItem;
