const db = require("../config/db");

const getAllFeedback = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM feedback ORDER BY createdAt DESC");
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const addFeedback = async (req, res) => {
  try {
    const { name, email, rating, comments, createdAt } = req.body;
    if (!name || !email || !comments)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const [result] = await db.query(
      "INSERT INTO feedback (name, email, rating, comments, createdAt) VALUES (?, ?, ?, ?, ?)",
      [name, email, rating || 5, comments, createdAt || new Date()]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, rating, comments } = req.body;

    if (!name || !email || !comments)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const [result] = await db.query(
      "UPDATE feedback SET name=?, email=?, rating=?, comments=? WHERE id=?",
      [name, email, rating, comments, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Feedback not found" });

    res.json({ success: true, message: "Updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await db.query("DELETE FROM feedback WHERE id=?", [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Feedback not found" });

    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getAllFeedback, addFeedback, updateFeedback, deleteFeedback };
