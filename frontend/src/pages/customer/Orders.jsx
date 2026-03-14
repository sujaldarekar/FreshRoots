import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchMyOrders } from '../../redux/slices/orderSlice';
import { farmerAPI } from '../../services/api';
import ModalPopup from '../../components/common/ModalPopup';
import { SkeletonRow } from '../../components/common/SkeletonCard';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Packed: 'bg-indigo-100 text-indigo-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const STATUS_ICONS = { Pending:'⏳', Confirmed:'✅', Packed:'📦', Shipped:'🚚', Delivered:'🎉', Cancelled:'❌' };

export default function Orders() {
  const dispatch = useDispatch();
  const { myOrders, isLoading } = useSelector((s) => s.orders);
  const [expanded, setExpanded] = useState(null);
  const [rateModal, setRateModal] = useState(null); // { farmerId, orderId }
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [rating_loading, setRatingLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const handleRateSubmit = async () => {
    if (!rateModal) return;
    setRatingLoading(true);
    try {
      await farmerAPI.rate(rateModal.farmerId, { rating, review, orderId: rateModal.orderId });
      toast.success('Rating submitted!');
      setRateModal(null);
      setRating(5);
      setReview('');
    } catch {
      toast.error('Failed to submit rating');
    } finally {
      setRatingLoading(false);
    }
  };

  const sorted = [...myOrders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{myOrders.length} orders</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="card p-4"><SkeletonRow /></div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="card py-16 text-center text-gray-400">
            <p className="text-5xl mb-3">📦</p>
            <p className="font-semibold text-gray-600 text-base">No orders yet</p>
            <p className="text-sm mt-1">Start shopping on the marketplace!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {sorted.map((order, i) => {
                const uniqueFarmerIds = [
                  ...new Set(order.products?.map((p) => p.farmerId).filter(Boolean)),
                ];
                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="card overflow-hidden"
                  >
                    {/* Header */}
                    <div
                      className="flex flex-wrap items-center justify-between gap-3 p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                      onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{STATUS_ICONS[order.orderStatus] || '📦'}</span>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-800">₹{order.totalPrice}</span>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                        <span className="text-gray-300 text-sm">
                          {expanded === order._id ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {/* Expanded */}
                    <AnimatePresence>
                      {expanded === order._id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-gray-50 overflow-hidden"
                        >
                          <div className="p-4 space-y-4">
                            {/* Items */}
                            <div className="space-y-2">
                              {order.products?.map((p, pi) => (
                                <div
                                  key={pi}
                                  className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2 text-sm"
                                >
                                  <span className="text-gray-700">
                                    {p.productName} × {p.quantity}
                                  </span>
                                  <span className="font-semibold text-gray-800">
                                    ₹{p.price * p.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm text-gray-500">
                              <div>
                                <p className="text-xs text-gray-400">Delivery Address</p>
                                <p className="text-gray-700">{order.deliveryAddress}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Payment</p>
                                <p className="text-gray-700">
                                  {order.paymentMethod} ·{' '}
                                  <span
                                    className={
                                      order.paymentStatus === 'Paid'
                                        ? 'text-green-600'
                                        : 'text-orange-500'
                                    }
                                  >
                                    {order.paymentStatus}
                                  </span>
                                </p>
                              </div>
                            </div>

                            {/* Rate Farmer */}
                            {order.orderStatus === 'Delivered' && uniqueFarmerIds.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {uniqueFarmerIds.map((fid) => (
                                  <button
                                    key={fid}
                                    onClick={() => setRateModal({ farmerId: fid, orderId: order._id })}
                                    className="text-xs bg-accent/10 text-accent hover:bg-accent/20 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    ⭐ Rate Farmer
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Rate Farmer Modal */}
      <ModalPopup
        isOpen={!!rateModal}
        onClose={() => setRateModal(null)}
        title="Rate this Farmer"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="form-label">Your Rating</label>
            <div className="flex gap-2 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className={`text-2xl transition-transform hover:scale-110 ${
                    s <= rating ? 'text-yellow-400' : 'text-gray-200'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Review (optional)</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
              className="input-field resize-none mt-1"
              placeholder="Share your experience with this farmer…"
            />
          </div>
          <button
            onClick={handleRateSubmit}
            disabled={rating_loading}
            className="btn-primary w-full"
          >
            {rating_loading ? 'Submitting…' : 'Submit Rating'}
          </button>
        </div>
      </ModalPopup>
    </div>
  );
}
