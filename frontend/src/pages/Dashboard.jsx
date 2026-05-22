import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiBook, FiBookOpen, FiUsers, FiAlertTriangle, FiDollarSign, FiTrendingUp,
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { reportsAPI } from '../services/api';
import StatsCard from '../components/StatsCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { Link } from 'react-router-dom';

const COLORS = ['#1a3a5c', '#0d9488', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [genreDistribution, setGenreDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, trendsRes, popularRes] = await Promise.all([
          reportsAPI.dashboard(),
          reportsAPI.trends(),
          reportsAPI.popularAuthors(),
        ]);
        setStats(statsRes.data.stats);
        setRecentTransactions(statsRes.data.recentTransactions || []);
        setPopularBooks(statsRes.data.popularBooks || []);
        setGenreDistribution(statsRes.data.genreDistribution || []);
        setTrends(trendsRes.data.trends || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = trends.map((t) => ({
    month: `${t._id.month}/${t._id.year}`,
    Issued: t.issued,
    Returned: t.returned,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">Dashboard</h1>
          <p className="text-text-muted dark:text-text-muted-dark text-sm mt-1">
            Overview of your library system
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard title="Total Books" value={stats?.totalBooks || 0} icon={FiBook} color="primary" loading={loading} />
        <StatsCard title="Available" value={stats?.availableBooks || 0} icon={FiBookOpen} color="accent" loading={loading} />
        <StatsCard title="Borrowed" value={stats?.borrowedBooks || 0} icon={FiTrendingUp} color="warm" loading={loading} />
        <StatsCard title="Overdue" value={stats?.overdueBooks || 0} icon={FiAlertTriangle} color="rose" loading={loading} />
        <StatsCard title="Borrowers" value={stats?.totalBorrowers || 0} icon={FiUsers} color="cool" loading={loading} />
        <StatsCard title="Fines" value={`$${stats?.totalFines || 0}`} icon={FiDollarSign} color="warm" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-card dark:bg-card-dark rounded-xl p-6 border border-border dark:border-border-dark"
        >
          <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Monthly Borrow Trends</h3>
          {loading ? (
            <div className="skeleton h-64" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="Issued" fill="#1a3a5c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Returned" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card dark:bg-card-dark rounded-xl p-6 border border-border dark:border-border-dark"
        >
          <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Genre Distribution</h3>
          {loading ? (
            <div className="skeleton h-64" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genreDistribution}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                >
                  {genreDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card dark:bg-card-dark rounded-xl p-6 border border-border dark:border-border-dark"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text dark:text-text-dark">Recent Activity</h3>
            <Link to="/transactions" className="text-sm text-accent hover:text-accent-light">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-12" />)}
            </div>
          ) : recentTransactions.length === 0 ? (
            <p className="text-text-muted text-sm py-8 text-center">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((t) => (
                <div key={t._id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className={`w-2 h-2 rounded-full ${t.status === 'returned' ? 'bg-accent' : t.status === 'overdue' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text dark:text-text-dark truncate">{t.book?.title}</p>
                    <p className="text-xs text-text-muted">{t.borrower?.name} · {new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                    t.status === 'returned' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    t.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>{t.status}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card dark:bg-card-dark rounded-xl p-6 border border-border dark:border-border-dark"
        >
          <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">Most Borrowed Books</h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-12" />)}
            </div>
          ) : popularBooks.length === 0 ? (
            <p className="text-text-muted text-sm py-8 text-center">No data yet</p>
          ) : (
            <div className="space-y-3">
              {popularBooks.map((book, i) => (
                <div key={book._id} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-text-muted w-6">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text dark:text-text-dark truncate">{book.title}</p>
                  </div>
                  <span className="text-sm font-semibold text-accent">{book.borrowedCount}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
