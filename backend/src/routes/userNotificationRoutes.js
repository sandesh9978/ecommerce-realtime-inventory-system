const express = require("express");
const router = express.Router();
const userNotificationController = require("../controllers/userNotificationController");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

// Admin: send notification (broadcast or to user)
router.post("/send", authMiddleware, isAdmin, userNotificationController.sendNotification);

// User: get all notifications (including broadcast)
router.get("/", authMiddleware, userNotificationController.getUserNotifications);

// User: mark a notification as read
router.put("/:notificationId/read", authMiddleware, userNotificationController.markAsRead);

// User: mark all as read
router.put("/mark-all-read", authMiddleware, userNotificationController.markAllAsRead);

// User: get unread count
router.get("/unread-count", authMiddleware, userNotificationController.getUnreadCount);

// User: delete a notification
router.delete("/:notificationId", authMiddleware, userNotificationController.deleteNotification);

module.exports = router; 