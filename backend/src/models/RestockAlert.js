const db = require("../config/db");

const RestockAlert = {
  // Add a new restock alert subscription
  add: (userId, productId, email, callback) => {
    const sql = `
      INSERT INTO restock_alerts (user_id, product_id, email, created_at) 
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE created_at = NOW()
    `;
    db.query(sql, [userId, productId, email], callback);
  },

  // Get all restock alerts for a user
  getByUser: (userId, callback) => {
    const sql = `
      SELECT ra.*, p.name as product_name, p.image as product_image, p.price as product_price
      FROM restock_alerts ra
      JOIN products p ON ra.product_id = p.id
      WHERE ra.user_id = ?
      ORDER BY ra.created_at DESC
    `;
    db.query(sql, [userId], callback);
  },

  // Get all restock alerts for a specific product
  getByProduct: (productId, callback) => {
    const sql = `
      SELECT ra.*, u.email as user_email
      FROM restock_alerts ra
      JOIN users u ON ra.user_id = u.id
      WHERE ra.product_id = ?
    `;
    db.query(sql, [productId], callback);
  },

  // Remove a restock alert
  remove: (alertId, userId, callback) => {
    const sql = "DELETE FROM restock_alerts WHERE id = ? AND user_id = ?";
    db.query(sql, [alertId, userId], callback);
  },

  // Check if user already has an alert for a product
  exists: (userId, productId, callback) => {
    const sql = "SELECT * FROM restock_alerts WHERE user_id = ? AND product_id = ?";
    db.query(sql, [userId, productId], callback);
  },

  // Get all alerts that need to be notified (for products that came back in stock)
  getAlertsForRestockedProduct: (productId, callback) => {
    const sql = `
      SELECT ra.*, u.email as user_email, p.name as product_name
      FROM restock_alerts ra
      JOIN users u ON ra.user_id = u.id
      JOIN products p ON ra.product_id = p.id
      WHERE ra.product_id = ? AND ra.notified = 0
    `;
    db.query(sql, [productId], callback);
  },

  // Mark alerts as notified
  markAsNotified: (alertIds, callback) => {
    if (alertIds.length === 0) return callback(null, []);
    const sql = "UPDATE restock_alerts SET notified = 1 WHERE id IN (?)";
    db.query(sql, [alertIds], callback);
  }
};

module.exports = RestockAlert; 