// @desc step foor create Route

const express = require('express');
const {
  addProductToCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  clearCart,
  updateCartItemQuantity,
  applyCoupon
} = require('../services/cartService');

const authService = require('../services/authService');

const router = express.Router();

router.use(authService.protect, authService.allowedTo('user'))

// Routes
router.route('/')
  .post(addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearCart)
  
  router.put('/applyCoupon', applyCoupon);
router.route('/:itemId')
  .delete(removeSpecificCartItem)
  .put(updateCartItemQuantity)


module.exports = router;