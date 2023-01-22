const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const ApiError = require('../utils/ApiError');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');
const createToken = require('../utils/createToken');

// const { token } = require('morgan');


// @desc Signup
// @route GET /api/v1/auth/signup
// @desc Public
exports.signup = asyncHandler(async (req, res, next) => {
  // 1 - Create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });

  // 2 - Generate token
  // const token = jwt.sign(
  //   { userId: user._id },
  //   process.env.JWT_SECRET_KEY,
  //   { expiresIn: process.env.JWT_EXPIRE_TIME }
  // );

  const token = createToken(user._id);

  res.status(201).send({ data: user, token });
});

// @desc Login
// @route GET /api/v1/auth/login
// @desc Public
exports.login = asyncHandler(async (req, res, next) => {
  // 1) check if password and email in the body (validation)
  // 2) check if user & check if password is correct
  const user = await User.findOne({ email: req.body.email })

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError('Incorrect email or password', 401))
  }
  // 3) generate token
  const token = createToken(user._id)

  // 4) send response to client side
  res.status(200).json({ data: user, token })
})

// this code for make sure the uesr is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exist, if exist get 
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log(token)
  }
  if (!token) {
    return next(new ApiError('You are not login to get access this route', 401))
  }

  // 2) Verify token (no change happens, expired token)
  // show documentation in Chat Gpt
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log(decoded);
  // {
  //   userId: '63b01abe045d7968998372db',
  //   iat: 1672485566,
  //   exp: 1680261566
  // }
  // 3) Check if user exists
  const currentUser = await User.findById(decoded.userId);
  // console.log(currentUser);
  if (!currentUser) {
    return next(
      new ApiError('The user that belong to this token does no longer exist', 401)
    );
  }

  // 4) Check if user change his password after token creted
  if (currentUser.passwordChangedAt) {
    // console.log(currentUser.passwordChangedAt, decoded.iat); // result 2022-12-31T12:08:32.329Z 1672485566
    // const passChangedTimestamp = currentUser.passwordChangedAt.getTime();
    const passChangedTimestamp = parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10);
    // console.log(passChangedTimestamp, decoded.iat); // result 1672488512 1672485566
    // Check if Password changed after token created (Error)
    if (passChangedTimestamp > decoded.iat) {
      return next(new ApiError('User recently changed password. Please login again..', 401));
    }
  }

  req.user = currentUser;
  next();
})

// @desc Authorisation (User Permissions)
// ["admin", "manager"]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError('You are not allowed to access this route', 403)
      )
    }
    next();
  })

// @desc Forgot password
// @route POST /api/v1/auth/forgotPassword
// @desc Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with that email ${req.body.email}`, 404)
    );
  }
  // 2) If user exist, Generate hash reset random 6 digits and is in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');

  // Save hashed pasword reset code into db
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code (10 min)
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  // le code envoyer n'est pas encore verifier par l'utilisateur
  user.passwordResetVerified = false;
  // save the data into database
  await user.save()

  // 3) Send the reset code via email
  const message = `Hi ${user.name}, \n 
  We recieved a request to reset the passord on your E-shop Account.\n ${resetCode}`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset code (valid for 10 minutes)',
      message: message
    })
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new ApiError("There is an error in sending email", 500));
  }

  res.status(200).json({ status: 'Succes', message: 'Reset code successfully sent' });

});

// @desc Verify password reset code
// @route POST /api/v1/auth/verifyResetCode
// @desc Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(req.body.resetCode)
    .digest('hex')

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() }
  });
  if (!user) {
    return next(new ApiError('Reset code invalid or expired'));
  }
  // 2) If reset Code is valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({ status: 'Succes'})

});

// @desc Reset password
// @route POST /api/v1/auth/resetPassword
// @desc Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if(!user) {
    return next(new ApiError(`There is no user with email ${req.body.email}`, 404))
  }

  // 2) Check if reset code verified
  if(!user.passwordResetVerified) {
    return next(new ApiError('Reset code note verified', 404));
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  user.save();

  // 3)if everything is ok, generate token
  const token = createToken(user._id);
  res.status(200).json({ token });
});