import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiRefreshCw, FiRepeat, FiBook, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { transactionsAPI, booksAPI, borrowersAPI } from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [showIssue, setShowIssue] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const res = await transactionsAPI.getAll(params);
      setTransactions(res.data.transactions);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleReturn = async (id) => {
    try {
      await transactionsAPI.return(id);
      toast.success('Book returned');
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Return failed');
    }
  };

  const columns = [
    { header: 'Book', render: (row) => (
      <div className="flex items-center gap-2">
        <FiBook size={14} className="text-text-muted" />
        <span className="font-medium">{row.book?.title || 'N/A'}</span>
      </div>
    )},
    { header: 'Borrower', render: (row) => (
      <div className="flex items-center gap-2">
        <FiUser size={14} className="text-text-muted" />
        {row.borrower?.name || 'N/A'}
      </div>
    )},
    { header: 'Issue Date', render: (row) => new Date(row.issueDate).toLocaleDateString() },
    { header: 'Due Date', render: (row) => {
      const d = new Date(row.dueDate);
      const isOverdue = row.status === 'issued' && d < new Date();
      return <span className={isOverdue ? 'text-red-500 font-medium' : ''}>{d.toLocaleDateString()}</span>;
    }},
    { header: 'Status', render: (row) => (
      <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${
        row.status === 'returned' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
        row.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      }`}>{row.status}</span>
    )},
    { header: 'Fine', render: (row) => row.fine > 0 ? <span className="text-red-500">${row.fine}</span> : '-' },
    { header: 'Actions', render: (row) => (
      row.status === 'issued' ? (
        <button onClick={() => handleReturn(row._id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-dark">
          <FiRefreshCw size={12} /> Return
        </button>
      ) : <span className="text-xs text-text-muted">-</span>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">Transactions</h1>
          <p className="text-text-muted text-sm">Issue and return books</p>
        </div>
        <button onClick={() => setShowIssue(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90">
          <FiPlus size={16} /> Issue Book
        </button>
      </div>

      <div className="flex gap-4">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent">
          <option value="">All Status</option>
          <option value="issued">Issued</option>
          <option value="returned">Returned</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {!loading && transactions.length === 0 ? (
        <EmptyState icon={FiRepeat} title="No transactions yet"
          description="Start by issuing a book to a borrower" />
      ) : (
        <DataTable columns={columns} data={transactions} loading={loading}
          pagination={pagination} onPageChange={setPage} />
      )}

      <IssueBookModal isOpen={showIssue} onClose={() => setShowIssue(false)} onSuccess={fetchTransactions} />
    </motion.div>
  );
}

function IssueBookModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({ bookId: '', borrowerId: '', dueDate: '' });
  const [saving, setSaving] = useState(false);
  const [bookSuggestions, setBookSuggestions] = useState([]);
  const [borrowerSuggestions, setBorrowerSuggestions] = useState([]);
  const [bookSearch, setBookSearch] = useState('');
  const [borrowerSearch, setBorrowerSearch] = useState('');

  useEffect(() => {
    if (bookSearch.length > 1) {
      booksAPI.getAll({ search: bookSearch, limit: 5 }).then(r => setBookSuggestions(r.data.books)).catch(() => {});
    }
  }, [bookSearch]);

  useEffect(() => {
    if (borrowerSearch.length > 1) {
      borrowersAPI.getAll({ search: borrowerSearch, limit: 5 }).then(r => setBorrowerSuggestions(r.data.borrowers)).catch(() => {});
    }
  }, [borrowerSearch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await transactionsAPI.issue(form);
      toast.success('Book issued successfully');
      onClose();
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue book');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issue Book">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Book *</label>
          <input type="text" placeholder="Search by title or ISBN..." value={bookSearch}
            onChange={(e) => setBookSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent mb-2" />
          {bookSuggestions.length > 0 && (
            <div className="border border-border dark:border-border-dark rounded-lg overflow-hidden">
              {bookSuggestions.map(b => (
                <button type="button" key={b._id} onClick={() => { setForm(f => ({ ...f, bookId: b._id })); setBookSearch(`${b.title} (${b.isbn})`); setBookSuggestions([]); }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex justify-between">
                  <span>{b.title}</span>
                  <span className="text-text-muted">{b.availableCopies} available</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Borrower *</label>
          <input type="text" placeholder="Search by name or email..." value={borrowerSearch}
            onChange={(e) => setBorrowerSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent mb-2" />
          {borrowerSuggestions.length > 0 && (
            <div className="border border-border dark:border-border-dark rounded-lg overflow-hidden">
              {borrowerSuggestions.map(b => (
                <button type="button" key={b._id} onClick={() => { setForm(f => ({ ...f, borrowerId: b._id })); setBorrowerSearch(b.name); setBorrowerSuggestions([]); }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                  {b.name} ({b.email})
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Due Date *</label>
          <input type="date" required value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border dark:border-border-dark text-text dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
          <button type="submit" disabled={saving || !form.bookId || !form.borrowerId}
            className="px-6 py-2 rounded-lg gradient-primary text-white font-medium disabled:opacity-50">
            {saving ? 'Issuing...' : 'Issue Book'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
