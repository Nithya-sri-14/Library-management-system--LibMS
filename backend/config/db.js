const mongoose = require('mongoose');
const User = require('../models/User');
const Author = require('../models/Author');
const Book = require('../models/Book');
const Borrower = require('../models/Borrower');
const Transaction = require('../models/Transaction');

const seedData = async () => {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log('Database already seeded, skipping');
    return;
  }
  console.log('Seeding database...');
  const admin = await User.create({ name: 'Admin User', email: 'admin@library.com', password: 'admin123', role: 'admin' });
  const librarian = await User.create({ name: 'Librarian One', email: 'librarian@library.com', password: 'lib123', role: 'librarian' });
  await User.create({ name: 'John Borrower', email: 'john@example.com', password: 'borrow123', role: 'borrower' });

  const authors = await Author.insertMany([
    { name: 'J.K. Rowling', biography: 'British author, best known for the Harry Potter series.', nationality: 'British', birthDate: new Date('1965-07-31'), booksWritten: 7 },
    { name: 'George R.R. Martin', biography: 'American novelist and short story writer.', nationality: 'American', birthDate: new Date('1948-09-20'), booksWritten: 5 },
    { name: 'Harper Lee', biography: 'American novelist known for To Kill a Mockingbird.', nationality: 'American', birthDate: new Date('1926-04-28'), booksWritten: 2 },
    { name: 'Stephen King', biography: 'American author of horror, supernatural fiction, and fantasy.', nationality: 'American', birthDate: new Date('1947-09-21'), booksWritten: 63 },
    { name: 'Jane Austen', biography: 'English novelist known for romance novels.', nationality: 'British', birthDate: new Date('1775-12-16'), booksWritten: 6 },
  ]);

  const books = await Book.insertMany([
    { title: "Harry Potter and the Philosopher's Stone", isbn: '9780747532699', author: authors[0]._id, publisher: 'Bloomsbury', genre: 'Fantasy', language: 'English', totalCopies: 10, availableCopies: 8, shelfNumber: 'A-101', description: 'The first Harry Potter novel.', publishedDate: new Date('1997-06-26'), borrowedCount: 150 },
    { title: 'Harry Potter and the Chamber of Secrets', isbn: '9780747538486', author: authors[0]._id, publisher: 'Bloomsbury', genre: 'Fantasy', language: 'English', totalCopies: 8, availableCopies: 6, shelfNumber: 'A-102', description: 'The second Harry Potter novel.', publishedDate: new Date('1998-07-02'), borrowedCount: 120 },
    { title: 'A Game of Thrones', isbn: '9780553103540', author: authors[1]._id, publisher: 'Bantam Books', genre: 'Fantasy', language: 'English', totalCopies: 7, availableCopies: 4, shelfNumber: 'B-201', description: 'First book in A Song of Ice and Fire.', publishedDate: new Date('1996-08-01'), borrowedCount: 200 },
    { title: 'A Clash of Kings', isbn: '9780553103541', author: authors[1]._id, publisher: 'Bantam Books', genre: 'Fantasy', language: 'English', totalCopies: 5, availableCopies: 3, shelfNumber: 'B-202', description: 'Second book in A Song of Ice and Fire.', publishedDate: new Date('1998-11-16'), borrowedCount: 160 },
    { title: 'To Kill a Mockingbird', isbn: '9780061120084', author: authors[2]._id, publisher: 'J.B. Lippincott & Co.', genre: 'Fiction', language: 'English', totalCopies: 12, availableCopies: 10, shelfNumber: 'C-301', description: 'A novel about racial injustice.', publishedDate: new Date('1960-07-11'), borrowedCount: 300 },
    { title: 'Go Set a Watchman', isbn: '9780062409850', author: authors[2]._id, publisher: 'HarperCollins', genre: 'Fiction', language: 'English', totalCopies: 6, availableCopies: 5, shelfNumber: 'C-302', description: 'Sequel to To Kill a Mockingbird.', publishedDate: new Date('2015-07-14'), borrowedCount: 50 },
    { title: 'It', isbn: '9780450411434', author: authors[3]._id, publisher: 'Viking', genre: 'Horror', language: 'English', totalCopies: 8, availableCopies: 5, shelfNumber: 'D-401', description: 'A horror novel about an ancient evil.', publishedDate: new Date('1986-09-15'), borrowedCount: 180 },
    { title: 'The Shining', isbn: '9780385121675', author: authors[3]._id, publisher: 'Doubleday', genre: 'Horror', language: 'English', totalCopies: 6, availableCopies: 4, shelfNumber: 'D-402', description: 'A family heads to an isolated hotel.', publishedDate: new Date('1977-01-28'), borrowedCount: 140 },
    { title: 'Pride and Prejudice', isbn: '9780141439518', author: authors[4]._id, publisher: 'T. Egerton', genre: 'Romance', language: 'English', totalCopies: 15, availableCopies: 12, shelfNumber: 'E-501', description: 'A romantic novel of manners.', publishedDate: new Date('1813-01-28'), borrowedCount: 250 },
    { title: 'Sense and Sensibility', isbn: '9780141439662', author: authors[4]._id, publisher: 'T. Egerton', genre: 'Romance', language: 'English', totalCopies: 5, availableCopies: 4, shelfNumber: 'E-502', description: 'A novel about the Dashwood sisters.', publishedDate: new Date('1811-01-01'), borrowedCount: 80 },
  ]);

  const borrowers = await Borrower.insertMany([
    { name: 'Alice Johnson', email: 'alice@example.com', phone: '555-0101', address: '123 Elm St', membershipType: 'premium', borrowLimit: 6 },
    { name: 'Bob Smith', email: 'bob@example.com', phone: '555-0102', address: '456 Oak Ave', membershipType: 'basic', borrowLimit: 3 },
    { name: 'Charlie Brown', email: 'charlie@example.com', phone: '555-0103', address: '789 Pine Rd', membershipType: 'student', borrowLimit: 2 },
    { name: 'Diana Prince', email: 'diana@example.com', phone: '555-0104', address: '321 Maple Dr', membershipType: 'premium', borrowLimit: 6 },
    { name: 'Eve Wilson', email: 'eve@example.com', phone: '555-0105', address: '654 Cedar Ln', membershipType: 'basic', borrowLimit: 3 },
  ]);

  await Transaction.insertMany([
    { book: books[0]._id, borrower: borrowers[0]._id, issuedBy: admin._id, issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), status: 'issued' },
    { book: books[2]._id, borrower: borrowers[1]._id, issuedBy: librarian._id, issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), status: 'issued' },
    { book: books[4]._id, borrower: borrowers[2]._id, issuedBy: librarian._id, issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), returnDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), status: 'returned' },
    { book: books[6]._id, borrower: borrowers[3]._id, issuedBy: admin._id, issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), status: 'issued' },
    { book: books[8]._id, borrower: borrowers[4]._id, issuedBy: librarian._id, issueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: 'issued' },
  ]);
  console.log('Database seeded with demo data');
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/library-management');
    console.log(`MongoDB connected: ${conn.connection.host}`);
    await seedData();
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
