import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiShield, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({ name });
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.new.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await authAPI.updatePassword({ currentPassword: passwords.current, newPassword: passwords.new });
      toast.success('Password updated');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Profile</h1>
        <p className="text-text-muted text-sm">Manage your account settings</p>
      </div>

      <div className="bg-card dark:bg-card-dark rounded-xl p-6 border border-border dark:border-border-dark">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border dark:border-border-dark">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text dark:text-text-dark">{user?.name}</h2>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <FiMail size={14} /> {user?.email}
            </div>
            <div className="flex items-center gap-1.5 text-xs mt-1">
              <FiShield size={12} className="text-accent" />
              <span className="capitalize text-accent font-medium">{user?.role}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Email</label>
            <input type="email" value={user?.email || ''} disabled
              className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-gray-50 dark:bg-gray-800 text-text-muted cursor-not-allowed" />
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium disabled:opacity-50">
            <FiSave size={16} /> {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>

      <div className="bg-card dark:bg-card-dark rounded-xl p-6 border border-border dark:border-border-dark">
        <h2 className="text-lg font-semibold mb-4 text-text dark:text-text-dark">Change Password</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Current Password</label>
            <input type="password" required value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">New Password</label>
              <input type="password" required minLength={6} value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Confirm</label>
              <input type="password" required minLength={6} value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium disabled:opacity-50">
            <FiSave size={16} /> {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
