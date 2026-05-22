const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Borrower',
    required: true,
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['issued', 'returned', 'overdue', 'lost'],
    default: 'issued',
  },
  fine: {
    type: Number,
    default: 0,
    min: 0,
  },
  finePaid: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    default: '',
  },
}, { timestamps: true });

transactionSchema.index({ book: 1, borrower: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ dueDate: 1 });
transactionSchema.index({ issueDate: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
