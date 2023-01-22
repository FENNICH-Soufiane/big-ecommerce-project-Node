const mongoose = require('mongoose');

const subCategoryModel = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, 'Subctegory must be unique'],
      minlenght: [2, 'To short Subctegory name'],
      maxlenght: [32, 'To long Subctegory name']
    },
    slug: {
      type: String,
      lowarecase: true
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: 'Category',
      required: [true, 'SubCategory must be belong to parent category']
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('SubCategory', subCategoryModel)