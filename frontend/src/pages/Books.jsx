import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiPlus, FiEdit2, FiTrash2, FiDownload, FiUpload, FiSearch, FiBook,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { booksAPI } from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';

export default function Books() {
  const { user } = useAuth();
  const canModify = ['admin', 'librarian'].includes(user?.role);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ genre: '', availability: '' });
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [genres, setGenres] = useState([]);
  const debouncedSearch = useDebounce(search);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.genre) params.genre = filters.genre;
      if (filters.availability) params.availability = filters.availability;
      const res = await booksAPI.getAll(params);
      setBooks(res.data.books);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filters]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);
  useEffect(() => { booksAPI.getGenres().then(r => setGenres(r.data.genres)).catch(() => {}); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try {
      await booksAPI.delete(id);
      toast.success('Book deleted');
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleExport = async (format) => {
    try {
      const res = await booksAPI.export(format);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `books.${format}`;
      a.click();
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch {
      toast.error('Export failed');
    }
  };

  const handleBulkImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await booksAPI.bulkImport(formData);
      toast.success('Books imported');
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    }
  };

  const columns = [
    { header: 'Title', accessor: 'title', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
          {row.coverImage ? (
            <img src={row.coverImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <FiBook size={16} className="text-text-muted" />
          )}
        </div>
        <span className="font-medium">{row.title}</span>
      </div>
    )},
    { header: 'ISBN', accessor: 'isbn' },
    { header: 'Author', render: (row) => row.author?.name || 'N/A' },
    { header: 'Genre', accessor: 'genre' },
    { header: 'Copies', render: (row) => `${row.availableCopies}/${row.totalCopies}` },
    { header: 'Shelf', accessor: 'shelfNumber' },
    ...(canModify ? [{
      header: 'Actions', render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => setModal({ open: true, mode: 'edit', data: row })}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-accent">
            <FiEdit2 size={14} />
          </button>
          <button onClick={() => handleDelete(row._id)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500">
            <FiTrash2 size={14} />
          </button>
        </div>
      ),
    }] : []),
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">Books</h1>
          <p className="text-text-muted text-sm">Manage your library collection</p>
        </div>
        <div className="flex gap-2">
          {canModify && (
            <>
              <button onClick={() => setModal({ open: true, mode: 'create', data: null })}
                className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90">
                <FiPlus size={16} /> Add Book
              </button>
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border dark:border-border-dark text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <FiUpload size={16} /> Import
                <input type="file" accept=".csv" onChange={handleBulkImport} className="hidden" />
              </label>
            </>
          )}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border dark:border-border-dark text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
              <FiDownload size={16} /> Export
            </button>
            <div className="absolute right-0 top-full mt-1 w-32 bg-card dark:bg-card-dark rounded-xl shadow-xl border border-border dark:border-border-dark overflow-hidden hidden group-hover:block z-50">
              <button onClick={() => handleExport('csv')} className="w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-left">CSV</button>
              <button onClick={() => handleExport('pdf')} className="w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-left">PDF</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input type="text" placeholder="Search by title or ISBN..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <select value={filters.genre} onChange={(e) => { setFilters(f => ({ ...f, genre: e.target.value })); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent">
          <option value="">All Genres</option>
          {genres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={filters.availability} onChange={(e) => { setFilters(f => ({ ...f, availability: e.target.value })); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent">
          <option value="">All Copies</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

      {!loading && books.length === 0 ? (
        <EmptyState icon={FiBook} title="No books found"
          description={search ? 'Try a different search term' : 'Get started by adding your first book'}
          action={canModify ? (
            <button onClick={() => setModal({ open: true, mode: 'create', data: null })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium">
              <FiPlus size={16} /> Add Book
            </button>
          ) : null}
        />
      ) : (
        <DataTable columns={columns} data={books} loading={loading}
          pagination={pagination} onPageChange={setPage} />
      )}

      <BookFormModal modal={modal} setModal={setModal} onSuccess={fetchBooks} genres={genres} />
    </motion.div>
  );
}

function BookFormModal({ modal, setModal, onSuccess, genres }) {
  const [form, setForm] = useState({ title: '', isbn: '', author: '', publisher: '', genre: '', language: 'English', totalCopies: 1, availableCopies: 1, shelfNumber: '', description: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const isEdit = modal.mode === 'edit';

  useEffect(() => {
    if (modal.data) {
      setForm({
        title: modal.data.title || '',
        isbn: modal.data.isbn || '',
        author: modal.data.author?._id || modal.data.author || '',
        publisher: modal.data.publisher || '',
        genre: modal.data.genre || '',
        language: modal.data.language || 'English',
        totalCopies: modal.data.totalCopies || 1,
        availableCopies: modal.data.availableCopies || 1,
        shelfNumber: modal.data.shelfNumber || '',
        description: modal.data.description || '',
      });
    } else {
      setForm({ title: '', isbn: '', author: '', publisher: '', genre: '', language: 'English', totalCopies: 1, availableCopies: 1, shelfNumber: '', description: '' });
    }
    setFile(null);
  }, [modal.data, modal.open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('coverImage', file);
      if (isEdit) await booksAPI.update(modal.data._id, fd);
      else await booksAPI.create(fd);
      toast.success(isEdit ? 'Book updated' : 'Book created');
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
      title={isEdit ? 'Edit Book' : 'Add New Book'} size="lg">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Title *</label>
          <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">ISBN *</label>
          <input type="text" required value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Author ID *</label>
          <input type="text" required value={form.author} onChange={e => setForm({ ...form, author: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Genre</label>
          <input type="text" value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Publisher</label>
          <input type="text" value={form.publisher} onChange={e => setForm({ ...form, publisher: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Language</label>
          <input type="text" value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Total Copies</label>
          <input type="number" min="0" value={form.totalCopies} onChange={e => setForm({ ...form, totalCopies: parseInt(e.target.value), availableCopies: isEdit ? form.availableCopies : parseInt(e.target.value) })}
            className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Available Copies</label>
          <input type="number" min="0" value={form.availableCopies} onChange={e => setForm({ ...form, availableCopies: parseInt(e.target.value) })}
            className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Shelf Number</label>
          <input type="text" value={form.shelfNumber} onChange={e => setForm({ ...form, shelfNumber: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Cover Image</label>
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])}
            className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-text dark:text-text-dark">Description</label>
          <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div className="md:col-span-2 flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => setModal({ open: false, mode: 'create', data: null })}
            className="px-4 py-2 rounded-lg border border-border dark:border-border-dark text-text dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
          <button type="submit" disabled={saving}
            className="px-6 py-2 rounded-lg gradient-primary text-white font-medium disabled:opacity-50">
            {saving ? 'Saving...' : isEdit ? 'Update Book' : 'Create Book'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
