// @desc step one create Model _

// this file for data access

const mongoose = require('mongoose');

// 1_ create schema
const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Brand required'],
    unique: [true, 'Brand must be unique'],
    minlength: [3, 'Too short brand name'],
    maxlength: [32, 'Too long brand name']
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
{timestamps: true}
);

const setImageURL = (doc) => {
  // return image base url + image name
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageUrl;
  }
}

// this is a midlleware return imageURL after initialisation
// it work in faindAll, findById and  update
brandSchema.post('init', (doc) => {
  setImageURL(doc);
});

brandSchema.post('save', (doc) => {
  setImageURL(doc);
});

// 2_create model
module.exports = mongoose.model('Brand', brandSchema);
