const asyncHandler = require('express-async-handler');

const ApiError = require('../utils/ApiError');
const Product = require('../models/productModel');
const Coupon = require('../models/couponModel');
const Cart = require('../models/cartModel');

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice.toFixed(2);
  cart.totalPriceAfterDiscount = undefined;

  return totalPrice;
}

// @desc    Add product to cart
// @route   POST /api/v1/cart
// @access  Private/User
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;
  const product = await Product.findById(productId);
  // 1) Get Cart for logged user
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // create cart for logged user with product
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [{ product: productId, color, price: product.price }]
    });

  }
  else {
    // if product exist in cart, update product quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );
    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;

      cart.cartItems[productIndex] = cartItem;
    }
    else {
      // if product not exist in cart(bascket), push product to cartItems array
      cart.cartItems.push({ product: productId, color, price: product.price })
    }
  }

  // Calculate total cart price
  calcTotalCartPrice(cart);


  await cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    message: "Product added to cart successfully",
    data: cart
  })
});

// ---------------------------------------------------------------------------

// @desc    Get logged user cart
// @route   GET /api/v1/cart
// @access  Private/User
// exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
//   // appeler le cart de l'utilisateur inscrit
//   const cart = await Cart.findOne({ user: req.user._id });
//   // si il n'y a pas de cart en return une erreur
//   if (!cart) {
//     return next(
//       new ApiError(`There is no cart for this user id: ${req.user._id}`, 404)
//     );
//   }

//   res.status(200).json({ status: "success", numOfCartItems: cart.cartItems.length, data: cart })
// })

// ---------------------------------------------------------------------------
// @desc      Get logged user cart
// @route     GET /api/v1/cart
// @access    Private/User
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ cartOwner: req.user._id })
    .populate({
      path: 'products',
      select: 'title imageCover ratingsAverage brand category ',
      populate: { path: 'brand', select: 'name -_id', model: 'Brand' },
    })
    .populate({
      path: 'products',
      select: 'title imageCover ratingsAverage brand category',
      populate: { path: 'category', select: 'name -_id', model: 'Category' },
    });

  if (!cart) {
    return next(
      new ApiError(`No cart exist for this user: ${req.user._id}`, 404)
    );
  }
  return res.status(200).json({
    status: 'success',
    numOfCartItems: cart.products.length,
    data: cart,
  });
});

// @desc    Remove specific cart item (on la defnir comme update cart or delete cart)
// @route   DELETE /api/v1/cart/:itemId
// @access  Private/User
exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } }
    },
    { new: true });
  calcTotalCartPrice(cart);
  cart.save();
  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart
  })
});

// @desc    clear logged user cart
// @route   DELETE /api/v1/cart
// @access  Private/User
exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });

  res.status(204).send();
});

// @desc    Update specific cart item quantity
// @route   PUT /api/v1/cart/:itemId
// @access  Private/User
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new Error(`there is no cart for user ${req.user._id}`, 404));
  }
  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  }
  else {
    return next(
      new Error(`there is no item for this id : ${req.params.itemId}`, 404)
    );
  }

  calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart
  })
});

// @desc    Apply coupon on cart
// @route   PUT /api/v1/cart/applyCoupon
// @access  Private/User
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  // 1) Get coupon based on coupon name
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() }
  })
  if (!coupon) {
    return next(new ApiError(`Coupon is invalid or expired`));
  }

  // 2) Get logged user cart to get total cart price
  const cart = await Cart.findOne({ user: req.user._id });

  const totalPrice = cart.totalCartPrice; // égale à => const totalPrice = calcTotalCartPrice(cart);

  // 3) Calculate price after discount
  const totalPriceAfterDiscount =
    (totalPrice - (totalPrice * coupon.discount) / 100).toFixed(2);

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;

  await cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart
  })
});
