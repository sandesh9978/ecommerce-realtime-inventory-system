const db = require("../config/db");

exports.getUserActivity = (req, res) => {
  const userId = req.user.id;
  const sql = "SELECT id, action, details, created_at FROM activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 20";
  db.query(sql, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch activity log" });
    }
    res.json(rows);
  });
}; 