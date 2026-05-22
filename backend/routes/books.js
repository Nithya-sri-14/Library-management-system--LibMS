const express = require('express');
const router = express.Router();
const {
  getBooks, getBook, createBook, updateBook, deleteBook,
  bulkImport, exportBooks, getGenres, searchSuggestions,
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getBooks);
router.get('/genres', getGenres);
router.get('/suggestions', searchSuggestions);
router.get('/export', exportBooks);
router.get('/:id', getBook);
router.post('/', protect, authorize('admin', 'librarian'), upload.single('coverImage'), createBook);
router.put('/:id', protect, authorize('admin', 'librarian'), upload.single('coverImage'), updateBook);
router.delete('/:id', protect, authorize('admin'), deleteBook);
router.post('/bulk-import', protect, authorize('admin'), upload.single('file'), bulkImport);

module.exports = router;
