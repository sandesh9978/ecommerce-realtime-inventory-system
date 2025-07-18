const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/roleMiddleware");
const { createOrder, getUserOrders, cancelOrder, approveCancellation, rejectCancellation } = require("../controllers/orderController");

router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getUserOrders);
router.put("/:id/cancel", authMiddleware, cancelOrder);
router.patch("/:id/approve-cancellation", authMiddleware, adminOnly, approveCancellation);
router.patch("/:id/reject-cancellation", authMiddleware, adminOnly, rejectCancellation);

module.exports = router;
