import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="space-y-4"
      >
        <p className="text-8xl">🌿</p>
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-xl font-semibold text-gray-800">Page Not Found</h2>
        <p className="text-gray-500 max-w-sm">
          Looks like this page went missing from the harvest. Let's get you back on track.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Link to="/" className="btn-primary">Go Home</Link>
          <Link to="/marketplace" className="btn-secondary">Marketplace</Link>
        </div>
      </motion.div>
    </div>
  );
}
