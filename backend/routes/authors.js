const express = require('express');
const router = express.Router();
const { getAuthors, getAuthor, createAuthor, updateAuthor, deleteAuthor } = require('../controllers/authorController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getAuthors);
router.get('/:id', getAuthor);
router.post('/', protect, authorize('admin', 'librarian'), upload.single('profileImage'), createAuthor);
router.put('/:id', protect, authorize('admin', 'librarian'), upload.single('profileImage'), updateAuthor);
router.delete('/:id', protect, authorize('admin'), deleteAuthor);

module.exports = router;
