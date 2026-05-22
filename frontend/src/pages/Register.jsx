import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBook, FiUser, FiMail, FiLock, FiClock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  const healthDone = useRef(false);

  useEffect(() => {
    if (healthDone.current) return;
    healthDone.current = true;
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; setServerStatus('waking'); }, 3000);
    api.get('/health', { timeout: 55000 })
      .then(() => { clearTimeout(timer); setServerStatus('ready'); })
      .catch(() => { clearTimeout(timer); setServerStatus('ready'); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        toast.error('Server is still waking up — please try again in a moment');
      } else {
        toast.error(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-surface-dark px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary text-white mb-4">
            <FiBook size={32} />
          </div>
          <h1 className="text-3xl font-bold text-text dark:text-text-dark">Create Account</h1>
          <p className="text-text-muted dark:text-text-muted-dark mt-2">Join the library system</p>
        </div>

        {serverStatus === 'waking' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm">
            <FiClock className="animate-spin" size={16} />
            Server is waking up — please wait a moment…
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-card dark:bg-card-dark p-8 rounded-2xl border border-border dark:border-border-dark">
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" placeholder="John Doe" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" placeholder="john@example.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text dark:text-text-dark mb-1.5">Confirm</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input type="password" required minLength={6} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg gradient-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? (
              <span className="flex items-center justify-center gap-2"><FiClock className="animate-spin" size={16} /> Creating account…</span>
            ) : 'Create Account'}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-text-muted dark:text-text-muted-dark">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-light font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
