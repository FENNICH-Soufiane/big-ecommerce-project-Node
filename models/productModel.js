const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'Too short product title'],
      maxlength: [100, 'Too long product title']
    },
    slug: {
      type: String,
      required: true,
      lowecase: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      minlength: [20, 'Too short product description']
    },
    quantity: {
      type: Number,
      required: [true, 'Product quantity is required']
    },
    sold: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      trim: true,
      max: [200000, 'Too long product price']
    },
    priceAfterDiscount: {
      type: Number
    },
    colors: [String],

    imageCover: {
      type: String,
      required: [true, 'Product Image cover is required']
    },
    images: [String],
    // @desc a product must at least belong to a category
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Product must be belong to category']
    },
    // @desc subcategory is not required
    subcategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'SubCategory',
      }
    ],
    // @desc brand is not required
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: 'Brand',
    },
    ratingsAverage: {
      type: Number,
      min: [1, 'Rating must be above or equal 1.0'],
      max: [5, 'Rating must be below or equal 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
    // Code to enable virtual populate
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  }
);

// Ce code pour afficher les reviews dans le product
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

// Mongoose query middleware
productSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'category',
    select: 'name -_id' // pour enlever l'ID en met -_id
  });
  next();
});

const setImageURL = (doc) => {
  // return image base url + image name
  if (doc.imageCover) {
    const imageUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }
  if (doc.images) {
    const imagesList = [];
    doc.images.forEach((image) => {
      const imageUrl = `${process.env.BASE_URL}/products/${image}`;
      imagesList.push(imageUrl);
    })
    doc.images = imagesList;
  }
}

// this is a midlleware return imageURL after initialisation
// it work in faindAll, findById and  update
productSchema.post('init', (doc) => {
  setImageURL(doc);
});

productSchema.post('save', (doc) => {
  setImageURL(doc);
});

module.exports = mongoose.model('Product', productSchema)