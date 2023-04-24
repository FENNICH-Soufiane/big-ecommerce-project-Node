const express = require('express');

const authService = require('../services/authService');

const {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
  getAddress
} = require('../services/addressService');
// const { createWishlistValidator } = require('../utils/validators/wishlistValidator');

const router = express.Router();

router.use(authService.protect,
  authService.allowedTo('user'),)

router.route('/')
  .post(addAddress)
  .get(getLoggedUserAddresses);
router.delete('/:addressId', removeAddress)
router.get('/:addressId', getAddress)

module.exports = router;