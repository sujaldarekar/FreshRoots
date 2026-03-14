import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/common/ProductCard';
import { SkeletonGrid } from '../components/common/SkeletonCard';

const FEATURES = [
  {
    icon: '🌾',
    title: 'Direct from Farmers',
    desc: 'Buy directly from local farmers — no middlemen, fresher produce, better prices.',
  },
  {
    icon: '📍',
    title: 'Nearby Farmers',
    desc: 'Find farmers closest to you and enjoy same-day delivery on orders.',
  },
  {
    icon: '📊',
    title: 'Farmer Analytics',
    desc: 'Farmers track profit/loss, monitor pricing, and manage inventory with ease.',
  },
  {
    icon: '🔒',
    title: 'Secure Payments',
    desc: 'Multiple payment methods with secure checkout and full order tracking.',
  },
];

const CATEGORIES = [
  { name: 'Vegetables', emoji: '🥦', filter: 'Vegetable' },
  { name: 'Rice', emoji: '🍚', filter: 'Rice' },
  { name: 'Wheat', emoji: '🌾', filter: 'Wheat' },
  { name: 'Fruits', emoji: '🍎', filter: 'Fruit' },
  { name: 'Dairy', emoji: '🥛', filter: 'Dairy' },
  { name: 'Spices', emoji: '🌶️', filter: 'Spice' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const itemVars = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function Home() {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8, page: 1 }));
  }, [dispatch]);

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="gradient-hero min-h-[460px] sm:min-h-[520px] flex items-center py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)] gap-8 lg:gap-12 items-center">
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-secondary font-semibold text-sm mb-3 uppercase tracking-widest"
            >
              Farm to Your Table
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4"
            >
              Fresh Produce,{' '}
              <span className="text-accent">Directly</span>{' '}
              from Farmers
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-green-100 text-base leading-relaxed mb-8 max-w-lg"
            >
              FreshRoots connects you directly with local farmers. Get vegetables,
              rice, wheat, fruits and more — fresher, cheaper, and delivered to your door.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col sm:flex-row sm:flex-wrap gap-3"
            >
              {!user && (
                <>
                  <Link
                    to="/login"
                    className="bg-white text-primary hover:bg-green-50 font-semibold px-7 py-3 rounded-xl transition-colors text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-white/20 hover:bg-white/30 text-white font-semibold px-7 py-3 rounded-xl transition-colors text-center"
                  >
                    Create Account
                  </Link>
                </>
              )}
              {user?.role === 'customer' && (
                <Link to="/marketplace" className="btn-accent text-base px-7 py-3 text-center">
                  Shop Now
                </Link>
              )}
              {user?.role === 'farmer' && (
                <Link to="/farmer/dashboard" className="bg-white/20 hover:bg-white/30 text-white font-semibold px-7 py-3 rounded-xl transition-colors text-center">
                  My Dashboard
                </Link>
              )}
            </motion.div>

          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 backdrop-blur-lg shadow-2xl">
              <div className="rounded-[1.5rem] bg-white text-slate-900 p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-emerald-600 font-semibold">FreshRoots</p>
                    <h3 className="title-brand text-2xl font-bold text-emerald-950">Daily Harvest</h3>
                  </div>
                  <span className="chip">Same-day ready</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">Featured</p>
                    <p className="mt-2 text-lg font-bold text-emerald-950">Leafy greens</p>
                    <p className="text-sm text-emerald-700">Picked at sunrise, shipped in hours.</p>
                  </div>
                  <div className="rounded-2xl bg-lime-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-lime-700 font-semibold">Top rated</p>
                    <p className="mt-2 text-lg font-bold text-lime-950">Village dairy</p>
                    <p className="text-sm text-lime-700">Trusted by repeat weekly customers.</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-950 px-4 py-4 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-emerald-200 font-semibold">Delivery promise</p>
                      <p className="mt-1 text-lg font-semibold">Fresh from the Soil, Delivered with Care.</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">🚚</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          </div>
        </div>
      </section>

      {user?.role === 'customer' && (
      <>
      {/* Category Quick Links */}
      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl font-bold text-gray-900 mb-5"
          >
            Shop by Category
          </motion.h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
          >
            {CATEGORIES.map(({ name, emoji, filter }) => (
              <motion.div key={name} variants={itemVars}>
                <Link
                  to={`/marketplace?category=${filter}`}
                  className="flex flex-col items-center gap-2 bg-green-50 hover:bg-green-100 rounded-2xl p-4 transition-colors group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">
                    {emoji}
                  </span>
                  <span className="text-xs font-semibold text-primary">{name}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xl font-bold text-gray-900"
            >
              Featured Products
            </motion.h2>
            <Link to="/marketplace" className="text-primary text-sm font-medium hover:underline">
              View all →
            </Link>
          </div>
          {isLoading ? (
            <SkeletonGrid count={8} />
          ) : (
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4">
              {items.slice(0, 8).map((p, i) => (
                <ProductCard key={p._id} product={p} delay={i * 0.05} />
              ))}
            </div>
          )}
        </div>
      </section>
      </>
      )}

      {/* Features */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl font-bold text-gray-900 text-center mb-10"
          >
            Why Choose FreshRoots?
          </motion.h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {FEATURES.map(({ icon, title, desc }) => (
              <motion.div
                key={title}
                variants={itemVars}
                className="text-center px-2"
              >
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
                  {icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-14 gradient-primary">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-white mb-3"
            >
              Are you a farmer? Start selling today.
            </motion.h2>
            <p className="text-green-100 text-sm mb-6">
              Create an account first, then choose whether you are joining as a customer or a farmer.
            </p>
            <Link to="/register" className="btn-accent px-8 py-3 text-base">
              Get Started
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>© {new Date().getFullYear()} FreshRoots. Built with ❤️ for farmers and consumers.</p>
      </footer>
    </div>
  );
}
