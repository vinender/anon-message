// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signup, login ,googleAuth , resetPassword,forgotPassword, checkUser} = require('../controllers/authController');

// @route   POST /api/auth/signup
// @desc    Register a new user
router.post('/signup', signup);
 
// Google Authentication
router.post('/google',  googleAuth);
router.get('/check-user',checkUser)
// Forgot Password
router.post('/forgot-password',  forgotPassword);
router.post('/reset-password',  resetPassword);
// @route   POST /api/auth/login
// @desc    Login a user
router.post('/login', login);

module.exports = router;
