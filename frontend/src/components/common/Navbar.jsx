import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../../redux/slices/authSlice';
import { selectCartCount } from '../../redux/slices/cartSlice';

const NAV_LINKS_CUSTOMER = [
  { label: 'Marketplace', path: '/marketplace' },
  { label: 'Nearby Farmers', path: '/nearby-farmers' },
  { label: 'My Orders', path: '/orders' },
];

const NAV_LINKS_FARMER = [
  { label: 'Dashboard', path: '/farmer/dashboard' },
  { label: 'Inventory', path: '/farmer/inventory' },
  { label: 'Add Product', path: '/farmer/add-product' },
  { label: 'Analytics', path: '/farmer/analytics' },
  { label: 'Orders', path: '/farmer/orders' },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const cartCount = useSelector(selectCartCount);

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const navLinks = !user ? [] : user.role === 'farmer' ? NAV_LINKS_FARMER : NAV_LINKS_CUSTOMER;

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-primary-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-green">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.5 3C14.26 3 9 7.2 9 12.56V13l-.31-.22a5.37 5.37 0 0 0-2.69-.78A5.5 5.5 0 0 0 .5 17.5 5.5 5.5 0 0 0 6 23a5.43 5.43 0 0 0 3.5-1.27A8.58 8.58 0 0 0 12 15.5V15c0-4.2 3.58-8.2 7.5-8.84V3Zm-9 13.42A2.5 2.5 0 1 1 6 14a2.5 2.5 0 0 1 2.5 2.42Z" />
              </svg>
            </div>
            <span className="title-brand text-base sm:text-xl font-bold text-primary leading-none">
              Fresh<span className="text-accent">Roots</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-primary-50 text-primary font-semibold'
                    : 'text-gray-600 hover:text-primary hover:bg-primary-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Cart (customer only) */}
            {user?.role === 'customer' && (
              <Link
                to="/cart"
                className="relative p-2 rounded-xl text-gray-600 hover:text-primary hover:bg-primary-50 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </Link>
            )}

            {/* User Menu or Auth Buttons */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl hover:bg-primary-50 transition-all duration-200 max-w-[160px] sm:max-w-none"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-semibold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left min-w-0">
                    <div className="text-sm font-semibold text-gray-800 leading-none">
                      {user.name?.split(' ')[0]}
                    </div>
                    <div className="text-xs text-gray-400 capitalize">{user.role}</div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-soft-lg border border-gray-100 py-1.5 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                      <div className="pt-1.5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm py-2">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-primary-50 transition-colors"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {user && (
                <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-primary-50 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-semibold text-sm shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{user.name}</div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  </div>
                </div>
              )}
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary-50 text-primary'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link to="/login" className="btn-secondary text-sm text-center py-2 rounded-xl">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary text-sm text-center py-2 rounded-xl">
                    Register
                  </Link>
                </div>
              )}
              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
