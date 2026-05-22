import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiBell, FiInfo, FiAlertTriangle, FiCheckCircle, FiXCircle, FiCheck, FiTrash2,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { notificationsAPI } from '../services/api';

const iconMap = {
  info: FiInfo,
  warning: FiAlertTriangle,
  success: FiCheckCircle,
  error: FiXCircle,
  overdue: FiAlertTriangle,
  due_date: FiBell,
};

const colorMap = {
  info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  success: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  error: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  overdue: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  due_date: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      fetchNotifications();
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      toast.success('All marked as read');
      fetchNotifications();
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await notificationsAPI.delete(id);
      toast.success('Notification deleted');
      fetchNotifications();
    } catch {}
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">Notifications</h1>
          <p className="text-text-muted text-sm">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border dark:border-border-dark text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
            <FiCheck size={16} /> Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <FiBell size={48} className="text-text-muted mb-4" />
          <h3 className="text-lg font-semibold text-text dark:text-text-dark">No notifications</h3>
          <p className="text-sm text-text-muted">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = iconMap[n.type] || FiBell;
            const colorClass = colorMap[n.type] || colorMap.info;
            return (
              <div key={n._id}
                className={`flex items-start gap-4 p-4 rounded-xl border ${
                  n.isRead
                    ? 'bg-card dark:bg-card-dark border-border dark:border-border-dark'
                    : 'bg-accent/5 border-accent/20 dark:border-accent/30'
                }`}
              >
                <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text dark:text-text-dark">{n.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">{n.message}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex gap-1">
                  {!n.isRead && (
                    <button onClick={() => handleMarkRead(n._id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-accent">
                      <FiCheck size={14} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(n._id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
