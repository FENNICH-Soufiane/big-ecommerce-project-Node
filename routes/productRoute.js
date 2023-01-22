const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeProductImages
} = require('../services/productService');
const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator
} = require('../utils/validators/productValidator');

const reviewRoute = require('./reviewRoute');
const authService = require('../services/authService');

const router = express.Router();

// Route for ested route
// POST /products/:productId/reviews
// GET /products/:productId/reviews
// GET /products/:productId/reviews/:reviewsId =>  get specific reviews for specific product
router.use('/:productId/reviews', reviewRoute);

// Routes
router.route('/')
  .get(getProducts)
  .post(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    uploadProductImages,
    resizeProductImages,
    createProductValidator,
    createProduct
  )
router.route('/:id')
  .get(getProductValidator, getProduct)
  .put(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    uploadProductImages,
    resizeProductImages,
    updateProductValidator,
    updateProduct
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin'),
    deleteProductValidator,
    deleteProduct
  )

module.exports = router;

