const db = require("../config/db");

const Product = {
  findAll: (callback) => {
    db.query("SELECT * FROM products", callback);
  },
  findById: (id, callback) => {
    db.query("SELECT * FROM products WHERE id = ?", [id], callback);
  },
  create: (data, callback) => {
    const { brand, model, price, oldPrice, status, details, stock, costPrice } = data;
    db.query(
      "INSERT INTO products (brand, model, price, oldPrice, status, details, stock, costPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [brand, model, price, oldPrice || null, status || null, details || null, stock || 0, costPrice || null],
      callback
    );
  },
  update: (id, data, callback) => {
    const fields = [];
    const values = [];
    if (data.brand !== undefined) { fields.push('brand = ?'); values.push(data.brand); }
    if (data.model !== undefined) { fields.push('model = ?'); values.push(data.model); }
    if (data.price !== undefined) { fields.push('price = ?'); values.push(data.price); }
    if (data.oldPrice !== undefined) { fields.push('oldPrice = ?'); values.push(data.oldPrice); }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
    if (data.details !== undefined) { fields.push('details = ?'); values.push(data.details); }
    if (data.stock !== undefined) { fields.push('stock = ?'); values.push(data.stock); }
    if (data.costPrice !== undefined) { fields.push('costPrice = ?'); values.push(data.costPrice); }
    if (fields.length === 0) return callback(new Error('No fields to update'));
    const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    db.query(sql, values, callback);
  },
  delete: (id, callback) => {
    db.query("DELETE FROM products WHERE id = ?", [id], callback);
  },
};

module.exports = Product;
