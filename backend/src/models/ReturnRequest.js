const db = require("../config/db");

const ReturnRequest = {
  create: (userId, name, email, orderId, reason, callback) => {
    const sql = "INSERT INTO returns (user_id, name, email, order_id, reason, status) VALUES (?, ?, ?, ?, ?, 'pending')";
    db.query(sql, [userId, name, email, orderId, reason], callback);
  },

  getAll: (callback) => {
    const sql = `
      SELECT r.id, r.name, r.email, r.order_id, r.reason, r.status, r.created_at, u.email as user_email
      FROM returns r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `;
    db.query(sql, callback);
  },

  updateStatus: (id, status, callback) => {
    const sql = "UPDATE returns SET status = ? WHERE id = ?";
    db.query(sql, [status, id], callback);
  },
};

module.exports = ReturnRequest;
