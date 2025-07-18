const db = require("../config/db");

const Wishlist = {
  add: (userId, productId, callback) => {
    const sql = `
      INSERT INTO wishlist (user_id, product_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP
    `;
    db.query(sql, [userId, productId], callback);
  },

  getAll: (userId, callback) => {
    const sql = `
      SELECT wishlist.id, products.name, products.price, products.image
      FROM wishlist
      JOIN products ON wishlist.product_id = products.id
      WHERE wishlist.user_id = ?
    `;
    db.query(sql, [userId], callback);
  },

  remove: (wishlistId, userId, callback) => {
    const sql = `DELETE FROM wishlist WHERE id = ? AND user_id = ?`;
    db.query(sql, [wishlistId, userId], callback);
  }
};

module.exports = Wishlist;
