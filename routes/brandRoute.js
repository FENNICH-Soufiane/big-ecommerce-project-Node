// @desc step foor create Route

const express = require('express');
const {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  uploadBrandImage,
  resizeImage
} = require('../services/brandService');
const {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator
} = require('../utils/validators/brandValidator');

const authService = require('../services/authService');

const router = express.Router();

// for access to the file aploaded
//http://localhost:8000/brands/category-76fd2a05-da85-40c0-8b69-da21bbdc197c-1671892102271.jpeg

// Routes
router.route('/')
  .get(getBrands)
  .post(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    uploadBrandImage,
    resizeImage,
    createBrandValidator,
    createBrand
  )
router.route('/:id')
  .get(getBrandValidator, getBrand)
  .put(authService.protect,
    authService.allowedTo('admin', 'manager'),
    uploadBrandImage,
    resizeImage,
    updateBrandValidator,
    updateBrand
  )
  .delete(authService.protect,
    authService.allowedTo('admin'),
    deleteBrandValidator,
    deleteBrand
  )

module.exports = router;