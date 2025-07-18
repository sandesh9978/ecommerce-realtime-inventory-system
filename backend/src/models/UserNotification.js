const db = require("../config/db");

const UserNotification = {
  // Add a new notification (user_id null for broadcast)
  add: (userId, message, type = "info", callback) => {
    const sql = `
      INSERT INTO user_notifications (user_id, message, type, created_at)
      VALUES (?, ?, ?, NOW())
    `;
    db.query(sql, [userId, message, type], callback);
  },

  // Add a broadcast notification to all users
  addBroadcast: (message, type = "info", callback) => {
    // Insert a notification with user_id NULL (means broadcast)
    const sql = `
      INSERT INTO user_notifications (user_id, message, type, created_at)
      VALUES (NULL, ?, ?, NOW())
    `;
    db.query(sql, [message, type], callback);
  },

  // Get notifications for a user (including broadcast)
  getByUser: (userId, callback) => {
    const sql = `
      SELECT * FROM user_notifications
      WHERE user_id = ? OR user_id IS NULL
      ORDER BY created_at DESC
    `;
    db.query(sql, [userId], callback);
  },

  // Mark a notification as read
  markAsRead: (notificationId, callback) => {
    const sql = "UPDATE user_notifications SET read_status = 1 WHERE id = ?";
    db.query(sql, [notificationId], callback);
  },

  // Mark all notifications as read for a user
  markAllAsRead: (userId, callback) => {
    const sql = "UPDATE user_notifications SET read_status = 1 WHERE (user_id = ? OR user_id IS NULL) AND read_status = 0";
    db.query(sql, [userId], callback);
  },

  // Delete a notification
  delete: (notificationId, userId, callback) => {
    const sql = "DELETE FROM user_notifications WHERE id = ? AND (user_id = ? OR user_id IS NULL)";
    db.query(sql, [notificationId, userId], callback);
  },

  // Get unread notification count for a user
  getUnreadCount: (userId, callback) => {
    const sql = "SELECT COUNT(*) as count FROM user_notifications WHERE (user_id = ? OR user_id IS NULL) AND read_status = 0";
    db.query(sql, [userId], callback);
  }
};

module.exports = UserNotification; 