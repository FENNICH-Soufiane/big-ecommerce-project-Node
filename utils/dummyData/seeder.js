// @desc fs is The built-in Node. js file system module helps us store, access, and manage data on our operating system
const fs = require('fs');
require('colors');
// @desc dotenv allows us to read the .env file
const dotenv = require('dotenv');
const Product = require('../../models/productModel');
const dbConnection = require('../../config/database');

dotenv.config({ path: '../../config.env' });

// connect to DB
dbConnection();

// Read data
const products = JSON.parse(fs.readFileSync('./products.json'));


// Insert data into DB
const insertData = async () => {
  try {
    await Product.create(products);

    console.log('Data Inserted'.green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete data from DB
const destroyData = async () => {
  try {
    await Product.deleteMany();
    console.log('Data Destroyed'.red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// @desc for execute seeder.js => node seeder.js -i
// @desc argv[2] === node => [0], seeder.js => [1], -i or -d => [2]
if (process.argv[2] === '-i') { // -i => insert
  insertData();
} else if (process.argv[2] === '-d') { // -d => delete
  destroyData();
}