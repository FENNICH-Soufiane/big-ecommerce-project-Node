const express = require('express');

const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator
} = require('../utils/validators/categoryValidator');

const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeImage
} = require('../services/categoryService');

const authService = require('../services/authService');

// desc for nested route
const subcategoriesRoute = require('./subCategoryRoute')

const router = express.Router();

// desc num (1)
// desc cette route concerne <nested route>
// desc si on a une route comme '/:categoryId/subcategories' revoie moi à subcategoriesRoute
router.use('/:categoryId/subcategories', subcategoriesRoute)

// Routes
router.route('/')
  .get(getCategories)
  .post(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    uploadCategoryImage,
    resizeImage,
    createCategoryValidator,
    createCategory
  )
router.route('/:id')
  .get(getCategoryValidator, getCategory)
  .put(authService.protect,
    authService.allowedTo('admin', 'manager'),
    uploadCategoryImage,
    resizeImage,
    updateCategoryValidator,
    updateCategory)
  .delete(
    authService.protect,
    authService.allowedTo('admin'),
    deleteCategoryValidator,
    deleteCategory
  )

module.exports = router;