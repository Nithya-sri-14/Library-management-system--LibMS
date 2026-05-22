const mongoose = require('mongoose');

const borrowerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Borrower name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    default: '',
    trim: true,
  },
  address: {
    type: String,
    default: '',
  },
  membershipType: {
    type: String,
    enum: ['basic', 'premium', 'student'],
    default: 'basic',
  },
  borrowedBooks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
  }],
  fines: {
    type: Number,
    default: 0,
    min: 0,
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
  profileImage: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  borrowLimit: {
    type: Number,
    default: 3,
  },
}, { timestamps: true });

borrowerSchema.index({ name: 'text' });
borrowerSchema.index({ membershipType: 1 });

module.exports = mongoose.model('Borrower', borrowerSchema);
