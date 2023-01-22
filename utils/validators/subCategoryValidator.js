const { body, check } = require('express-validator');
const { default: slugify } = require('slugify');
const validatorMiddleware = require('../../middlwares/validatorMiddleware')

exports.getSubCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid Subcategory id format'),
  validatorMiddleware
];

exports.createSubCategoryValidator = [
  check('name')
    .notEmpty().withMessage('SubCategory required')
    .isLength({ min: 2 }).withMessage('SubCategory must be at least 3 characters long')
    .isLength({ max: 32 }).withMessage('SubCategory must be at most 32 characters long')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('category')
    .notEmpty().withMessage('subCategory must be belong to category')
    .isMongoId().withMessage('Invalid Category id format'),
  
  validatorMiddleware
];

exports.updateSubCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid Subcategory id format'),
  body('name').custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),
  validatorMiddleware
];

exports.deleteSubCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid Subcategory id format'),
  validatorMiddleware
];