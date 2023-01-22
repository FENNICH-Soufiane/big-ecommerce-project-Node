// @desc step two create Service

const factory = require('./handlersFactory');
// @desc import the Model
const Review = require('../models/reviewModel')

// Nested Route
// GET /api/products/:productId/reviews
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId }
  req.filterObj = filterObject; 
  next();
}

// @desc get list of reviews
// @route GET /api/v1/reviews
// @acess Public

exports.getReviews = factory.getAll(Review)

// @desc   Get specific review by id
// @route  GET /api/v1/reviews/:id
// acess Public

exports.getReview = factory.getOne(Review)

// @desc Nested route (Post)
exports.setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
}
// @desc Create review 
// @route POST /api/v1/reviews
// @acess Private/Protect/User

exports.createReview = factory.createOne(Review)

// @desc Update specific review
// @route PUT /api/v1/reviews/:id
// @acess Private/Protect/User

exports.updateReview = factory.updateOne(Review)

// @desc Delete specific review
// @route DELETE /api/v1/reviews/:id
// @acess Private/Protect/User-Admin-Manager

exports.deleteReview = factory.deleteOne(Review)
