import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PORTALS = {
  customer: {
    emoji: '🛒',
    title: 'Customer Portal',
    subtitle: 'Shop fresh produce, track deliveries, and manage your orders.',
    accent: 'bg-emerald-50 text-primary border-emerald-100',
    ctaClass: 'btn-primary',
  },
  farmer: {
    emoji: '🌾',
    title: 'Farmer Portal',
    subtitle: 'Manage inventory, pricing, analytics, and direct customer orders.',
    accent: 'bg-amber-50 text-amber-700 border-amber-100',
    ctaClass: 'btn-accent',
  },
};

export default function AuthPortalSelector({ mode = 'login' }) {
  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary/70 mb-3">
            FreshRoots Access
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {isLogin ? 'Choose Your Login Portal' : 'Choose Your Registration Portal'}
          </h1>
          <p className="text-gray-500 mt-3 text-sm sm:text-base">
            Customer and farmer accounts use different onboarding flows. Select the portal that matches your role.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(PORTALS).map(([key, portal], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="card p-7 sm:p-8"
            >
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${portal.accent}`}>
                <span>{portal.emoji}</span>
                <span>{portal.title}</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mt-5 mb-2">
                {portal.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {portal.subtitle}
              </p>

              <Link
                to={`/${key}/${isLogin ? 'login' : 'register'}`}
                className={`${portal.ctaClass} w-full justify-center py-3 text-sm sm:text-base`}
              >
                {isLogin ? `Continue to ${portal.title}` : `Create ${portal.title} Account`}
              </Link>

              <p className="text-sm text-gray-500 mt-5">
                {isLogin ? "Need an account?" : 'Already registered?'}{' '}
                <Link
                  to={`/${key}/${isLogin ? 'register' : 'login'}`}
                  className="font-semibold text-primary hover:underline"
                >
                  {isLogin ? 'Register here' : 'Sign in here'}
                </Link>
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
