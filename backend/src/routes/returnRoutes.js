const express = require("express");
const router = express.Router();
const { submitReturn, getAllReturns, getAllReturnsAdmin, markReturnProcessed, getUserReturns } = require("../controllers/returnController");

const { authMiddleware } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, submitReturn);
router.get("/", authMiddleware, getAllReturns);
router.get("/user", authMiddleware, getUserReturns);
router.get("/admin", authMiddleware, adminOnly, getAllReturnsAdmin);
router.patch("/:id/process", authMiddleware, adminOnly, markReturnProcessed);

module.exports = router;
