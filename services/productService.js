const sharp = require('sharp');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');

const { uploadMixOfImages } = require('../middlwares/uploadImageMiddleware')
const factory = require('./handlersFactory');

// @desc import the Model
const Product = require('../models/productModel');



exports.uploadProductImages = uploadMixOfImages([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 5 }
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  // console.log(req.files);<===
  // 1- Image processing for imageCover
  if (req.files.imageCover) {
    const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 2000)
      .toFormat('jpeg')
      .jpeg({ quality: 50 })
      .toFile(`upload/products/${imageCoverFileName}`);

    // Save image into our db
    req.body.imageCover = imageCoverFileName;
  }
  // 2- Image processing for images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 2000)
          .toFormat('jpeg')
          .jpeg({ quality: 50 })
          .toFile(`upload/products/${imageName}`);

        // Save image into our db
        req.body.images.push(imageName);

      })
    )

  }

  // Write name of images
  console.log(req.body.imageCover);
  console.log(req.body.images);

  next();
})


// @desc getProducts
// @route GET /api/v1/products
// @acess Public

exports.getProducts = factory.getAll(Product, 'Product')

// @desc   Get specific product by id
// @route  GET /api/v1/products/:id
// acess Public

exports.getProduct = factory.getOne(Product, "reviews")

// @desc Create categorie with express-async-handler method
// @route POST /api/v1/categories
// @acess Private

exports.createProduct = factory.createOne(Product)

// @desc Update specific product
// @route PUT /api/v1/products/:id
// @acess Private

exports.updateProduct = factory.updateOne(Product)

// @desc Delete specific product
// @route DELETE /api/v1/products/:id
// @acess Private

exports.deleteProduct = factory.deleteOne(Product)
