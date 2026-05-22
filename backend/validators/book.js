const Joi = require('joi');

const bookSchema = Joi.object({
  title: Joi.string().min(1).max(500).required(),
  isbn: Joi.string().min(10).max(20).required(),
  author: Joi.string().required(),
  publisher: Joi.string().max(200).allow('', null),
  genre: Joi.string().required(),
  language: Joi.string().default('English'),
  edition: Joi.string().allow('', null),
  totalCopies: Joi.number().integer().min(0).required(),
  availableCopies: Joi.number().integer().min(0).required(),
  shelfNumber: Joi.string().allow('', null),
  description: Joi.string().max(2000).allow('', null),
  coverImage: Joi.string().allow('', null),
  publishedDate: Joi.date().allow(null),
});

module.exports = { bookSchema };
