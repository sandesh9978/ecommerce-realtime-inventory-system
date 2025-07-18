const db = require('../config/db');

class Order {
  static async create(orderData) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO orders (user_id, total_amount, status, created_at) VALUES (?, ?, ?, NOW())';
      db.query(sql, [orderData.user_id, orderData.total_amount, orderData.status || 'pending'], (err, result) => {
        if (err) reject(err);
        else resolve({ id: result.insertId, ...orderData });
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM orders WHERE id = ?';
      db.query(sql, [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }

  static async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC';
      db.query(sql, [userId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  static async updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE orders SET status = ? WHERE id = ?';
      db.query(sql, [status, id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM orders WHERE id = ?';
      db.query(sql, [id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}

module.exports = Order;
