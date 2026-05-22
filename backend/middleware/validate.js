const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      error.details.forEach(detail => {
        errors.push({ field: detail.path.join('.'), message: detail.message });
      });
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    next();
  };
};

module.exports = validate;
