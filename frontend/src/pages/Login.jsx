import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBook, FiMail, FiLock, FiEye, FiEyeOff, FiClock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const warmed = { current: false };
function warmServer() {
  if (warmed.current) return;
  warmed.current = true;
  api.get('/health', { timeout: 55000 }).catch(() => {});
}
warmServer();

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary text-white mb-4">
              <FiBook size={32} />
            </div>
            <h1 className="text-3xl font-bold text-text dark:text-text-dark">Welcome Back</h1>
            <p className="text-text-muted dark:text-text-muted-dark mt-2">Sign in to your library account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" placeholder="admin@library.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg gradient-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? <span className="flex items-center justify-center gap-2"><FiClock className="animate-spin" size={16} /> Signing in…</span> : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-text-muted dark:text-text-muted-dark">
            Don't have an account? <Link to="/register" className="text-accent hover:text-accent-light font-medium">Sign up</Link>
          </p>

          <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-xs text-text-muted">
            <p className="font-medium mb-1">Demo Credentials:</p>
            <p>Admin: admin@library.com / admin123</p>
            <p>Librarian: librarian@library.com / lib123</p>
          </div>
        </motion.div>
      </div>
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary-dark to-accent-dark items-center justify-center p-12">
        <div className="text-white max-w-md">
          <FiBook size={64} className="mb-6 opacity-80" />
          <h2 className="text-4xl font-bold mb-4">Library Management System</h2>
          <p className="text-lg opacity-80 leading-relaxed">A modern, comprehensive solution for managing books, borrowers, and transactions.</p>
        </div>
      </div>
    </div>
  );
}
