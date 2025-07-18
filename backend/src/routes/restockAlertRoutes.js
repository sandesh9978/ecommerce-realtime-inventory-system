const express = require("express");
const router = express.Router();
const { createRestockAlert, getRestockAlerts, getUserRestockAlerts } = require("../controllers/restockAlertController");

const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createRestockAlert);
router.get("/", authMiddleware, getRestockAlerts);
router.get("/user", authMiddleware, getUserRestockAlerts);

module.exports = router; 