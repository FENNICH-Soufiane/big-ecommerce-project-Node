// @desc step two create Service
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');

const ApiError = require('../utils/ApiError');
const factory = require('./handlersFactory');
const { uploadSingleImage } = require('../middlwares/uploadImageMiddleware')
const User = require('../models/userModel');
const createToken = require('../utils/createToken');

// Upload single image
exports.uploadUserImage = uploadSingleImage('profileImg');

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  // console.log(req.file) // => req.file.buffer
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;// Date.now() => timestamp 
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(640, 360)
      .toFormat('jpeg')
      .jpeg({ quality: 50 })
      .toFile(`upload/users/${filename}`);

    // Save image into our db
    req.body.profileImg = filename;
    // console.log(req.file) // => req.file.buffer
  }
  next();
});


// @desc getUsers
// @route GET /api/v1/users
// @acess Private:Admin

exports.getUsers = factory.getAll(User)

// @desc   Get specific user by id
// @route  GET /api/v1/users/:id
// acess Private/Admin

exports.getUser = factory.getOne(User)

// @desc Create user with express-async-handler method
// @route POST /api/v1/users
// @acess Private/Admin

exports.createUser = factory.createOne(User)

// @desc Update specific user
// @route PUT /api/v1/users/:id
// @acess Private/Admin

// exports.updateUser = factory.updateOne(User)
exports.updateUser = asyncHandler(async (req, res, next) => {

  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      profileImg: req.body.profileImg,
      role: req.body.role
    },
    { new: true }
  );

  if (!document) {
    // res.status(404).json({ msg: `No brand for this id ${id}` })
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @desc Update password of user
// @route PUT /api/v1/users/:id
// @acess Private

exports.changeUserPassword = asyncHandler(async (req, res, next) => {

  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );

  if (!document) {
    // res.status(404).json({ msg: `No brand for this id ${id}` })
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @desc Delete specific user
// @route DELETE /api/v1/users/:id
// @acess Private/Amdin

exports.deleteUser = factory.deleteOne(User)

// @desc Get Logged user data
// @route GET /api/v1/users/getMe
// @acess Private/Protect + acces depuis l'utilisateur connecter

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

//  separer la modification du mot de passe de modification des coordonnées

// @desc Update Logged user 
// @route PUT /api/v1/users/changeMyPassword
// @acess Private/Protect + acces depuis l'utilisateur (user) connecter

exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1) Update user password based user payload (req.user._id)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now()
    },
    {
      new: true
    }
  );

  // 2) Generate token
  const token = createToken(user._id);

  res.status(200).json({ data: user, token });
});

// @desc Update Logged user data (without password and roles)
// @route PUT /api/v1/users/updateMe
// @acess Private/Protect + acces depuis l'utilisateur (user) connecter

exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updateUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone
    },
    { new: true }
  );
  res.status(200).json({ data: updateUser });
});

// @desc Deactivate logged user 
// @route DELETE /api/v1/users/deleteMe
// @acess Private/Protect

exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { active: false },
  );
  res.status(204).json({ success: "Success" });
});