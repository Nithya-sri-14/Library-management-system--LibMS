const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: [true, 'Author is required'],
  },
  publisher: {
    type: String,
    trim: true,
    default: '',
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    trim: true,
  },
  language: {
    type: String,
    default: 'English',
    trim: true,
  },
  edition: {
    type: String,
    default: '1st',
    trim: true,
  },
  totalCopies: {
    type: Number,
    required: true,
    min: 0,
    default: 1,
  },
  availableCopies: {
    type: Number,
    required: true,
    min: 0,
    default: 1,
    validate: {
      validator: function (v) { return v <= this.totalCopies; },
      message: 'Available copies cannot exceed total copies',
    },
  },
  shelfNumber: {
    type: String,
    default: '',
    trim: true,
  },
  description: {
    type: String,
    default: '',
    maxlength: 2000,
  },
  coverImage: {
    type: String,
    default: '',
  },
  publishedDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  borrowedCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

bookSchema.index({ title: 'text', description: 'text' });
bookSchema.index({ genre: 1, language: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ availableCopies: 1 });

module.exports = mongoose.model('Book', bookSchema);
