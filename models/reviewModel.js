const mongoose = require('mongoose');
const Product = require('./productModel')

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, 'Min ratings value is 1.0'],
      max: [5, 'Max ratings value is 5.0'],
      required: [true, 'review ratings required ']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to user']
    },
    // parent reference (one to many)
    // review is the parent
    // on utilise le parent car le nombre de review peut etre grand (tres grand)
    // le produit peut avoir plusieur review
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to product']
    }
  },
  { timestamps: true });

// ce middleware pour afficher le name de user lors de rechereche
reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name' }); // supprimer l'ID avec -_id
  next();
});

// @desc Code for avergae and quantity of ratings
reviewSchema.statics.calcAverageRatingsAndQuantity = async function (productId) {
  const result = await this.aggregate([
    // Stage 1 : get all reviews in specific product
    {
      $match: { product: productId },
    },
    // Stage 2 : Grouping reviews based on productID and calc avgRatings, ratingsQuantity
    {
      $group: {
        _id: 'product',
        avgRatings: { $avg: '$ratings' },
        ratingsQuantity: { $sum: 1 }
      }
    }
  ]);
  // console.log(result) 
  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId,
      {
        ratingsAverage: result[0].avgRatings,
        ratingsQuantity: result[0].ratingsQuantity
      }
    )
  } else {
    await Product.findByIdAndUpdate(productId,
      {
        ratingsAverage: result[0].avgRatings,
        ratingsQuantity: result[0].ratingsQuantity
      })
  }
};

// @desc ce code pour appliquer la methode calcAverageRatingsAndQuantity
reviewSchema.post('save', async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});

reviewSchema.post('remove', async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);