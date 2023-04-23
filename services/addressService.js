const asyncHandler = require('express-async-handler');

// const ApiError = require('../utils/ApiError');
const User = require('../models/userModel');

// @desc    Add address to user addresses list
// @route   POST /api/v1/addresses
// @access  Protected/User
exports.addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    // l'element de la rehcerche
    req.user._id,
    {
      // $addToSet => add address object to user addresses array if address not exist
      // addresses exist in userModel
      $addToSet: { addresses: req.body }
    },
    // @desc : renvoyer le document mis à jour plutôt que le document d'origine
    { new: true }
  );
  res
    .status(200)
    .json({
      status: "success",
      message: "Address added successfully.",
      data: user.addresses
    })
});

// @desc    Remove address from user addresses list
// @route   DELETE /api/v1/addresses/:addressId
// @access  Protected/User
exports.removeAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    // l'element de la rehcerche
    req.user._id,
    {
      // $pull => remove address object from user addresses array if addressId exist
      $pull: { addresses: { _id: req.params.addressId } }
    },
    // @desc : renvoyer le document mis à jour plutôt que le document d'origine
    { new: true }
  );
  res
    .status(200)
    .json({
      status: "success",
      message: "Address removed successfully.",
      data: user.addresses
    })
});

// @desc    Get logged user addresses list
// @route   GET /api/v1/addresses
// @access  Protected/User
exports.getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('addresses')

  res.status(200).json({
    status: "success",
    results: user.addresses.length,
    data: user.addresses
  })
})
