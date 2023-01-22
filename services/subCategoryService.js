const factory = require('./handlersFactory');
// @desc import the Model
const SubCategory = require('../models/subCategoryModel')


// @desc this function allows to create a subcategory without passing name of category
// @desc it use juste id of category passed in url
// @desc Nested route
exports.setCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
}

// @desc Create subCategorie
// @route POST /api/v1/subcategories
// @acess Private

exports.createSubCategory = factory.createOne(SubCategory)


// @desc <Nested route> on Get
// @definition je veux acceder à une route à travers une autre route
// GET /api/v1/categories/:categoryId/subcategories

// Code for nested route num (3)
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId }
  req.filterObj = filterObject; //                       from 👇🏻
  next();
}

// @desc getSubCategoies
// @route GET /api/v1/subcategories
// @acess Public

exports.getSubCategories = factory.getAll(SubCategory)

// @desc   Get specific subcategory by id
// @route  GET /api/v1/subcategories/:id
// acess Public

exports.getSubCategory = factory.updateOne(SubCategory)


// @desc Update specific subcategory
// @route PUT /api/v1/subcategories/:id
// @acess Private

exports.updateSubCategory = factory.updateOne(SubCategory)

// @desc Delete specific subcategory
// @route DELETE /api/v1/subcategories/:id
// @acess Private

exports.deleteSubCategory = factory.deleteOne(SubCategory)
