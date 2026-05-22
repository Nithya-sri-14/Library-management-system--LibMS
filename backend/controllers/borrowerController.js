const Borrower = require('../models/Borrower');
const Transaction = require('../models/Transaction');
const { paginate } = require('../utils/helpers');

exports.getBorrowers = async (req, res, next) => {
  try {
    const { skip, limit, page } = paginate(req.query.page, req.query.limit);
    const filter = { isActive: true };

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.membershipType) filter.membershipType = req.query.membershipType;
    if (req.query.status === 'active') filter.isActive = true;
    if (req.query.status === 'inactive') filter.isActive = false;

    const [borrowers, total] = await Promise.all([
      Borrower.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Borrower.countDocuments(filter),
    ]);

    res.json({
      success: true,
      borrowers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getBorrower = async (req, res, next) => {
  try {
    const borrower = await Borrower.findById(req.params.id).lean();
    if (!borrower) return res.status(404).json({ message: 'Borrower not found' });
    const transactions = await Transaction.find({ borrower: borrower._id })
      .populate({ path: 'book', select: 'title isbn' })
      .sort('-createdAt')
      .limit(20)
      .lean();
    res.json({ success: true, borrower, transactions });
  } catch (error) {
    next(error);
  }
};

exports.createBorrower = async (req, res, next) => {
  try {
    const borrower = await Borrower.create({
      ...req.body,
      profileImage: req.file ? `/uploads/${req.file.filename}` : '',
    });
    res.status(201).json({ success: true, borrower });
  } catch (error) {
    next(error);
  }
};

exports.updateBorrower = async (req, res, next) => {
  try {
    const borrower = await Borrower.findByIdAndUpdate(
      req.params.id,
      { ...req.body, ...(req.file && { profileImage: `/uploads/${req.file.filename}` }) },
      { new: true, runValidators: true }
    );
    if (!borrower) return res.status(404).json({ message: 'Borrower not found' });
    res.json({ success: true, borrower });
  } catch (error) {
    next(error);
  }
};

exports.deleteBorrower = async (req, res, next) => {
  try {
    const borrower = await Borrower.findById(req.params.id);
    if (!borrower) return res.status(404).json({ message: 'Borrower not found' });
    const activeBorrows = await Transaction.countDocuments({ borrower: borrower._id, status: 'issued' });
    if (activeBorrows > 0) {
      return res.status(400).json({ message: 'Cannot delete borrower with active borrows' });
    }
    borrower.isActive = false;
    await borrower.save();
    res.json({ success: true, message: 'Borrower deleted' });
  } catch (error) {
    next(error);
  }
};
