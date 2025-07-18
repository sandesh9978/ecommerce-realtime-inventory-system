const db = require("../config/db");
const User = require("../models/User");
const Order = require("../models/Order");
const Wishlist = require("../models/Wishlist");
const RestockAlert = require("../models/RestockAlert");

// Fetch orders with optional filters for search and status
const getAllOrders = (req, res) => {
  const { search, status } = req.query;

  let query = `
    SELECT o.id, u.email, o.total_amount, o.status, o.created_at
    FROM orders o
    JOIN users u ON o.user_id = u.id
  `;

  const params = [];
  const conditions = [];

  if (search) {
    conditions.push("(u.email LIKE ? OR o.id = ?)");
    params.push(`%${search}%`, search);
  }
  if (status) {
    conditions.push("o.status = ?");
    params.push(status);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY o.created_at DESC";

  // Log the query and params for debugging
  console.log("[getAllOrders] Query:", query);
  console.log("[getAllOrders] Params:", params);

  db.query(query, params, (err, rows) => {
    if (err) {
      console.error("[getAllOrders] Error fetching orders:", err);
      if (err && err.stack) console.error(err.stack);
      return res.status(500).json({ message: "Failed to fetch orders", error: err.message });
    }

    res.json(rows);
  });
};

// Fetch all products
const getAllProducts = (req, res) => {
  db.query("SELECT * FROM products ORDER BY id DESC", (err, rows) => {
    if (err) {
      console.error("Error fetching products:", err);
      return res.status(500).json({ message: "Failed to fetch products" });
    }
    res.json(rows);
  });
};

// Add new product
const addProduct = (req, res) => {
  const { brand, model, price, oldPrice, status, image, details } = req.body;

  if (!brand || !model || !price) {
    return res.status(400).json({ message: "Brand, model, and price are required" });
  }

  db.query(
    "INSERT INTO products (brand, model, price, oldPrice, status, image, details) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [brand, model, price, oldPrice || null, status || null, image || null, details || null],
    (err, result) => {
      if (err) {
        console.error("Error inserting product:", err);
        return res.status(500).json({ message: "Failed to save product" });
      }

      res.status(201).json({ success: true, id: result.insertId });
    }
  );
};

// Update order delivery status
const updateOrderStatus = (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!status || !['pending', 'shipped', 'delivered', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: "Valid status is required" });
  }

  db.query(
    "UPDATE orders SET status = ? WHERE id = ?",
    [status, orderId],
    (err, result) => {
      if (err) {
        console.error("Error updating order status:", err);
        return res.status(500).json({ message: "Failed to update order status" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json({ message: "Order status updated successfully", status });
    }
  );
};

// Fetch all users (for admin dashboard)
const getAllUsers = (req, res) => {
  const sql = `SELECT id, email, role, fullName, created_at FROM users ORDER BY created_at DESC`;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error("[getAllUsers] Error fetching users:", err);
      return res.status(500).json({ message: "Failed to fetch users", error: err.message });
    }
    res.json(rows);
  });
};

// Fetch recent activity log (for admin dashboard)
const getRecentActivity = (req, res) => {
  const sql = `
    SELECT a.id, a.action, a.details, a.created_at, u.email
    FROM activity_log a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT 10
  `;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error("[getRecentActivity] Error fetching activity log:", err);
      return res.status(500).json({ message: "Failed to fetch activity log", error: err.message });
    }
    res.json(rows);
  });
};

// Update user info (admin)
const updateUser = (req, res) => {
  const userId = req.params.id;
  const { email, fullName, role } = req.body;
  const sql = "UPDATE users SET email = ?, fullName = ?, role = ? WHERE id = ?";
  db.query(sql, [email, fullName, role, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Failed to update user", error: err.message });
    }
    res.json({ message: "User updated successfully" });
  });
};

// Ban user (admin)
const banUser = (req, res) => {
  const userId = req.params.id;
  const sql = "UPDATE users SET banned = 1 WHERE id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Failed to ban user", error: err.message });
    }
    res.json({ message: "User banned successfully" });
  });
};

// Unban user (admin)
const unbanUser = (req, res) => {
  const userId = req.params.id;
  const sql = "UPDATE users SET banned = 0 WHERE id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Failed to unban user", error: err.message });
    }
    res.json({ message: "User unbanned successfully" });
  });
};

