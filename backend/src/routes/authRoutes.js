const express = require('express');
const { register, login, updateProfile } = require('../controllers/authController');
const { body } = require('express-validator');
const rateLimit = require("express-rate-limit");
const { authMiddleware } = require('../middleware/authMiddleware');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Please try again later."
});

const router = express.Router();

// Simple registration without strict validation
router.post('/register', register);

router.post('/login', loginLimiter, [
  body('email').isEmail().withMessage("Invalid email"),
  body('password').notEmpty().withMessage("Password is required"),
], login);

router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
