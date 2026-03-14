import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchFarmerProducts } from '../../redux/slices/productSlice';
import { fetchFarmerOrders } from '../../redux/slices/orderSlice';
import MarketPriceChart from '../../components/farmer/MarketPriceChart';
import { SkeletonRow } from '../../components/common/SkeletonCard';
import useAuth from '../../hooks/useAuth';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Packed: 'bg-indigo-100 text-indigo-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const StatCard = ({ label, value, icon, sub, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="surface-card p-4"
  >
    <div className="flex items-center justify-between mb-1">
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-primary mt-1">{sub}</p>}
  </motion.div>
);

export default function FarmerDashboard() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { farmerProducts, isLoading: productsLoading } = useSelector((s) => s.products);
  const { farmerOrders, isLoading: ordersLoading } = useSelector((s) => s.orders);

  useEffect(() => {
    dispatch(fetchFarmerProducts());
    dispatch(fetchFarmerOrders());
  }, [dispatch]);

  const totalRevenue = farmerOrders
    .filter((o) => o.orderStatus === 'Delivered')
    .reduce((sum, o) => {
      return (
        sum +
        (o.products || []).reduce((ps, p) => ps + p.price * p.quantity, 0)
      );
    }, 0);

  const pendingOrders = farmerOrders.filter(
    (o) => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed'
  ).length;

  const recentOrders = [...farmerOrders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const lowStock = farmerProducts.filter((p) => p.quantity > 0 && p.quantity <= 5);

  return (
    <div className="app-shell py-6 sm:py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="surface-card p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-600 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="title-brand text-2xl font-bold text-white">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-emerald-100 text-sm mt-0.5">
              {user?.farmName || 'Your Farm'} • Dashboard Overview
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/farmer/add-product" className="btn-lime text-sm">
              + Add Product
            </Link>
            <Link to="/farmer/analytics" className="btn-secondary text-sm !text-white !border-white/50 hover:!bg-white/10">
              Analytics
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="🌾" label="Total Products" value={farmerProducts.length} delay={0} />
          <StatCard icon="📦" label="Active Orders" value={pendingOrders} delay={0.08} />
          <StatCard
            icon="💰"
            label="Total Revenue"
            value={`₹${totalRevenue.toFixed(0)}`}
            sub="From delivered orders"
            delay={0.16}
          />
          <StatCard
            icon="⭐"
            label="Rating"
            value={user?.rating ? user.rating.toFixed(1) : '—'}
            sub={user?.totalRatings ? `${user.totalRatings} reviews` : 'No ratings yet'}
            delay={0.24}
          />
        </div>

        {lowStock.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="surface-card bg-orange-50 border-accent rounded-xl px-4 py-3 flex items-start gap-3"
          >
            <span className="text-accent text-xl mt-0.5">⚠</span>
            <div>
              <p className="font-semibold text-orange-800 text-sm">Low Stock Alert</p>
              <p className="text-orange-700 text-xs mt-0.5">
                {lowStock.map((p) => p.productName).join(', ')} — running low.{' '}
                <Link to="/farmer/inventory" className="underline">
                  Update inventory
                </Link>
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <MarketPriceChart products={farmerProducts} />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="surface-card p-5"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800 text-base">Recent Orders</h3>
              <Link
                to="/farmer/orders"
                className="text-primary text-xs font-medium hover:underline"
              >
                View all →
              </Link>
            </div>

            {ordersLoading ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => <SkeletonRow key={i} />)}
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">
                        ₹{order.totalPrice}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { to: '/farmer/add-product', icon: '➕', label: 'Add Product', color: 'text-primary' },
            { to: '/farmer/inventory', icon: '📋', label: 'Inventory', color: 'text-blue-600' },
            { to: '/farmer/analytics', icon: '📊', label: 'Analytics', color: 'text-purple-600' },
            { to: '/marketplace', icon: '🛒', label: 'Marketplace', color: 'text-accent' },
          ].map(({ to, icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className="surface-card p-4 flex flex-col items-center gap-2 hover:shadow-card-hover transition-all group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
              <span className={`text-sm font-semibold ${color}`}>{label}</span>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
