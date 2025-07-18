const UserNotification = require("../models/UserNotification");

// Admin: Send notification to all users or a specific user
exports.sendNotification = (req, res) => {
  const { userId, message, type } = req.body;
  if (!message) return res.status(400).json({ message: "Message is required" });
  if (userId) {
    UserNotification.add(userId, message, type || "info", (err) => {
      if (err) return res.status(500).json({ message: "Failed to send notification" });
      res.json({ message: "Notification sent to user" });
    });
  } else {
    UserNotification.addBroadcast(message, type || "info", (err) => {
      if (err) return res.status(500).json({ message: "Failed to send broadcast notification" });
      res.json({ message: "Broadcast notification sent to all users" });
    });
  }
};

// User: Get all notifications (including broadcast)
exports.getUserNotifications = (req, res) => {
  const userId = req.user.id;
  UserNotification.getByUser(userId, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
};

// User: Mark a notification as read
exports.markAsRead = (req, res) => {
  const { notificationId } = req.params;
  UserNotification.markAsRead(notificationId, (err) => {
    if (err) return res.status(500).json({ message: "Failed to mark as read" });
    res.json({ message: "Notification marked as read" });
  });
};

// User: Mark all notifications as read
exports.markAllAsRead = (req, res) => {
  const userId = req.user.id;
  UserNotification.markAllAsRead(userId, (err) => {
    if (err) return res.status(500).json({ message: "Failed to mark all as read" });
    res.json({ message: "All notifications marked as read" });
  });
};

// User: Get unread notification count
exports.getUnreadCount = (req, res) => {
  const userId = req.user.id;
  UserNotification.getUnreadCount(userId, (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ count: result[0].count });
  });
};

// User: Delete a notification
exports.deleteNotification = (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;
  UserNotification.delete(notificationId, userId, (err) => {
    if (err) return res.status(500).json({ message: "Failed to delete notification" });
    res.json({ message: "Notification deleted successfully" });
  });
}; 