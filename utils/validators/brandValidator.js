// @desc step three create Validator

const { check, body } = require('express-validator');
const slugify = require('slugify');
const validatorMiddleware = require('../../middlwares/validatorMiddleware')

exports.getBrandValidator = [
  check('id').isMongoId().withMessage('Invalid brand id format'),
  validatorMiddleware
];

exports.createBrandValidator = [
  check('name')
  .notEmpty().withMessage('Brand required')
  .isLength({ min:3 }).withMessage('Brand must be at least 3 characters long')
  .isLength({ max:32}).withMessage('Brand must be at most 32 characters long')
  .custom((val, {req}) => {
    req.body.slug= slugify(val);
    return true;
  }),
  validatorMiddleware
];

exports.updateBrandValidator = [
  check('id').isMongoId().withMessage('Invalid brand id format'),
  body('name')
  .optional()
  .custom((val, {req}) => {
    req.body.slug= slugify(val);
    return true;
  }),
  validatorMiddleware
];

exports.deleteBrandValidator = [
  check('id').isMongoId().withMessage('Invalid brand id format'),
  validatorMiddleware
];