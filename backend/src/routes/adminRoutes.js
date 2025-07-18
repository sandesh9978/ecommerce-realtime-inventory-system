const express = require("express");
const router = express.Router();
const { getAllOrders, updateOrderStatus, getAllUsers, getRecentActivity, updateUser, banUser, unbanUser, resetUserPassword, getUserDetails } = require("../controllers/adminController");
const { authMiddleware } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/roleMiddleware");

router.get("/admin/dashboard", authMiddleware, adminOnly, (req, res) => {
  res.json({ message: "Admin dashboard content", admin: req.user.email });
});

router.get("/orders", authMiddleware, adminOnly, getAllOrders);
router.put("/orders/:orderId/status", authMiddleware, adminOnly, updateOrderStatus);
router.get("/users", authMiddleware, adminOnly, getAllUsers);
router.get("/activity", authMiddleware, adminOnly, getRecentActivity);
router.put("/users/:id", authMiddleware, adminOnly, updateUser);
router.post("/users/:id/ban", authMiddleware, adminOnly, banUser);
router.post("/users/:id/unban", authMiddleware, adminOnly, unbanUser);
router.post("/users/:id/reset-password", authMiddleware, adminOnly, resetUserPassword);
router.get("/users/:id/details", authMiddleware, adminOnly, getUserDetails);

module.exports = router;


