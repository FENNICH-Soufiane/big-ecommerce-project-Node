const multer = require('multer');
const ApiError = require('../utils/ApiError');

const multerOptions = () => {
  // 1 - DiskStorage engine it use when we not use image processing
  // const multerStorage = multer.diskStorage({
  //   // fun (req, res, next) {
  //   //   console.log(req.file)
  //   //   next();
  //   // },
  //   destination: function (req, file, cb) {
  //     cb(null, 'upload/categories')
  //   },
  //   filename: function (req, file, cb) {
  //     // @desc prototype of file name => category-${id}-Date.nonw().jpeg
  //     const ext = file.mimetype.split('/')[1];//mime existe in req.file <mimetipe='image/jpeg'>
  //     const filename = `category-${uuidv4()}-${Date.now()}.${ext}`;
  //     cb(null, filename);
  //   }
  // })
  // __________________

  // 2 - Memory Storage engine 
  const multerStorage = multer.memoryStorage()

  // Indicate the conditions to respect
  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new ApiError('Only Images allowed', 400), false);
    }
  }

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
  return upload;
}

exports.uploadSingleImage = (fieldName) => 
  multerOptions().single(fieldName);


exports.uploadMixOfImages = (arrayOfFields) => 
  multerOptions().fields(arrayOfFields);

