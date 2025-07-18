const db = require("../config/db");

const Cart = {
  addItem: (userId, productId, quantity, callback) => {
    const sql = `
      INSERT INTO cart (user_id, product_id, quantity)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = quantity + ?;
    `;
    db.query(sql, [userId, productId, quantity, quantity], callback);
  },

  getItems: (userId, callback) => {
    const sql = `
      SELECT cart.id, products.name, products.price, cart.quantity
      FROM cart
      JOIN products ON cart.product_id = products.id
      WHERE cart.user_id = ?;
    `;
    db.query(sql, [userId], callback);
  }
};
deleteItem: (cartId, userId, callback) => {
  const sql = `DELETE FROM cart WHERE id = ? AND user_id = ?`;
  db.query(sql, [cartId, userId], callback);
}
clearCart: (userId, callback) => {
  const sql = "DELETE FROM cart WHERE user_id = ?";
  db.query(sql, [userId], callback);
}

module.exports = Cart;
