// this file for data access

const mongoose = require('mongoose');

// 1_ create schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category required'],
    unique: [true, 'Category must be unique'],
    minlength: [3, 'Too short category name'],
    maxlength: [32, 'Too long category name']
  },
  // A and B => shoping.com/a-and-b
  slug: {
    type: String,
    lowercase: true
  },
  image: String,
},
  // mongoose Schema Options
  // timestamp create in the database update at and create at
  { timestamps: true }
);

const setImageURL = (doc) => {
  // return image base url + image name
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageUrl;
  }
}

// this is a midlleware return imageURL after initialisation
// it work in faindAll, findById and  update
categorySchema.post('init', (doc) => {
  setImageURL(doc);
});

categorySchema.post('save', (doc) => {
  setImageURL(doc);
});

// 2_create model
const CategoryModel = mongoose.model('Category', categorySchema);

module.exports = CategoryModel;