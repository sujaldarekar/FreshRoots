import { motion } from 'framer-motion';

const Loader = ({ size = 'md', text = 'Loading...', fullPage = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        className={`${sizeClasses[size]} rounded-full border-primary-200 border-t-primary`}
        style={{ borderWidth: size === 'sm' ? 2 : size === 'md' ? 3 : 4 }}
      />
      {text && (
        <span className="text-sm text-gray-500 font-medium animate-pulse-soft">{text}</span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader size="lg" text="Loading..." />
  </div>
);

export default Loader;
