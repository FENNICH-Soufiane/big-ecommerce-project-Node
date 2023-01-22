const { check, body } = require('express-validator');
const slugify = require('slugify');
const validatorMiddleware = require('../../middlwares/validatorMiddleware')

exports.getCategoryValidator = [
  check('id')
    .isMongoId().withMessage('Invalid category id format'),
  validatorMiddleware
];

exports.createCategoryValidator = [
  check('name')
    .notEmpty().withMessage('Category required')
    .isLength({ min: 3 }).withMessage('Category must be at least 3 characters long')
    .isLength({ max: 32 }).withMessage('Category must be at most 32 characters long')
    .custom((val, {req}) => {
      req.body.slug= slugify(val);
      return true;
    }),
  validatorMiddleware
];

exports.updateCategoryValidator = [
  check('id')
    .isMongoId().withMessage('Invalid category id format'),
    body('name').optional().custom((val, {req}) => {
      req.body.slug= slugify(val);
      return true;
    }),
  validatorMiddleware
];

exports.deleteCategoryValidator = [
  check('id')
    .isMongoId().withMessage('Invalid category id format'),
  validatorMiddleware
];