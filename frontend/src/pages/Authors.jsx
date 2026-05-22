import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authorsAPI } from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';

export default function Authors() {
  const { user } = useAuth();
  const canModify = ['admin', 'librarian'].includes(user?.role);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const debouncedSearch = useDebounce(search);

  const fetchAuthors = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await authorsAPI.getAll(params);
      setAuthors(res.data.authors);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load authors');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchAuthors(); }, [fetchAuthors]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this author?')) return;
    try {
      await authorsAPI.delete(id);
      toast.success('Author deleted');
      fetchAuthors();
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
    { header: 'Nationality', accessor: 'nationality' },
    { header: 'Books Written', accessor: 'booksWritten' },
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
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">Authors</h1>
          <p className="text-text-muted text-sm">Manage book authors</p>
        </div>
        {canModify && (
          <button onClick={() => setModal({ open: true, mode: 'create', data: null })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90">
            <FiPlus size={16} /> Add Author
          </button>
        )}
      </div>

      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input type="text" placeholder="Search authors..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>

      {!loading && authors.length === 0 ? (
        <EmptyState icon={FiUser} title="No authors found"
          description={search ? 'Try a different search term' : 'Add your first author'}
          action={canModify ? (
            <button onClick={() => setModal({ open: true, mode: 'create', data: null })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium"><FiPlus size={16} /> Add Author</button>
          ) : null}
        />
      ) : (
        <DataTable columns={columns} data={authors} loading={loading}
          pagination={pagination} onPageChange={setPage} />
      )}

      <AuthorFormModal modal={modal} setModal={setModal} onSuccess={fetchAuthors} />
    </motion.div>
  );
}

function AuthorFormModal({ modal, setModal, onSuccess }) {
  const [form, setForm] = useState({ name: '', biography: '', nationality: '', birthDate: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const isEdit = modal.mode === 'edit';

  useEffect(() => {
    if (modal.data) {
      setForm({
        name: modal.data.name || '',
        biography: modal.data.biography || '',
        nationality: modal.data.nationality || '',
        birthDate: modal.data.birthDate ? modal.data.birthDate.split('T')[0] : '',
      });
    } else {
      setForm({ name: '', biography: '', nationality: '', birthDate: '' });
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
      if (isEdit) await authorsAPI.update(modal.data._id, fd);
      else await authorsAPI.create(fd);
      toast.success(isEdit ? 'Author updated' : 'Author created');
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
      title={isEdit ? 'Edit Author' : 'Add New Author'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Name *</label>
          <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Nationality</label>
            <input type="text" value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Birth Date</label>
            <input type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Biography</label>
          <textarea rows={4} value={form.biography} onChange={e => setForm({ ...form, biography: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Profile Image</label>
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])}
            className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark" />
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
