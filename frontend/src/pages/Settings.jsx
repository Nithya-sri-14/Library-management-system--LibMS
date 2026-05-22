import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiMoon, FiSun, FiGlobe, FiBell, FiShield, FiUsers,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function Settings() {
  const { dark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);

  const loadUsers = async () => {
    try {
      const res = await authAPI.getUsers();
      setUsers(res.data.users);
      setShowUsers(true);
    } catch {
      toast.error('Failed to load users');
    }
  };

  const handleToggleUser = async (id, isActive) => {
    try {
      await authAPI.updateUser(id, { isActive: !isActive });
      toast.success('User updated');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Settings</h1>
        <p className="text-text-muted text-sm">Customize your experience</p>
      </div>

      <div className="bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark divide-y divide-border dark:divide-border-dark">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600">
              {dark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </div>
            <div>
              <p className="font-medium text-text dark:text-text-dark">Theme</p>
              <p className="text-sm text-text-muted">{dark ? 'Dark mode' : 'Light mode'}</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-colors ${dark ? 'bg-accent' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${dark ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
              <FiGlobe size={20} />
            </div>
            <div>
              <p className="font-medium text-text dark:text-text-dark">Language</p>
              <p className="text-sm text-text-muted">English (default)</p>
            </div>
          </div>
          <select className="px-3 py-1.5 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark text-sm">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>

        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600">
              <FiBell size={20} />
            </div>
            <div>
              <p className="font-medium text-text dark:text-text-dark">Notifications</p>
              <p className="text-sm text-text-muted">Receive alerts and updates</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-text-muted">
            <label className="flex items-center gap-1.5">
              <input type="checkbox" defaultChecked className="rounded border-border text-accent focus:ring-accent" /> Email
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" defaultChecked className="rounded border-border text-accent focus:ring-accent" /> In-app
            </label>
          </div>
        </div>
      </div>

      {user?.role === 'admin' && (
        <div className="bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark">
          <div className="p-6 border-b border-border dark:border-border-dark">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600">
                  <FiUsers size={20} />
                </div>
                <div>
                  <p className="font-medium text-text dark:text-text-dark">User Management</p>
                  <p className="text-sm text-text-muted">Manage system users</p>
                </div>
              </div>
              <button onClick={loadUsers}
                className="px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium">
                {showUsers ? 'Refresh' : 'View Users'}
              </button>
            </div>
          </div>

          {showUsers && (
            <div className="p-6">
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text dark:text-text-dark">{u.name}</p>
                        <p className="text-xs text-text-muted">{u.email} · <span className="capitalize">{u.role}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button onClick={() => handleToggleUser(u._id, u.isActive)}
                        className={`text-xs px-3 py-1 rounded-lg border ${
                          u.isActive
                            ? 'border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'border-green-300 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
