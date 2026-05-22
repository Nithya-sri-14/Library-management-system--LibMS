const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getMonthlyTrends, getPopularAuthors,
  getActiveBorrowers, getOverdueReport, getInventoryStats,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardStats);
router.get('/trends', protect, getMonthlyTrends);
router.get('/popular-authors', protect, getPopularAuthors);
router.get('/active-borrowers', protect, getActiveBorrowers);
router.get('/overdue-report', protect, getOverdueReport);
router.get('/inventory', protect, getInventoryStats);

module.exports = router;
