import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clearCart } from '../../redux/slices/cartSlice';
import CartItem from '../../components/common/CartItem';

const DELIVERY_TIERS = [
  { max: 5, cost: 20 },
  { max: 10, cost: 40 },
  { max: 20, cost: 60 },
  { max: 50, cost: 100 },
  { max: Infinity, cost: 150 },
];

function getDeliveryCost(km) {
  if (!km || isNaN(km) || km <= 0) return 0;
  return DELIVERY_TIERS.find((t) => km <= t.max)?.cost ?? 150;
}

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.cart);
  const [distance, setDistance] = useState('');

  const subtotal = items.reduce((s, i) => {
    const price = Number(i?.price ?? 0);
    const qty = Number(i?.cartQuantity ?? i?.cartQty ?? 1);
    return s + (Number.isFinite(price) ? price : 0) * (Number.isFinite(qty) ? qty : 1);
  }, 0);
  const deliveryCost = distance ? getDeliveryCost(parseFloat(distance)) : 0;
  const total = subtotal + deliveryCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 py-20">
        <span className="text-7xl">🛒</span>
        <h2 className="text-xl font-bold text-gray-800">Your cart is empty</h2>
        <p className="text-gray-400 text-sm">Browse our marketplace and add fresh products!</p>
        <Link to="/marketplace" className="btn-primary mt-2">
          Explore Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
            <p className="text-sm text-gray-500 mt-0.5">{items.length} item(s)</p>
          </div>
          <button
            onClick={() => dispatch(clearCart())}
            className="text-sm text-red-400 hover:text-red-600 transition-colors"
          >
            Clear cart
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {items.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-5 h-fit space-y-4"
          >
            <h2 className="font-semibold text-gray-800 text-base">Order Summary</h2>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">₹{subtotal.toFixed(2)}</span>
              </div>

              {/* Distance input */}
              <div>
                <label className="form-label">Your Distance from Farm (km)</label>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="input-field mt-1"
                  placeholder="e.g. 8"
                  min="0"
                />
                {distance && (
                  <p className="text-xs text-primary mt-1">
                    Delivery: ₹{getDeliveryCost(parseFloat(distance))}
                  </p>
                )}
              </div>

              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-semibold text-gray-800">
                  {distance ? `₹${deliveryCost}` : '—'}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span className="text-primary text-lg">₹{total.toFixed(2)}</span>
            </div>

            <button
              onClick={() =>
                navigate('/checkout', {
                  state: { subtotal, deliveryCost, distance: parseFloat(distance) || 0, total },
                })
              }
              className="btn-primary w-full"
              disabled={!distance}
            >
              {distance ? 'Proceed to Checkout' : 'Enter Distance to Continue'}
            </button>

            <Link to="/marketplace" className="text-center block text-xs text-primary hover:underline">
              ← Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
