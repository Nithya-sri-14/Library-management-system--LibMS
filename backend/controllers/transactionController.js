const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const Borrower = require('../models/Borrower');
const Fine = require('../models/Fine');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const { paginate, calculateFine } = require('../utils/helpers');

exports.getTransactions = async (req, res, next) => {
  try {
    const { skip, limit, page } = paginate(req.query.page, req.query.limit);
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.borrower) filter.borrower = req.query.borrower;
    if (req.query.book) filter.book = req.query.book;

    if (req.query.overdue === 'true') {
      filter.status = 'issued';
      filter.dueDate = { $lt: new Date() };
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate({ path: 'book', select: 'title isbn coverImage' })
        .populate({ path: 'borrower', select: 'name email phone' })
        .populate({ path: 'issuedBy', select: 'name' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

exports.issueBook = async (req, res, next) => {
  try {
    const { bookId, borrowerId, dueDate } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.availableCopies <= 0) return res.status(400).json({ message: 'No copies available' });

    const borrower = await Borrower.findById(borrowerId);
    if (!borrower) return res.status(404).json({ message: 'Borrower not found' });
    if (!borrower.isActive) return res.status(400).json({ message: 'Borrower is inactive' });

    const activeBorrows = await Transaction.countDocuments({ borrower: borrowerId, status: 'issued' });
    if (activeBorrows >= borrower.borrowLimit) {
      return res.status(400).json({ message: `Borrower reached limit of ${borrower.borrowLimit} books` });
    }

    if (borrower.fines > 0) {
      return res.status(400).json({ message: `Borrower has unpaid fines of $${borrower.fines}` });
    }

    const transaction = await Transaction.create({
      book: bookId,
      borrower: borrowerId,
      issuedBy: req.user._id,
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });

    book.availableCopies -= 1;
    book.borrowedCount += 1;
    await book.save();

    borrower.borrowedBooks.push(transaction._id);
    await borrower.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'issue',
      resource: 'Transaction',
      resourceId: transaction._id,
      details: { book: book.title, borrower: borrower.name },
    });

    const populated = await transaction.populate([
      { path: 'book', select: 'title isbn' },
      { path: 'borrower', select: 'name email' },
    ]);

    res.status(201).json({ success: true, transaction: populated });
  } catch (error) {
    next(error);
  }
};

exports.returnBook = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.status === 'returned') return res.status(400).json({ message: 'Book already returned' });

    transaction.returnDate = new Date();
    transaction.status = 'returned';

    const fineAmount = calculateFine(transaction.dueDate, transaction.returnDate);
    if (fineAmount > 0) {
      transaction.fine = fineAmount;
      await Fine.create({
        transaction: transaction._id,
        borrower: transaction.borrower,
        amount: fineAmount,
        daysOverdue: Math.ceil((transaction.returnDate - transaction.dueDate) / (1000 * 60 * 60 * 24)),
      });
      await Borrower.findByIdAndUpdate(transaction.borrower, { $inc: { fines: fineAmount } });
      await Notification.create({
        user: req.user._id,
        title: 'Fine Incurred',
        message: `Fine of $${fineAmount} for overdue book`,
        type: 'warning',
        relatedTo: transaction._id,
        onModel: 'Transaction',
      });
    }

    await transaction.save();

    const book = await Book.findById(transaction.book);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'return',
      resource: 'Transaction',
      resourceId: transaction._id,
      details: { fine: fineAmount },
    });

    const populated = await transaction.populate([
      { path: 'book', select: 'title isbn' },
      { path: 'borrower', select: 'name email' },
    ]);

    res.json({ success: true, transaction: populated });
  } catch (error) {
    next(error);
  }
};

exports.getOverdueTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      status: 'issued',
      dueDate: { $lt: new Date() },
    })
      .populate({ path: 'book', select: 'title isbn' })
      .populate({ path: 'borrower', select: 'name email phone' })
      .sort({ dueDate: 1 });
    res.json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    next(error);
  }
};
