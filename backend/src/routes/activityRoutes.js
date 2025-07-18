const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { getUserActivity } = require("../controllers/activityController");

router.get("/user", authMiddleware, getUserActivity);

module.exports = router; 