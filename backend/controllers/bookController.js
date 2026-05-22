const Book = require('../models/Book');
const Author = require('../models/Author');
const ActivityLog = require('../models/ActivityLog');
const { paginate, generateBarcode } = require('../utils/helpers');
const fs = require('fs');
const path = require('path');

exports.getBooks = async (req, res, next) => {
  try {
    const { skip, limit, page } = paginate(req.query.page, req.query.limit);
    const filter = { isActive: true };

    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { isbn: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.genre) filter.genre = req.query.genre;
    if (req.query.language) filter.language = req.query.language;
    if (req.query.availability === 'available') filter.availableCopies = { $gt: 0 };
    if (req.query.availability === 'unavailable') filter.availableCopies = 0;
    if (req.query.author) filter.author = req.query.author;

    const [books, total] = await Promise.all([
      Book.find(filter)
        .populate('author', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Book.countDocuments(filter),
    ]);

    res.json({
      success: true,
      books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('author', 'name biography nationality').lean();
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ success: true, book });
  } catch (error) {
    next(error);
  }
};

exports.createBook = async (req, res, next) => {
  try {
    const author = await Author.findById(req.body.author).lean();
    if (!author) return res.status(404).json({ message: 'Author not found' });

    const book = await Book.create({ ...req.body, coverImage: req.file ? `/uploads/${req.file.filename}` : '' });

    await Author.findByIdAndUpdate(req.body.author, { $inc: { booksWritten: 1 } });

    await ActivityLog.create({
      user: req.user._id,
      action: 'create',
      resource: 'Book',
      resourceId: book._id,
      details: { title: book.title, isbn: book.isbn },
    });

    const populated = await book.populate('author', 'name');
    res.status(201).json({ success: true, book: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { ...req.body, ...(req.file && { coverImage: `/uploads/${req.file.filename}` }) },
      { new: true, runValidators: true }
    ).populate('author', 'name');
    if (!book) return res.status(404).json({ message: 'Book not found' });

    await ActivityLog.create({
      user: req.user._id,
      action: 'update',
      resource: 'Book',
      resourceId: book._id,
      details: { title: book.title },
    });

    res.json({ success: true, book });
  } catch (error) {
    next(error);
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    book.isActive = false;
    await book.save();

    if (book.author) {
      await Author.findByIdAndUpdate(book.author, { $inc: { booksWritten: -1 } });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'delete',
      resource: 'Book',
      resourceId: book._id,
      details: { title: book.title },
    });

    res.json({ success: true, message: 'Book deleted' });
  } catch (error) {
    next(error);
  }
};

exports.bulkImport = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'CSV file required' });
    const { parse } = require('csv-parse/sync');
    const csvData = fs.readFileSync(req.file.path, 'utf8');
    const records = parse(csvData, { columns: true, skip_empty_lines: true });
    let imported = 0;
    for (const record of records) {
      const author = await Author.findOne({ name: record.author });
      if (!author) continue;
      await Book.create({
        title: record.title,
        isbn: record.isbn,
        author: author._id,
        publisher: record.publisher,
        genre: record.genre,
        language: record.language || 'English',
        totalCopies: parseInt(record.totalCopies) || 1,
        availableCopies: parseInt(record.availableCopies) || 1,
        shelfNumber: record.shelfNumber,
        description: record.description,
      });
      imported++;
    }
    fs.unlinkSync(req.file.path);
    res.json({ success: true, message: `Imported ${imported} books` });
  } catch (error) {
    next(error);
  }
};

exports.exportBooks = async (req, res, next) => {
  try {
    const books = await Book.find({ isActive: true }).populate('author', 'name').lean();
    if (req.query.format === 'csv') {
      const { Parser } = require('json2csv');
      const fields = ['title', 'isbn', 'author.name', 'publisher', 'genre', 'language', 'totalCopies', 'availableCopies', 'shelfNumber'];
      const parser = new Parser({ fields });
      const csv = parser.parse(books.map(b => ({ ...b, 'author.name': b.author?.name })));
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=books.csv');
      return res.send(csv);
    }
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=books.pdf');
    doc.pipe(res);
    doc.fontSize(20).text('Books Report', { align: 'center' });
    doc.moveDown();
    books.forEach((book, i) => {
      doc.fontSize(12).text(`${i + 1}. ${book.title} by ${book.author?.name || 'Unknown'} (ISBN: ${book.isbn})`);
    });
    doc.end();
  } catch (error) {
    next(error);
  }
};

exports.getGenres = async (req, res, next) => {
  try {
    const genres = await Book.distinct('genre', { isActive: true });
    res.json({ success: true, genres });
  } catch (error) {
    next(error);
  }
};

exports.searchSuggestions = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query || query.length < 2) return res.json({ success: true, suggestions: [] });
    const books = await Book.find({
      isActive: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { isbn: { $regex: query, $options: 'i' } },
      ],
    })
      .select('title isbn')
      .limit(10)
      .lean();
    res.json({ success: true, suggestions: books });
  } catch (error) {
    next(error);
  }
};
