const generateToken = (user) => {
  const jwt = require('jsonwebtoken');
  const config = require('../config');
  return jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

const paginate = (page = 1, limit = 20) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(100, Math.max(1, parseInt(limit)));
  return { skip: (p - 1) * l, limit: l, page: p };
};

const calculateFine = (dueDate, returnDate, dailyRate = 1) => {
  if (!returnDate) return 0;
  const due = new Date(dueDate);
  const returned = new Date(returnDate);
  const diffTime = returned - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays * dailyRate : 0;
};

const generateBarcode = async (data) => {
  try {
    const bwipjs = require('bwip-js');
    const buffer = await bwipjs.toBuffer({
      bcid: 'code128',
      text: data,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center',
    });
    return buffer.toString('base64');
  } catch {
    return null;
  }
};

module.exports = { generateToken, paginate, calculateFine, generateBarcode };
