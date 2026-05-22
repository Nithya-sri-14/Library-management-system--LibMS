import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-surface-dark px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <h1 className="text-8xl font-bold gradient-primary bg-clip-text text-transparent">404</h1>
        <p className="text-xl text-text-muted mt-4 mb-2">Page not found</p>
        <p className="text-text-muted mb-8">The page you're looking for doesn't exist.</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-primary text-white font-medium hover:opacity-90"
        >
          <FiHome size={18} /> Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
