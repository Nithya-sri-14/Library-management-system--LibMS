const express = require('express');
const router = express.Router();
const { getBorrowers, getBorrower, createBorrower, updateBorrower, deleteBorrower } = require('../controllers/borrowerController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getBorrowers);
router.get('/:id', protect, getBorrower);
router.post('/', protect, authorize('admin', 'librarian'), upload.single('profileImage'), createBorrower);
router.put('/:id', protect, authorize('admin', 'librarian'), upload.single('profileImage'), updateBorrower);
router.delete('/:id', protect, authorize('admin'), deleteBorrower);

module.exports = router;
