const sharp = require('sharp');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const factory = require('./handlersFactory');

const { uploadSingleImage } = require('../middlwares/uploadImageMiddleware')
// @desc import the Model
const Category = require('../models/categoryModel')



// Upload single image
exports.uploadCategoryImage = uploadSingleImage('image');

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  // console.log(req.file) // => req.file.buffer
  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(640, 360)
      .toFormat('jpeg')
      .jpeg({ quality: 50 })
      .toFile(`upload/categories/${filename}`);

    // Save image into our db
    req.body.image = filename;
    // req.body.image = req.hostname + filename;
  }
  next();
});

// @desc getCategoies
// @route GET /api/v1/categories
// @acess Public

exports.getCategories = factory.getAll(Category)

// @desc   Get specific category by id
// @route  GET /api/v1/categories/:id
// acess Public

exports.getCategory = factory.getOne(Category)

// @desc Create categorie with express-async-handler method
// @route POST /api/v1/categories
// @acess Private/Amdin - Manager

exports.createCategory = factory.createOne(Category)

// @desc Update specific category
// @route PUT /api/v1/categories/:id
// @acess Private/Amdin - Manager

exports.updateCategory = factory.updateOne(Category)

// @desc Delete specific category
// @route DELETE /api/v1/categories/:id
// @acess Private/Amdin

exports.deleteCategory = factory.deleteOne(Category)

