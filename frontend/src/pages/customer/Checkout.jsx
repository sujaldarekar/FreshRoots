import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { placeOrder } from '../../redux/slices/orderSlice';
import { clearCart } from '../../redux/slices/cartSlice';

const PAYMENT_METHODS = ['Cash on Delivery', 'UPI', 'Net Banking', 'Card'];

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);

  const { subtotal = 0, deliveryCost = 0, distance = 0, total = 0 } =
    location.state || {};

  const [form, setForm] = useState({
    deliveryAddress: user?.address || '',
    paymentMethod: 'Cash on Delivery',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.deliveryAddress.trim()) {
      toast.error('Delivery address is required');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        products: items.map((i) => ({
          productId: i._id,
          quantity: Number(i?.cartQuantity ?? i?.cartQty ?? 1),
        })),
        deliveryAddress: form.deliveryAddress,
        paymentMethod: form.paymentMethod,
        notes: form.notes,
        distance,
      };

      await dispatch(placeOrder(orderData)).unwrap();
      dispatch(clearCart());
      toast.success('Order placed successfully! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error(err || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900 mb-6"
        >
          Checkout
        </motion.h1>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="lg:col-span-3 space-y-5"
          >
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">Delivery Details</h2>

              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="input-field bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  value={user?.phone || ''}
                  disabled
                  className="input-field bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="form-label">Delivery Address *</label>
                <textarea
                  name="deliveryAddress"
                  value={form.deliveryAddress}
                  onChange={handleChange}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="House no., Street, City, State, PIN"
                  required
                />
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">Payment Method</h2>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-colors text-sm ${
                      form.paymentMethod === method
                        ? 'border-primary bg-green-50 text-primary font-semibold'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={form.paymentMethod === method}
                      onChange={handleChange}
                      className="accent-primary"
                    />
                    {method}
                  </label>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-semibold text-gray-800 mb-3">Order Notes (optional)</h2>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={2}
                className="input-field resize-none"
                placeholder="Special instructions for delivery…"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Placing Order…
                </span>
              ) : (
                `Place Order · ₹${total.toFixed(2)}`
              )}
            </button>
          </motion.form>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 card p-5 h-fit space-y-4"
          >
            <h2 className="font-semibold text-gray-800">Your Items</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-3 text-sm">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-11 h-11 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{item.productName}</p>
                    <p className="text-gray-400 text-xs">×{Number(item?.cartQuantity ?? item?.cartQty ?? 1)}</p>
                  </div>
                  <span className="font-semibold text-gray-800 shrink-0">
                    ₹{(Number(item?.price ?? 0) * Number(item?.cartQuantity ?? item?.cartQty ?? 1)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery ({distance} km)</span>
                <span>₹{deliveryCost}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
                <span>Total</span>
                <span className="text-primary">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
