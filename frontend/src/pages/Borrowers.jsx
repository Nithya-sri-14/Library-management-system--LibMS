import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { borrowersAPI } from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';

export default function Borrowers() {
  const { user } = useAuth();
  const canModify = ['admin', 'librarian'].includes(user?.role);
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const debouncedSearch = useDebounce(search);

  const fetchBorrowers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await borrowersAPI.getAll(params);
      setBorrowers(res.data.borrowers);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load borrowers');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchBorrowers(); }, [fetchBorrowers]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this borrower?')) return;
    try {
      await borrowersAPI.delete(id);
      toast.success('Borrower deleted');
      fetchBorrowers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    { header: 'Name', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
          {row.profileImage ? <img src={row.profileImage} alt="" className="w-full h-full object-cover" />
            : <FiUser size={14} className="text-text-muted" />}
        </div>
        <span className="font-medium">{row.name}</span>
      </div>
    )},
    { header: 'Email', render: (row) => (
      <div className="flex items-center gap-1.5 text-text-muted">
        <FiMail size={12} /> {row.email}
      </div>
    )},
    { header: 'Phone', render: (row) => (
      <div className="flex items-center gap-1.5 text-text-muted">
        <FiPhone size={12} /> {row.phone || 'N/A'}
      </div>
    )},
    { header: 'Membership', render: (row) => (
      <span className={`text-xs px-2 py-1 rounded-full capitalize ${
        row.membershipType === 'premium' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
        row.membershipType === 'student' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      }`}>{row.membershipType}</span>
    )},
    { header: 'Fines', render: (row) => <span className={row.fines > 0 ? 'text-red-500 font-medium' : ''}>${row.fines}</span> },
    { header: 'Borrow Limit', accessor: 'borrowLimit' },
    ...(canModify ? [{
      header: 'Actions', render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => setModal({ open: true, mode: 'edit', data: row })}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-accent"><FiEdit2 size={14} /></button>
          <button onClick={() => handleDelete(row._id)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500"><FiTrash2 size={14} /></button>
        </div>
      ),
    }] : []),
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">Borrowers</h1>
          <p className="text-text-muted text-sm">Manage library members</p>
        </div>
        {canModify && (
          <button onClick={() => setModal({ open: true, mode: 'create', data: null })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90">
            <FiPlus size={16} /> Add Borrower
          </button>
        )}
      </div>

      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input type="text" placeholder="Search by name, email, or phone..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>

      {!loading && borrowers.length === 0 ? (
        <EmptyState icon={FiUsers} title="No borrowers found"
          description={search ? 'Try a different search term' : 'Register your first borrower'}
          action={canModify ? (
            <button onClick={() => setModal({ open: true, mode: 'create', data: null })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium"><FiPlus size={16} /> Add Borrower</button>
          ) : null}
        />
      ) : (
        <DataTable columns={columns} data={borrowers} loading={loading}
          pagination={pagination} onPageChange={setPage} />
      )}

      <BorrowerFormModal modal={modal} setModal={setModal} onSuccess={fetchBorrowers} />
    </motion.div>
  );
}

function BorrowerFormModal({ modal, setModal, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', membershipType: 'basic', borrowLimit: 3 });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const isEdit = modal.mode === 'edit';

  useEffect(() => {
    if (modal.data) {
      setForm({
        name: modal.data.name || '',
        email: modal.data.email || '',
        phone: modal.data.phone || '',
        address: modal.data.address || '',
        membershipType: modal.data.membershipType || 'basic',
        borrowLimit: modal.data.borrowLimit || 3,
      });
    } else {
      setForm({ name: '', email: '', phone: '', address: '', membershipType: 'basic', borrowLimit: 3 });
    }
    setFile(null);
  }, [modal.data, modal.open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('profileImage', file);
      if (isEdit) await borrowersAPI.update(modal.data._id, fd);
      else await borrowersAPI.create(fd);
      toast.success(isEdit ? 'Borrower updated' : 'Borrower created');
      setModal({ open: false, mode: 'create', data: null });
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })}
      title={isEdit ? 'Edit Borrower' : 'Add New Borrower'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Name *</label>
            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Email *</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Phone</label>
            <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Membership</label>
            <select value={form.membershipType} onChange={e => setForm({ ...form, membershipType: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent">
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="student">Student</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Borrow Limit</label>
            <input type="number" min="1" max="20" value={form.borrowLimit} onChange={e => setForm({ ...form, borrowLimit: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Profile Image</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])}
              className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Address</label>
          <textarea rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => setModal({ open: false, mode: 'create', data: null })}
            className="px-4 py-2 rounded-lg border border-border dark:border-border-dark text-text dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
          <button type="submit" disabled={saving}
            className="px-6 py-2 rounded-lg gradient-primary text-white font-medium disabled:opacity-50">
            {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
