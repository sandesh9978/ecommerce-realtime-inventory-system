const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { validationResult } = require('express-validator');
const db = require("../config/db"); // Corrected db import

// ✅ Register Controller
exports.register = (req, res) => {
  const { email, password, role = "user", adminSecret, adminsecret } = req.body;

  // ✅ Validate role
  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  // 🔒 Restrict admin registration unless secret matches
  if (role === "admin") {
    // Check for both adminSecret and adminsecret field names
    const providedSecret = adminSecret || adminsecret;
    
    if (providedSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "Admin registration is restricted." });
    }
  }

  // ✅ Check if user already exists
  User.findByEmail(email, async (err, results) => {
    if (err) {
      console.error("Error checking user:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      // ✅ Create new user (without fullName and dob)
      User.create(email, hashedPassword, role, "", null, (err, result) => {
        if (err) {
          console.error("Error creating user:", err);
          return res.status(500).json({ message: "Database error" });
        }

        const user = {
          id: result.insertId,
          email,
          role,
        };

        const token = generateToken(user);
        res.status(201).json({ token, user });
      });
    } catch (error) {
      console.error("Hashing error:", error);
      return res.status(500).json({ message: "Server error during registration" });
    }
  });
};

// ✅ Login Controller
exports.login = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  User.findByEmail(email, async (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];

    try {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user);
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          dob: user.dob,
        },
      });
    } catch (error) {
      console.error("Compare error:", error);
      return res.status(500).json({ message: "Server error during login" });
    }
  });
};

// Update current user's profile
exports.updateProfile = (req, res) => {
  const userId = req.user.id;
  const { fullName, email, mobile, dob, gender } = req.body;
  if (!fullName || !email) {
    return res.status(400).json({ message: 'Full name and email are required' });
  }
  const sql = 'UPDATE users SET fullName = ?, email = ?, mobile = ?, dob = ?, gender = ? WHERE id = ?';
  db.query(sql, [fullName, email, mobile, dob, gender, userId], (err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to update profile', error: err.message });
    }
    // Return updated user object
    db.query('SELECT id, fullName, email, mobile, dob, gender, role FROM users WHERE id = ?', [userId], (err2, rows) => {
      if (err2 || !rows || !rows[0]) {
        return res.status(500).json({ message: 'Profile updated but failed to fetch user' });
      }
      res.json({ user: rows[0], message: 'Profile updated successfully' });
    });
  });
};

// const User = require('../models/User');
// const generateToken = require('../utils/generateToken');
// const bcrypt = require('bcryptjs');

// // @desc    Register a new user
// // @route   POST /api/auth/register
// // @access  Public
// const register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const userExists = await User.findOne({ where: { email } });
//     if (userExists) {
//       return res.status(400).json({ message: 'User already exists' });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({ name, email, password: hashedPassword });
//     const token = generateToken(user.id);
//     res.status(201).json({
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       token,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Login user & get token
// // @route   POST /api/auth/login
// // @access  Public
// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid email or password' });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid email or password' });
//     }
//     const token = generateToken(user.id);
//     res.json({
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       token,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Logout user (placeholder)
// // @route   POST /api/auth/logout
// // @access  Private
// const logout = (req, res) => {
//   // For JWT, logout is handled on the client by deleting the token
//   res.json({ message: 'Logged out successfully' });
// };

// // @desc    Update user profile
// // @route   PUT /api/auth/profile
// // @access  Private
// const updateProfile = async (req, res) => {
//   try {
//     const user = await User.findByPk(req.user.id);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     const { name, email, password } = req.body;
//     if (name) user.name = name;
//     if (email) user.email = email;
//     if (password) {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       user.password = hashedPassword;
//     }
//     await user.save();
//     res.json({
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       message: 'Profile updated successfully',
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = {
//   register,
//   login,
//   logout,
//   updateProfile,
// }; 