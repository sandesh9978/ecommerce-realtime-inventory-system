const db = require("../config/db");

const ProductImage = {
  findByProductId: (productId, callback) => {
    db.query("SELECT * FROM product_images WHERE product_id = ?", [productId], callback);
  },
  create: (productId, imagePath, callback) => {
    db.query(
      "INSERT INTO product_images (product_id, image_path) VALUES (?, ?)",
      [productId, imagePath],
      callback
    );
  },
  deleteById: (id, callback) => {
    db.query("DELETE FROM product_images WHERE id = ?", [id], callback);
  },
  deleteByProductId: (productId, callback) => {
    db.query("DELETE FROM product_images WHERE product_id = ?", [productId], callback);
  }
};

module.exports = ProductImage; 