// @desc step two create Service
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

const factory = require('./handlersFactory');
const { uploadSingleImage } = require('../middlwares/uploadImageMiddleware')
// @desc import the Model
const Brand = require('../models/brandModel');

// Upload single image
exports.uploadBrandImage = uploadSingleImage('image');

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  // console.log(req.file) // => req.file.buffer
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;// Date.now() => timestamp 
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(640, 360)
      .toFormat('jpeg')
      .jpeg({ quality: 50 })
      .toFile(`upload/brands/${filename}`);

    // Save image into our db
    req.body.image = filename;
    // console.log(req.file) // => req.file.buffer
  }
  next();
});


// @desc getBrands
// @route GET /api/v1/brands
// @acess Public

exports.getBrands = factory.getAll(Brand)

// @desc   Get specific brand by id
// @route  GET /api/v1/brands/:id
// acess Public

exports.getBrand = factory.getOne(Brand)

// @desc Create brand with express-async-handler method
// @route POST /api/v1/brands
// @acess Private

exports.createBrand = factory.createOne(Brand)

// @desc Update specific brand
// @route PUT /api/v1/brands/:id
// @acess Private

exports.updateBrand = factory.updateOne(Brand)

// @desc Delete specific brand
// @route DELETE /api/v1/brands/:id
// @acess Private

exports.deleteBrand = factory.deleteOne(Brand)
