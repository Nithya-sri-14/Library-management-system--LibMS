import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiBarChart2, FiDownload, FiBook, FiUsers, FiAlertTriangle, FiTrendingUp,
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import { reportsAPI } from '../services/api';

const COLORS = ['#1a3a5c', '#0d9488', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('overview');
  const [trends, setTrends] = useState([]);
  const [popularAuthors, setPopularAuthors] = useState([]);
  const [activeBorrowers, setActiveBorrowers] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [trendsRes, authorsRes, borrowersRes, invRes] = await Promise.all([
          reportsAPI.trends(),
          reportsAPI.popularAuthors(),
          reportsAPI.activeBorrowers(),
          reportsAPI.inventory(),
        ]);
        setTrends(trendsRes.data.trends || []);
        setPopularAuthors(authorsRes.data.authors || []);
        setActiveBorrowers(borrowersRes.data.borrowers || []);
        setInventory(invRes.data.stats);
      } catch {
        toast.error('Failed to load reports');
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

  const handleExport = async () => {
    try {
      const res = await reportsAPI.overdueReport();
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'overdue-report.pdf';
      a.click();
      toast.success('Report downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'trends', label: 'Trends' },
    { id: 'authors', label: 'Popular Authors' },
    { id: 'inventory', label: 'Inventory' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">Reports & Analytics</h1>
          <p className="text-text-muted text-sm">Insights and statistics</p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border dark:border-border-dark text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
          <FiDownload size={16} /> Overdue Report
        </button>
      </div>

      <div className="flex gap-2 border-b border-border dark:border-border-dark pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'text-text-muted hover:text-text dark:hover:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card dark:bg-card-dark rounded-xl p-6 border border-border dark:border-border-dark">
            <h3 className="text-lg font-semibold mb-4 text-text dark:text-text-dark">Monthly Trend</h3>
            {loading ? <div className="skeleton h-64" /> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="Issued" fill="#1a3a5c" radius={[4,4,0,0]} />
                  <Bar dataKey="Returned" fill="#0d9488" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-card dark:bg-card-dark rounded-xl p-6 border border-border dark:border-border-dark">
            <h3 className="text-lg font-semibold mb-4 text-text dark:text-text-dark">Active Borrowers</h3>
            {loading ? <div className="skeleton h-64" /> : (
              <div className="space-y-3">
                {activeBorrowers.map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div>
                      <p className="text-sm font-medium text-text dark:text-text-dark">{b.name}</p>
                      <p className="text-xs text-text-muted">{b.email}</p>
                    </div>
                    <span className="text-sm font-bold text-accent">{b.count} books</span>
                  </div>
                ))}
                {activeBorrowers.length === 0 && <p className="text-text-muted text-sm text-center py-8">No active borrowers</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="bg-card dark:bg-card-dark rounded-xl p-6 border border-border dark:border-border-dark">
          <h3 className="text-lg font-semibold mb-4 text-text dark:text-text-dark">Borrow Trends (Line Chart)</h3>
          {loading ? <div className="skeleton h-64" /> : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fill: '#64748b' }} />
                <YAxis tick={{ fill: '#64748b' }} />
                <Tooltip />
                <Line type="monotone" dataKey="Issued" stroke="#1a3a5c" strokeWidth={2} dot={{ fill: '#1a3a5c' }} />
                <Line type="monotone" dataKey="Returned" stroke="#0d9488" strokeWidth={2} dot={{ fill: '#0d9488' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {activeTab === 'authors' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card dark:bg-card-dark rounded-xl p-6 border border-border dark:border-border-dark">
            <h3 className="text-lg font-semibold mb-4 text-text dark:text-text-dark">Most Borrowed Authors</h3>
            {loading ? <div className="skeleton h-64" /> : (
              <div className="space-y-3">
                {popularAuthors.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-text-muted w-6">{i + 1}</span>
                      <span className="text-sm font-medium text-text dark:text-text-dark">{a.name}</span>
                    </div>
                    <span className="text-sm font-bold text-accent">{a.borrowedCount}</span>
                  </div>
                ))}
                {popularAuthors.length === 0 && <p className="text-text-muted text-sm text-center py-8">No data</p>}
              </div>
            )}
          </div>
          <div className="bg-card dark:bg-card-dark rounded-xl p-6 border border-border dark:border-border-dark">
            <h3 className="text-lg font-semibold mb-4 text-text dark:text-text-dark">Distribution</h3>
            {loading ? <div className="skeleton h-64" /> : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={popularAuthors.slice(0, 5)} dataKey="borrowedCount" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {popularAuthors.slice(0, 5).map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Copies', value: inventory?.totalCopies || 0, icon: FiBook, color: 'primary' },
            { label: 'Available', value: inventory?.availableCopies || 0, icon: FiBook, color: 'accent' },
            { label: 'Borrowed', value: inventory?.borrowedCopies || 0, icon: FiTrendingUp, color: 'warm' },
            { label: 'Unique Titles', value: inventory?.uniqueBooks || 0, icon: FiBarChart2, color: 'cool' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card dark:bg-card-dark rounded-xl p-6 border border-border dark:border-border-dark">
              <p className="text-sm text-text-muted mb-1">{item.label}</p>
              <p className="text-3xl font-bold text-text dark:text-text-dark">{item.value}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
