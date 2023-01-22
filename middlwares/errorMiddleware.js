const ApiError = require("../utils/ApiError")


const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack  // position of error
  })
}

const sendErrorForProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  })
}



const handleJwtInvalidSignature = () => 
new ApiError('Invalid token, Please login again..', 401)

const handleJwtExpired = () => 
new ApiError('Expired token, please login again..',401)

// @desc  When we give the app four parameters
// @desc Express understands that we are going to handle the errors
// @desc Global error handling middleware

const globalError = (err, req, res, next) => {
  // res.status(400).json({ err }) // 👈🏻

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if(process.env.NODE_ENV === 'development') {
    sendErrorForDev(err, res);
  }
  else {
    if(err.name === 'JsonWebTokenError') err =  handleJwtInvalidSignature();
    if(err.name === 'TokenExpiredError') err =  handleJwtExpired();
    sendErrorForProd(err, res);
  }
}

module.exports = globalError;