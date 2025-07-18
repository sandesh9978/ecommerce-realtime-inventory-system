const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();
const { addReview, getReviews, getReviewsByUser } = require("../controllers/reviewController");

router.post("/", authMiddleware, addReview);
router.get("/:productId", getReviews);
router.get("/user", authMiddleware, getReviewsByUser);

module.exports = router;
