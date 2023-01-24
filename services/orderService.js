// require('dotenv').config();
// const stripe = require('stripe')(`${process.env.STRIPE_SECRET}`);
const stripe = require('stripe')('sk_test_51MSL7PED3aRlvCwcvUShHiTWVtKZbBm3dneyxIek7Bi99v30R1XFAn0llHKiGux7hB95fswc6LMPBfcqmkysaKkY00Jpl3W8FY');
const asyncHandler = require('express-async-handler');

const ApiError = require('../utils/ApiError');
const factory = require('./handlersFactory')

// const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');


// @desc    create cash order
// @route   POST /api/v1/orders/:cardId
// @access  Protect/User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // app setings
  const taxPrice = 0;
  const shippingPrice = 0;
  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new ApiError(`There is no such cart with id ${req.params.cartId}`));
  }
  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  // 3) Create order with default paymentMethodType 'cash' 
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice
  });
  // 4) After creating order, decrement product quantity, increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } }
      }
    }));
    await Product.bulkWrite(bulkOption, {})

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(req.params.cartId);
  }

  res.status(201).json({ status: 'success', data: order })
});

// midlleware for specify user logged
exports.filterOrderForLoggedUser = asyncHandler((req, res, next) => {
  if (req.user.role === 'user') req.filterObj = { user: req.user._id };
  next();
})

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Protect/User-Admin-Manager
exports.findAllOrders = factory.getAll(Order);

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Protect/User-Admin-Manager
exports.findSpecificOrder = factory.getOne(Order);

// @desc    Update order paid status to paid
// @route   PUT /api/v1/orders/:id/pay
// @access  Protect/Admin-Manager
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ApiError(`There is no such a order with this id: ${req.params.id}`, 404));
  }

  // update order to paid
  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: 'success', data: updatedOrder });
});

// @desc    Update order delivred status
// @route   PUT /api/v1/orders/:id/delivred
// @access  Protect/Admin-Manager
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ApiError(`There is no such a order with this id: ${req.params.id}`, 404));
  }

  // update order to deliverd
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: 'success', data: updatedOrder });
});

// @desc    Get checkout session from stripe and send it as a response
// @route   PUT /api/v1/orders/checkout-session/:cartId
// @access  Protect/User
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // app setings
  const taxPrice = 0;
  const shippingPrice = 0;
  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new ApiError(`There is no such cart with id ${req.params.cartId}`));
  }
  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({

    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: totalOrderPrice * 100,//je pense que *100 car price etait en decimal example 0.99 en multiplie par 100 pour que le prix soit 99
        product_data: {
          name: req.user.name,
          // description: 'Comfortable cotton t-shirt',
          // images: ['https://example.com/t-shirt.png'],
        },
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/orders`,
    cancel_url: `${req.protocol}://${req.get('host')}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });


  // 4) send session to response
  res.status(200).json({ status: 'success', session })
});

createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
}

// code for add functionality of stripe payment
// https://dashboard.stripe.com/test/webhooks/create?events=checkout.session.completed
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if(event.type === 'checkout.session.completed') {
    // Create order
    createCardOrder(event.data.object);
  }
});