const express = require('express');
const { 
  register, 
  login, 
  getCurrentUser, 
  refreshToken, 
  logout,
  forgotPassword,
  resetPassword,
  updateProfile,
  googleAuth,
  microsoftAuth,
  registerUser,
  getUserById // ✅ import the new controller
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/google', googleAuth);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.post('/logout', protect, logout);
router.put('/profile', protect, updateProfile);

// MS login
router.post('/microsoft', microsoftAuth);
router.post('/registerV2', registerUser);

// ✅ New route: get user by ID (protected)
router.get('/users/:id', protect, getUserById);

module.exports = router;