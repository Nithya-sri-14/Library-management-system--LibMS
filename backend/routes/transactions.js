const express = require('express');
const router = express.Router();
const { getTransactions, issueBook, returnBook, getOverdueTransactions } = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getTransactions);
router.get('/overdue', protect, getOverdueTransactions);
router.post('/issue', protect, authorize('admin', 'librarian'), issueBook);
router.put('/:id/return', protect, authorize('admin', 'librarian'), returnBook);

module.exports = router;
