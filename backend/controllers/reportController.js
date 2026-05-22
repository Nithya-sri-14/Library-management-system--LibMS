const Book = require('../models/Book');
const Borrower = require('../models/Borrower');
const Transaction = require('../models/Transaction');
const Fine = require('../models/Fine');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalBooks,
      availableBooks,
      totalBorrowers,
      activeTransactions,
      overdueCount,
      totalFines,
      recentTransactions,
      popularBooks,
      genreDistribution,
    ] = await Promise.all([
      Book.countDocuments({ isActive: true }),
      Book.aggregate([{ $match: { isActive: true } }, { $group: { _id: null, total: { $sum: '$availableCopies' } } }]),
      Borrower.countDocuments({ isActive: true }),
      Transaction.countDocuments({ status: 'issued' }),
      Transaction.countDocuments({ status: 'issued', dueDate: { $lt: new Date() } }),
      Fine.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Transaction.find()
        .populate({ path: 'book', select: 'title coverImage' })
        .populate({ path: 'borrower', select: 'name' })
        .sort('-createdAt')
        .limit(10)
        .lean(),
      Book.find({ isActive: true }).sort('-borrowedCount').limit(10).select('title borrowedCount').lean(),
      Book.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$genre', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalBooks,
        availableBooks: availableBooks[0]?.total || 0,
        borrowedBooks: activeTransactions,
        overdueBooks: overdueCount,
        totalBorrowers,
        totalFines: totalFines[0]?.total || 0,
      },
      recentTransactions,
      popularBooks,
      genreDistribution,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMonthlyTrends = async (req, res, next) => {
  try {
    const trends = await Transaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$issueDate' },
            month: { $month: '$issueDate' },
          },
          issued: { $sum: 1 },
          returned: {
            $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);
    res.json({ success: true, trends });
  } catch (error) {
    next(error);
  }
};

exports.getPopularAuthors = async (req, res, next) => {
  try {
    const authors = await Book.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$author', borrowedCount: { $sum: '$borrowedCount' } } },
      { $sort: { borrowedCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'authors',
          localField: '_id',
          foreignField: '_id',
          as: 'author',
        },
      },
      { $unwind: '$author' },
      { $project: { name: '$author.name', borrowedCount: 1 } },
    ]);
    res.json({ success: true, authors });
  } catch (error) {
    next(error);
  }
};

exports.getActiveBorrowers = async (req, res, next) => {
  try {
    const borrowers = await Transaction.aggregate([
      { $match: { status: 'issued' } },
      { $group: { _id: '$borrower', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'borrowers',
          localField: '_id',
          foreignField: '_id',
          as: 'borrower',
        },
      },
      { $unwind: '$borrower' },
      { $project: { name: '$borrower.name', email: '$borrower.email', count: 1 } },
    ]);
    res.json({ success: true, borrowers });
  } catch (error) {
    next(error);
  }
};

exports.getOverdueReport = async (req, res, next) => {
  try {
    const overdue = await Transaction.find({
      status: 'issued',
      dueDate: { $lt: new Date() },
    })
      .populate({ path: 'book', select: 'title isbn' })
      .populate({ path: 'borrower', select: 'name email phone' })
      .sort({ dueDate: 1 })
      .lean();

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=overdue-report.pdf');
    doc.pipe(res);
    doc.fontSize(20).text('Overdue Books Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    overdue.forEach((item, i) => {
      doc.fontSize(12).text(
        `${i + 1}. ${item.book?.title} - ${item.borrower?.name} (Due: ${new Date(item.dueDate).toLocaleDateString()})`
      );
    });
    doc.end();
  } catch (error) {
    next(error);
  }
};

exports.getInventoryStats = async (req, res, next) => {
  try {
    const stats = await Book.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalCopies: { $sum: '$totalCopies' },
          availableCopies: { $sum: '$availableCopies' },
          borrowedCopies: { $sum: { $subtract: ['$totalCopies', '$availableCopies'] } },
          uniqueBooks: { $sum: 1 },
        },
      },
    ]);
    res.json({ success: true, stats: stats[0] || { totalCopies: 0, availableCopies: 0, borrowedCopies: 0, uniqueBooks: 0 } });
  } catch (error) {
    next(error);
  }
};
