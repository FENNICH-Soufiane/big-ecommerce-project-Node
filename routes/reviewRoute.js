// @desc step foor create Route

const express = require('express');

const {
  getReviewValidator,
  createReviewValidator,
  updateReviewValidator,
  deleteBrandValidator
} = require('../utils/validators/reviewValidator');

const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  createFilterObj,
  setProductIdAndUserIdToBody
} = require('../services/reviewService');

const authService = require('../services/authService');

const router = express.Router({ mergeParams: true });

// for access to the file aploaded
//http://localhost:8000/brands/category-76fd2a05-da85-40c0-8b69-da21bbdc197c-1671892102271.jpeg

// Routes
router.route('/')
  .get(createFilterObj, getReviews)
  .post(
    authService.protect,
    authService.allowedTo('user'),
    setProductIdAndUserIdToBody,
    createReviewValidator,
    createReview
  )
router.route('/:id')
  .get(getReviewValidator, getReview)
  .put(
    authService.protect,
    authService.allowedTo('user'),
    updateReviewValidator,
    updateReview
  )
  .delete(
    authService.protect,
    authService.allowedTo('user', 'manager', 'admin'),
    deleteBrandValidator,
    deleteReview
  )

module.exports = router;