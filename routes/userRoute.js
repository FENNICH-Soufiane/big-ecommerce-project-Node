// @desc step foor create Route

const express = require('express');

const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator
} = require('../utils/validators/userValidator');

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData
} = require('../services/userService');

const authService = require('../services/authService');

const router = express.Router();

// for access to the file aploaded
//http://localhost:8000/brands/category-76fd2a05-da85-40c0-8b69-da21bbdc197c-1671892102271.jpeg

// Routes

// router.use(authService.protect) ==> ce ligne de code peut remplacer tous les authService.protect utliser dans les routes

router.get('/getMe', authService.protect, getLoggedUserData, getUser);
router.put('/changeMyPassword', authService.protect, updateLoggedUserPassword);
router.put('/updateMe', authService.protect, updateLoggedUserValidator, updateLoggedUserData);
router.delete('/deleteMe', authService.protect, deleteLoggedUserData);

// Admin

// @desc ce ligne de code permet de remplacer <authService.protect,authService.allowedTo('admin', 'manager')> et <authService.protect,authService.allowedTo('admin')>
// @desc dans notre cas en l'a pas remplacer

router.use(authService.protect, authService.allowedTo('admin', 'manager'))
router.put('/changePassword/:id', changeUserPasswordValidator, changeUserPassword);
router.route('/')
  .get(getUsers)
  .post(uploadUserImage, resizeImage, createUserValidator, createUser)
router.route('/:id')
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser)

module.exports = router;