// Reset user password (admin)
const resetUserPassword = (req, res) => {
  const userId = req.params.id;
  const { newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ message: "New password required" });
  const bcrypt = require("bcryptjs");
  bcrypt.hash(newPassword, 10, (err, hash) => {
    if (err) return res.status(500).json({ message: "Hashing error" });
    const sql = "UPDATE users SET password = ? WHERE id = ?";
    db.query(sql, [hash, userId], (err2) => {
      if (err2) return res.status(500).json({ message: "Failed to reset password" });
      res.json({ message: "Password reset successfully" });
    });
  });
};

// Update product (admin)
const updateProduct = (req, res) => {
  const productId = req.params.id;
  const { brand, model, price, oldPrice, status, stock, image, details } = req.body;
  // Only update provided fields
  const fields = [];
  const values = [];
  if (brand !== undefined) { fields.push('brand = ?'); values.push(brand); }
  if (model !== undefined) { fields.push('model = ?'); values.push(model); }
  if (price !== undefined) { fields.push('price = ?'); values.push(price); }
  if (oldPrice !== undefined) { fields.push('oldPrice = ?'); values.push(oldPrice); }
  if (status !== undefined) { fields.push('status = ?'); values.push(status); }
  if (stock !== undefined) { fields.push('stock = ?'); values.push(stock); }
  if (image !== undefined) { fields.push('image = ?'); values.push(image); }
  if (details !== undefined) { fields.push('details = ?'); values.push(details); }
  if (fields.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }
  const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
  values.push(productId);
  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to update product', error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully' });
  });
};

// Get full user details (admin)
const getUserDetails = async (req, res) => {
  const userId = req.params.id;
  try {
    // Get user info
    const [userRows] = await new Promise((resolve, reject) => {
      db.query("SELECT id, email, role, fullName, created_at, banned FROM users WHERE id = ?", [userId], (err, rows) => {
        if (err) reject(err);
        else resolve([rows]);
      });
    });
    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = userRows[0];

    // Get user orders
    const orders = await Order.findByUserId(userId);

    // Get user activity
    const [activity] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT id, action, details, created_at FROM activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve([rows]);
        }
      );
    });

    // Get wishlist
    const wishlist = await new Promise((resolve, reject) => {
      Wishlist.getAll(userId, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Get restock alerts
    const restockAlerts = await new Promise((resolve, reject) => {
      RestockAlert.getByUser(userId, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({ user, orders, activity, wishlist, restockAlerts });
  } catch (err) {
    console.error("[getUserDetails] Error:", err);
    res.status(500).json({ message: "Failed to fetch user details", error: err.message });
  }
};

// Get product by ID
const getProductById = (req, res) => {
  const productId = req.params.id;
  db.query("SELECT * FROM products WHERE id = ?", [productId], (err, rows) => {
    if (err) {
      console.error("Error fetching product by id:", err);
      return res.status(500).json({ message: "Failed to fetch product" });
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(rows[0]);
  });
};

// Delete product by ID
const deleteProduct = (req, res) => {
  const productId = req.params.id;
  db.query("DELETE FROM products WHERE id = ?", [productId], (err, result) => {
    if (err) {
      console.error("Error deleting product:", err);
      return res.status(500).json({ message: "Failed to delete product" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  });
};

module.exports = {
  getAllOrders,
  getAllProducts,
  addProduct,
  updateOrderStatus,
  getAllUsers,
  getRecentActivity,
  updateUser,
  banUser,
  unbanUser,
  resetUserPassword,
  updateProduct,
  getUserDetails,
  getProductById,
  deleteProduct,
};

// const db = require("../config/db");

// const getAllOrders = async (req, res) => {
//   try {
//     const [orders] = await db.query(`
//       SELECT o.id, o.total_amount, o.status, o.created_at, u.email
//       FROM orders o
//       JOIN users u ON o.user_id = u.id
//       ORDER BY o.created_at DESC
//     `);
//     res.json(orders);
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).json({ message: "Failed to fetch orders" });
//   }
// };

// const getAllProducts = async (req, res) => {
//   try {
//     const [products] = await db.query("SELECT * FROM products");
//     res.json(products);
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     res.status(500).json({ message: "Failed to fetch products" });
//   }
// };

// module.exports = { getAllOrders, getAllProducts };

// const db = require("../config/db");

// exports.getAllOrders = (req, res) => {
//   const sql = `
//     SELECT orders.id, users.email, orders.total_amount, orders.created_at
//     FROM orders
//     JOIN users ON orders.user_id = users.id
//     ORDER BY orders.created_at DESC
//   `;

//   db.query(sql, (err, results) => {
//     if (err) return res.status(500).json({ message: "Database error" });
//     res.json(results);
//   });
// };
