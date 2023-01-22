const { check } = require('express-validator');
const validatorMiddleware = require('../../middlwares/validatorMiddleware')

exports.createWishlistValidator = [
  check('productId')
    .notEmpty().withMessage('Product must be belong exist')
    .isMongoId().withMessage('Invalid ID formate')
    ,

  validatorMiddleware
];