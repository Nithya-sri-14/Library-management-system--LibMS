const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    index: true,
  },
  biography: {
    type: String,
    default: '',
    maxlength: 2000,
  },
  nationality: {
    type: String,
    default: '',
    trim: true,
  },
  birthDate: {
    type: Date,
  },
  profileImage: {
    type: String,
    default: '',
  },
  booksWritten: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

authorSchema.index({ name: 'text' });
authorSchema.index({ nationality: 1 });

module.exports = mongoose.model('Author', authorSchema);
