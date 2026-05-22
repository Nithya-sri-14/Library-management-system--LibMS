const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema({
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true,
  },
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Borrower',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  daysOverdue: {
    type: Number,
    required: true,
    min: 0,
  },
  reason: {
    type: String,
    default: 'Overdue return',
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'waived'],
    default: 'pending',
  },
  paidDate: {
    type: Date,
  },
}, { timestamps: true });

fineSchema.index({ borrower: 1, status: 1 });
fineSchema.index({ transaction: 1 });

module.exports = mongoose.model('Fine', fineSchema);
