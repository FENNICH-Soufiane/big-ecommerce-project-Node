const { body, check } = require('express-validator');
const slugify = require('slugify');
const validatorMiddleware = require('../../middlwares/validatorMiddleware');
// import category model for check if category is exists
const Category = require('../../models/categoryModel')
const SubCategory = require('../../models/subCategoryModel')

exports.createProductValidator = [
  check('title')
    .isLength({ min: 3 }).withMessage('must be least 3 chars')
    .notEmpty().withMessage('Product required')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('description')
    .notEmpty().withMessage('Product description required')
    .isLength({ max: 2000 }).withMessage('Too long description'),
  check('quantity')
    .notEmpty().withMessage('Product quantity is required')
    .isNumeric().withMessage('Product quantity must be a number'),
  check('sold')
    .optional()
    .isNumeric().withMessage('Product quantity must be a number'),
  check('price')
    .notEmpty().withMessage('Product price is required')
    .isNumeric().withMessage('Product price must be a number')
    .isLength({ max: 32 }).withMessage('Too long price'),
  check('priceAfterDiscount')
    .optional()
    .isNumeric().withMessage('Product price After discount must be a numerique')
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error('priceAfterDiscount must be lower than price')
      }
      return true;
    }),
  check('colors')
    .optional()
    .isArray().withMessage('availableColors should be array of string'),
  check('imageCover')
    .notEmpty().withMessage('Product imageCover is required'),
  check('images')
    .optional()
    .isArray().withMessage('images should be array of string'),
  check('category')
    .notEmpty().withMessage('Product must be belong to a category')
    .isMongoId().withMessage('Invalid ID formate')
    // this custom check if category id belongs to category
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No category for this id ${categoryId}`)
          );
        }
      })
    )
  ,
  check('subcategories')
    .optional()
    .isMongoId().withMessage('Invalid ID formate')
    // ce custom verifie si les (le) subcategory id envoyer exist deja dans la base de données
    .custom((subcategoriesIds) =>
      SubCategory.find({ _id: { $exists: true, $in: subcategoriesIds } })
        .then((result) => {
          // check if length of result equal length of subcategoriesIds
          if (result.length < 1 || result.length !== subcategoriesIds.length) {
            return Promise.reject(
              new Error('Invalid subcategoriesIds')
            );
          }
        })
    )
    // @desc ce custom verifie si les (le) subcategory id envoyer appartient vraiment à une categorie
    // envoyer les subcategories qui appartient au { category: req.body.category }
    .custom((val, { req }) =>
      SubCategory.find({ category: req.body.category })
        .then((subcategories) => {
          // renvoyer les subcategory de { category: req.body.category }
          const subCategoriesIdsInDB = [];
          subcategories.forEach((subcategory) => {
            subCategoriesIdsInDB.push(subcategory._id.toString());
          });
          // @desc val sont les ids reçu du subcategory reçu du body
          // const checker = val.every((v) => subCategoriesIdsInDB.includes(v)); 👇🏻// send true if subcategoriesIds exist in the same category

          if (!val.every((v) => subCategoriesIdsInDB.includes(v))) {//            👈🏻
            return Promise.reject(new Error('subcategories not belong to category'));
          }

          // ces deux bloc de code sont égaux ☝🏻👇🏻

          // const checker = (target, arr) =>  target.every((v) => arr.includes(v));
          // if(!checker(val, subCategoriesIdsInDB)) {
          //   return Promise.reject(new Error('subcategories not belong to category'));
          // }
        })
    )
  ,
  check('brand')
    .optional().isMongoId().withMessage('Invalid ID formate'),
  check('ratingsAverage')
    .optional()
    .isNumeric().withMessage('ratingAverage must be a number')
    .isLength({ min: 1 }).withMessage('Rating must be above or equal 1.0')
    .isLength({ max: 5 }).withMessage('Rating must be below or equal 5.0'),
  check('ratingsQuantity')
    .optional()
    .isNumeric().withMessage('ratingQuantity must be a number'),

  validatorMiddleware
];

exports.getProductValidator = [
  check('id').isMongoId().withMessage('Product id is required'),
  validatorMiddleware
];

exports.updateProductValidator = [
  check('id').isMongoId().withMessage('Product id is required'),
  body('title')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware
];

exports.deleteProductValidator = [
  check('id').isMongoId().withMessage('Product id is required'),
  validatorMiddleware
];