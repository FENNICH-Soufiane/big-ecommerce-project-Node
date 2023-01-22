// @desc step foor create Route

const express = require('express');
const { signupValidator, loginValidator } = require('../utils/validators/authValidator');

const { signup, login, forgotPassword, verifyPassResetCode, resetPassword } = require('../services/authService');



const router = express.Router();

// Routes

// router.route('/signup').post(signupValidator, signup);
router.post('/signup',signupValidator, signup);
router.post('/login',loginValidator, login);
router.post('/forgotPassword', forgotPassword);
router.post('/verifyResetCode', verifyPassResetCode);
router.put('/resetPassword', resetPassword);




module.exports = router;