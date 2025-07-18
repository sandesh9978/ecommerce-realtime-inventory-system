const db = require("../config/db");

exports.addReview = (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Invalid rating" });
  }

  const sql = "INSERT INTO reviews (userId, productId, rating, comment) VALUES (?, ?, ?, ?)";
  db.query(sql, [userId, productId, rating, comment], (err) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Review added successfully" });
  });
};

exports.getReviewsByProduct = (req, res) => {
  const { productId } = req.params;

  const sql = `
    SELECT r.rating, r.comment, r.createdAt, u.username 
    FROM reviews r
    JOIN users u ON r.userId = u.id
    WHERE r.productId = ?
    ORDER BY r.createdAt DESC
  `;

  db.query(sql, [productId], (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch reviews" });
    res.json(results);
  });
};
exports.addReview = (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Invalid rating" });
  }

  // Check if user already reviewed
  const checkSql = "SELECT * FROM reviews WHERE userId = ? AND productId = ?";
  db.query(checkSql, [userId, productId], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.length > 0) {
      return res.status(400).json({ message: "You already submitted a review for this product" });
    }

    // Add review
    const insertSql = "INSERT INTO reviews (userId, productId, rating, comment) VALUES (?, ?, ?, ?)";
    db.query(insertSql, [userId, productId, rating, comment], (err) => {
      if (err) return res.status(500).json({ message: "Insert failed" });
      res.json({ message: "Review added successfully" });
    });
  });
};
exports.deleteReview = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM reviews WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to delete review" });
    res.json({ message: "Review deleted" });
  });
};
exports.getAllReviews = (req, res) => {
  const sql = `
    SELECT r.id, r.productId, r.rating, r.comment, r.createdAt,
           u.username, p.name AS productName
    FROM reviews r
    JOIN users u ON r.userId = u.id
    JOIN products p ON r.productId = p.id
    ORDER BY r.createdAt DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to fetch reviews" });
    res.json(result);
  });
};
exports.updateReview = (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Invalid rating" });
  }

  const sql = "UPDATE reviews SET rating = ?, comment = ? WHERE id = ? AND userId = ?";
  db.query(sql, [rating, comment, id, userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Update failed" });

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: "Not allowed to update this review" });
    }

    res.json({ message: "Review updated successfully" });
  });
};

// Get all reviews by the logged-in user
exports.getReviewsByUser = (req, res) => {
  const userId = req.user.id;
  const sql = `
    SELECT r.id, r.productId, r.rating, r.comment, r.createdAt,
           p.name AS productName, p.image AS productImage
    FROM reviews r
    JOIN products p ON r.productId = p.id
    WHERE r.userId = ?
    ORDER BY r.createdAt DESC
  `;
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to fetch user reviews" });
    res.json(result);
  });
};
