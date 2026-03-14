import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { registerUser } from '../../redux/slices/authSlice';

const PORTAL_COPY = {
  customer: {
    title: 'Customer Registration',
    subtitle: 'Create a customer account to order directly from local farmers.',
    badge: 'Customer Portal',
    badgeClass: 'bg-emerald-50 text-primary border-emerald-100',
    submitClass: 'btn-primary',
    loginPath: '/customer/login',
    switchPath: '/farmer/register',
    switchLabel: 'Farmer registration',
  },
  farmer: {
    title: 'Farmer Registration',
    subtitle: 'Create your farmer account to list produce, track pricing, and manage fulfillment.',
    badge: 'Farmer Portal',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-100',
    submitClass: 'btn-accent',
    loginPath: '/farmer/login',
    switchPath: '/customer/register',
    switchLabel: 'Customer registration',
  },
};

export default function Register({ portal = 'customer' }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((s) => s.auth);
  const copy = PORTAL_COPY[portal] || PORTAL_COPY.customer;
  const isFarmerPortal = portal === 'farmer';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    farmName: '',
    farmDescription: '',
  });
  const [geoLoading, setGeoLoading] = useState(false);
  const [coords, setCoords] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success('Location captured!');
        setGeoLoading(false);
      },
      () => {
        toast.error('Location access denied');
        setGeoLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.name || !form.name.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (!form.email || !form.email.trim()) {
      toast.error('Email address is required');
      return;
    }
    if (!form.password) {
      toast.error('Password is required');
      return;
    }
    if (!form.confirmPassword) {
      toast.error('Please confirm your password');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (isFarmerPortal && !form.farmName.trim()) {
      toast.error('Farm name is required');
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role: portal,
      phone: form.phone.trim(),
      ...(isFarmerPortal && {
        farmName: form.farmName.trim(),
        farmDescription: form.farmDescription.trim(),
      }),
      ...(coords && {
        location: { type: 'Point', coordinates: [coords.lng, coords.lat] },
      }),
    };

    try {
      console.log('📤 Sending registration payload:', payload);
      const result = await dispatch(registerUser(payload)).unwrap();
      console.log('✅ Registration successful:', result);
      console.log('👤 User name:', result?.name);
      console.log('🎭 User role:', result?.role);
      console.log('🔐 Token exists:', !!result?.token);
      toast.success(`Welcome to FreshRoots, ${result?.name?.split(' ')[0]}! 🌱`);
      navigate(result?.role === 'farmer' ? '/farmer/dashboard' : '/marketplace');
    } catch (err) {
      console.error('❌ Registration error:', err);
      console.error('Error type:', typeof err);
      console.error('Full error object:', err);
      toast.error(err || 'Registration failed');
    }
  };

  return (
    <div className="app-shell flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-6 items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="hidden lg:block surface-card overflow-hidden"
        >
          <div className="relative h-full min-h-[640px] p-8 bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-600 text-white">
            <p className="chip !bg-white/10 !text-white !border-white/20">Grow Better</p>
            <h2 className="title-brand text-4xl mt-5 leading-tight">Build trust with transparent farm-to-home sourcing.</h2>
            <p className="text-emerald-100 mt-4 text-sm max-w-sm">
              Join as a customer or farmer and unlock a clean, reliable marketplace experience.
            </p>
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl overflow-hidden border border-white/20">
              <img
                src="https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=1200&q=80"
                alt="Farmer and produce"
                className="w-full h-64 object-cover"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06 }}
          className="phone-shell w-full max-w-xl mx-auto"
        >
          <div className="h-2.5 bg-gradient-to-r from-emerald-600 via-lime-400 to-emerald-500" />
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
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
              <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Min 6 chars"
                  required
                />
              </div>
              <div>
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {isFarmerPortal && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div>
                  <label className="form-label">Farm Name *</label>
                  <input
                    type="text"
                    name="farmName"
                    value={form.farmName}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g. Green Valley Farm"
                    required={isFarmerPortal}
                  />
                </div>
                <div>
                  <label className="form-label">Farm Description</label>
                  <textarea
                    name="farmDescription"
                    value={form.farmDescription}
                    onChange={handleChange}
                    rows={2}
                    className="input-field resize-none"
                    placeholder="Tell customers about your farm…"
                  />
                </div>
              </motion.div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="button"
                onClick={captureLocation}
                disabled={geoLoading}
                className="btn-secondary text-sm py-2"
              >
                {geoLoading ? 'Getting location…' : '📍 Share My Location'}
              </button>
              {coords && (
                <span className="text-xs text-primary font-medium">
                  ✓ Location saved
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
                className="btn-lime w-full py-3 text-base justify-center"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-[#0f2e17] border-t-transparent rounded-full"
                  />
                    Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to={copy.loginPath} className="text-primary font-semibold hover:underline">
              Sign in
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
