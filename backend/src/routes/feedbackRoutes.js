const express = require("express");
const router = express.Router();

let feedbackList = [];
let currentId = 1;

// GET all feedback
router.get("/", (req, res) => {
  res.json({ success: true, data: feedbackList });
});

// POST feedback
router.post("/", (req, res) => {
  const { name, email, rating, comments, createdAt } = req.body;
  if (!name || !email || !comments) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  const newFeedback = {
    id: currentId++,
    name,
    email,
    rating,
    comments,
    createdAt: createdAt || new Date().toISOString(),
  };

  feedbackList.push(newFeedback);
  res.json({ success: true, id: newFeedback.id });
});

// PUT feedback
router.put("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = feedbackList.findIndex((fb) => fb.id === id);
  if (index === -1) return res.status(404).json({ success: false, message: "Feedback not found" });

  const { name, email, rating, comments } = req.body;
  if (!name || !email || !comments) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  feedbackList[index] = { ...feedbackList[index], name, email, rating, comments };
  res.json({ success: true });
});

// DELETE feedback
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = feedbackList.findIndex((fb) => fb.id === id);
  if (index === -1) return res.status(404).json({ success: false, message: "Feedback not found" });

  feedbackList.splice(index, 1);
  res.json({ success: true });
});

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const feedbackController = require("../controllers/feedbackController");

// router.get("/", feedbackController.getAllFeedback);
// router.post("/", feedbackController.addFeedback);
// router.put("/:id", feedbackController.updateFeedback);
// router.delete("/:id", feedbackController.deleteFeedback);

// module.exports = router;
