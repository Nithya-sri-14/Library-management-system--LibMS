const Author = require('../models/Author');
const Book = require('../models/Book');
const { paginate } = require('../utils/helpers');

exports.getAuthors = async (req, res, next) => {
  try {
    const { skip, limit, page } = paginate(req.query.page, req.query.limit);
    const filter = { isActive: true };

    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.nationality) filter.nationality = req.query.nationality;

    const sort = req.query.sort === 'books' ? { booksWritten: -1 } : { name: 1 };

    const [authors, total] = await Promise.all([
      Author.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Author.countDocuments(filter),
    ]);

    res.json({
      success: true,
      authors,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAuthor = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id).lean();
    if (!author) return res.status(404).json({ message: 'Author not found' });
    const books = await Book.find({ author: author._id, isActive: true }).select('title isbn genre publishedDate').lean();
    res.json({ success: true, author, books });
  } catch (error) {
    next(error);
  }
};

exports.createAuthor = async (req, res, next) => {
  try {
    const author = await Author.create({
      ...req.body,
      profileImage: req.file ? `/uploads/${req.file.filename}` : '',
    });
    res.status(201).json({ success: true, author });
  } catch (error) {
    next(error);
  }
};

exports.updateAuthor = async (req, res, next) => {
  try {
    const author = await Author.findByIdAndUpdate(
      req.params.id,
      { ...req.body, ...(req.file && { profileImage: `/uploads/${req.file.filename}` }) },
      { new: true, runValidators: true }
    );
    if (!author) return res.status(404).json({ message: 'Author not found' });
    res.json({ success: true, author });
  } catch (error) {
    next(error);
  }
};

exports.deleteAuthor = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).json({ message: 'Author not found' });
    const bookCount = await Book.countDocuments({ author: author._id, isActive: true });
    if (bookCount > 0) {
      return res.status(400).json({ message: `Cannot delete author with ${bookCount} active books. Remove books first.` });
    }
    author.isActive = false;
    await author.save();
    res.json({ success: true, message: 'Author deleted' });
  } catch (error) {
    next(error);
  }
};
