const db = require("../config/db");
const ReturnRequest = require("../models/ReturnRequest");

exports.submitReturn = (req, res) => {
  const userId = req.user.id;
  const { name, email, orderId, reason } = req.body;

  if (!name || !email || !orderId || !reason) {
    return res.status(400).json({ message: "All fields are required" });
  }

  ReturnRequest.create(userId, name, email, orderId, reason, (err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to submit return request" });
    }
    res.json({ message: "Return request submitted successfully" });
  });
};

exports.getAllReturns = (req, res) => {
  ReturnRequest.getAll((err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch return requests" });
    }
    res.json(results);
  });
};

exports.getAllReturnsAdmin = (req, res) => {
  ReturnRequest.getAll((err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch return requests" });
    }
    res.json(results);
  });
};

exports.markReturnProcessed = (req, res) => {
  const returnId = req.params.id;
  ReturnRequest.updateStatus(returnId, "processed", (err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to update return status" });
    }
    res.json({ message: "Return marked as processed" });
  });
};

exports.cancelReturnRequest = (req, res) => {
  const returnId = req.params.id;
  const userId = req.user.id;

  const sql = "DELETE FROM returns WHERE id = ? AND user_id = ? AND status != 'processed'";
  db.query(sql, [returnId, userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to cancel return request" });
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Request not found or already processed" });
    }
    res.json({ message: "Return request cancelled" });
  });
};

// Get all returns for the logged-in user
exports.getUserReturns = (req, res) => {
  const userId = req.user.id;
  const sql = `
    SELECT r.id, r.name, r.email, r.order_id, r.reason, r.status AS return_status, r.created_at AS return_created_at,
           o.total_amount, o.status AS order_status, o.created_at AS order_created_at
    FROM returns r
    JOIN orders o ON r.order_id = o.id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch return requests" });
    }
    res.json(results);
  });
};
