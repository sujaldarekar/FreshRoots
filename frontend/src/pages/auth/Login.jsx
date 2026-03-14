import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { loginUser, logout } from '../../redux/slices/authSlice';

const PORTAL_COPY = {
  customer: {
    title: 'Customer Login',
    subtitle: 'Sign in to browse fresh produce, manage your cart, and track orders.',
    badge: 'Customer Portal',
    badgeClass: 'bg-emerald-50 text-primary border-emerald-100',
    submitClass: 'btn-primary',
    registerPath: '/customer/register',
    switchPath: '/farmer/login',
    switchLabel: 'Farmer sign in',
    roleLabel: 'customers',
  },
  farmer: {
    title: 'Farmer Login',
    subtitle: 'Sign in to manage inventory, analytics, pricing, and incoming orders.',
    badge: 'Farmer Portal',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-100',
    submitClass: 'btn-accent',
    registerPath: '/farmer/register',
    switchPath: '/customer/login',
    switchLabel: 'Customer sign in',
    roleLabel: 'farmers',
  },
};

export default function Login({ portal = 'customer' }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const copy = PORTAL_COPY[portal] || PORTAL_COPY.customer;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      console.log('📤 Sending login request:', email);
      const result = await dispatch(loginUser({ email, password })).unwrap();
      console.log('✅ Login successful:', result);
      console.log('🎭 User role:', result?.role);
      console.log('Portal:', portal);
      if (result?.role !== portal) {
        dispatch(logout());
        toast.error(`This login portal is only for ${copy.roleLabel}.`);
        return;
      }
      toast.success(`Welcome back, ${result?.name?.split(' ')[0]}! 🌱`);
      navigate(result?.role === 'farmer' ? '/farmer/dashboard' : '/marketplace');
    } catch (err) {
      console.error('❌ Login error:', err);
      console.error('Error type:', typeof err);
      console.error('Full error object:', err);
      toast.error(err || 'Login failed');
    }
  };

  return (
    <div className="app-shell flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-6 items-stretch">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="hidden lg:flex surface-card p-6 bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-600 text-white flex-col justify-between"
        >
          <div>
            <p className="chip !bg-white/10 !border-white/20 !text-white">Harvest Hub</p>
            <h2 className="title-brand text-4xl leading-tight mt-4">Fresh produce marketplace crafted for speed.</h2>
            <p className="text-emerald-100 mt-4 text-sm max-w-md">
              Manage orders, source from local farms, and deliver transparent pricing in one clean workflow.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-white/20 mt-8">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80"
              alt="Fresh produce"
              className="w-full h-52 object-cover"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="phone-shell w-full max-w-md mx-auto"
        >
          <div className="h-2.5 bg-gradient-to-r from-emerald-600 via-lime-400 to-emerald-500" />
          <div className="p-6 sm:p-8">
            <div className="text-center mb-7">
              <Link to="/" className="inline-flex items-center gap-2">
                <span className="text-3xl">🌱</span>
                <span className="title-brand text-2xl font-bold text-primary">FreshRoots</span>
              </Link>
              <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold mt-5 ${copy.badgeClass}`}>
                {copy.badge}
              </div>
              <h1 className="title-brand text-2xl font-bold text-gray-900 mt-4">{copy.title}</h1>
              <p className="text-gray-500 text-sm mt-2">{copy.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-lime w-full py-3 text-base mt-2 justify-center"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-[#0f2e17] border-t-transparent rounded-full"
                    />
                    Signing in...
                  </span>
                ) : (
                  'Access Dashboard'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link to={copy.registerPath} className="text-primary font-semibold hover:underline">
                Create account
              </Link>
            </p>

            <p className="text-center text-sm text-gray-500 mt-3">
              Need the other portal?{' '}
              <Link to={copy.switchPath} className="font-semibold text-primary hover:underline">
                {copy.switchLabel}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
