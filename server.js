// @desc step five call and mount the route

const path = require('path');

const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');

const ApiError = require('./utils/ApiError');
const globalError = require('./middlwares/errorMiddleware');

// ce chemin fait reference au index.js 
const mountRoutes = require('./routes');

// dotnet to connect config.env to my app
dotenv.config({ path: 'config.env' })

// Call database
const dbConnection = require('./config/database');

// express app
const app = express();

// cross-origin resource sharing => permet aux autres domaines d'acceder à l'application
app.use(cors())
app.options('*', cors())

// compression permet de compresser tout les responses pour augmenter la performence de l'application
app.use(compression())

// const { response } = require('express');

// Connect with DB
dbConnection();

// ce code pour que req envoie un JSON (un code js)
app.use(express.json());
// Code for serve files
// to acces file use link like this
// http://localhost:8000/categories/category-9b2678a6-218d-4ddd-af46-9e7bba1cc097-1671816159711.jpeg
app.use(express.static(path.join(__dirname, 'upload')));

// _______________________________________________________________________

// Mount Routes
mountRoutes(app);

// @desc ☝🏻Create Error for invalid URL </api/v1/categories>
// @desc  Create error and send it to error handling middleware
app.all('*', (req, res, next) => {
  // @desc replace this 2 line with automatic error handling 👇🏻
  // const err = new Error(`Can't find this route: ${req.originalUrl}`)
  // next(err.message) // send this error  👇🏻
  //                                   // ||
  //                                   // v
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400))

})

// @desc see ('./middlwares/errorMiddleware.js')
// @desc This global error handling middelware for express
// @desc It handle error produced inside express
app.use(globalError) // 👈🏻 to

// _______________________________________________________________________

// morgan midleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
  console.log(`mode: ${process.env.NODE_ENV}`)
}

// _______________________________________________________________________

const PORT = process.env.PORT || 8000

const server = app.listen(PORT, () => {
  console.log(`app is runing on port ${PORT}`)
})

// _______________________________________________________________________

// @desc on manipule les errurs qui se produisent hors express
// @desc Handle rejection outside express

process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`)
  server.close(() => { // @desc => When the server is closed
    console.log(`Shutting down server`)
    process.exit(1) // @desc => stop the programme
  })
})
// thank you