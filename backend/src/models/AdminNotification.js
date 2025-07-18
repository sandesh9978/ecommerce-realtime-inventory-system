const db = require("../config/db");

const AdminNotification = {
  // Add a new admin notification
  add: (type, productId, message, priority, callback) => {
    const sql = `
      INSERT INTO admin_notifications (type, product_id, message, priority, created_at) 
      VALUES (?, ?, ?, ?, NOW())
    `;
    db.query(sql, [type, productId, message, priority], callback);
  },

  // Get all admin notifications
  getAll: (callback) => {
    const sql = `
      SELECT an.*, p.name as product_name, p.image as product_image, p.stock as current_stock
      FROM admin_notifications an
      LEFT JOIN products p ON an.product_id = p.id
      ORDER BY an.created_at DESC
    `;
    db.query(sql, callback);
  },

  // Get unread notifications
  getUnread: (callback) => {
    const sql = `
      SELECT an.*, p.name as product_name, p.image as product_image, p.stock as current_stock
      FROM admin_notifications an
      LEFT JOIN products p ON an.product_id = p.id
      WHERE an.read_status = 0
      ORDER BY an.created_at DESC
    `;
    db.query(sql, callback);
  },

  // Mark notification as read
  markAsRead: (notificationId, callback) => {
    const sql = "UPDATE admin_notifications SET read_status = 1 WHERE id = ?";
    db.query(sql, [notificationId], callback);
  },

  // Mark all notifications as read
  markAllAsRead: (callback) => {
    const sql = "UPDATE admin_notifications SET read_status = 1 WHERE read_status = 0";
    db.query(sql, callback);
  },

  // Delete notification
  delete: (notificationId, callback) => {
    const sql = "DELETE FROM admin_notifications WHERE id = ?";
    db.query(sql, [notificationId], callback);
  },

  // Check if notification already exists for a product
  exists: (type, productId, callback) => {
    const sql = "SELECT * FROM admin_notifications WHERE type = ? AND product_id = ? AND read_status = 0";
    db.query(sql, [type, productId], callback);
  },

  // Get notification count
  getCount: (callback) => {
    const sql = "SELECT COUNT(*) as count FROM admin_notifications WHERE read_status = 0";
    db.query(sql, callback);
  }
};

module.exports = AdminNotification; 