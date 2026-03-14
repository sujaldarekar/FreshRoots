import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchFarmerOrders, changeOrderStatus } from '../../redux/slices/orderSlice';
import { SkeletonRow } from '../../components/common/SkeletonCard';

const STATUS_FLOW = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];
const NEXT_ACTION_LABEL = {
  Pending: 'Mark Confirmed',
  Confirmed: 'Mark Packed',
  Packed: 'Proceed to Delivery',
  Shipped: 'Mark Delivered',
};
const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Packed: 'bg-indigo-100 text-indigo-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function FarmerOrders() {
  const dispatch = useDispatch();
  const { farmerOrders, isLoading } = useSelector((s) => s.orders);
  const [expanded, setExpanded] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    dispatch(fetchFarmerOrders());
  }, [dispatch]);

  const handleStatusChange = async (orderId, current) => {
    const nextIdx = STATUS_FLOW.indexOf(current) + 1;
    if (nextIdx >= STATUS_FLOW.length) return;
    const nextStatus = STATUS_FLOW[nextIdx];
    setUpdatingId(orderId);
    try {
      await dispatch(changeOrderStatus({ id: orderId, status: nextStatus })).unwrap();
      toast.success(`Order marked as ${nextStatus}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const sorted = [...farmerOrders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incoming Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{farmerOrders.length} total orders</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="card p-4">
                <SkeletonRow />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-base font-medium">No orders yet</p>
            <p className="text-sm mt-1">Orders from customers will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {sorted.map((order, i) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card overflow-hidden"
                >
                  {/* Order Header */}
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {order.userId?.name || 'Customer'}
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
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                      {order.orderStatus !== 'Delivered' &&
                        order.orderStatus !== 'Cancelled' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(order._id, order.orderStatus);
                            }}
                            disabled={updatingId === order._id}
                            className="btn-primary text-xs py-1.5 px-3"
                          >
                            {updatingId === order._id
                              ? '…'
                              : NEXT_ACTION_LABEL[order.orderStatus] || 'Update Status'}
                          </button>
                        )}
                      <span className="text-gray-300 text-sm">
                        {expanded === order._id ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expanded === order._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-50 overflow-hidden"
                      >
                        <div className="p-4 space-y-3">
                          {/* Products */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Items Ordered</p>
                            <div className="space-y-2">
                              {order.products?.map((p, pi) => (
                                <div
                                  key={pi}
                                  className="flex justify-between text-sm bg-gray-50 rounded-lg px-3 py-2"
                                >
                                  <span className="text-gray-700">{p.productName} × {p.quantity}</span>
                                  <span className="font-semibold text-gray-800">₹{p.price * p.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Delivery + Payment */}
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <p className="text-xs text-gray-400 mb-0.5">Delivery Address</p>
                              <p>{order.deliveryAddress || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-0.5">Payment</p>
                              <p>{order.paymentMethod} · <span className={order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-500'}>{order.paymentStatus}</span></p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-0.5">Delivery Cost</p>
                              <p>₹{order.deliveryCost} ({order.distance?.toFixed(1)} km)</p>
                            </div>
                            {order.notes && (
                              <div>
                                <p className="text-xs text-gray-400 mb-0.5">Customer Note</p>
                                <p className="italic text-gray-500">{order.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
