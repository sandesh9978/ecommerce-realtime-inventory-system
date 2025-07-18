const express = require("express");
const router = express.Router();

// ✅ FIXED: Add missing imports
const {
  addToCart,
  getCart,
  removeFromCart,   // ✅ must import this
  checkout          // ✅ must import this
} = require("../controllers/cartController");

const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, addToCart);
router.get("/", authMiddleware, getCart);
router.delete("/:id", authMiddleware, removeFromCart); // ✅ this was causing the error
router.post("/checkout", authMiddleware, checkout);

module.exports = router;
