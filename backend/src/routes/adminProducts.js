const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { getAllProducts, addProduct, updateProduct, getProductById, deleteProduct } = require("../controllers/adminController");
const multer = require("../../helper/multer");

router.get("/", authMiddleware, getAllProducts);
router.post("/", authMiddleware, multer.single('image'), addProduct);
router.put("/:id", authMiddleware, multer.single('image'), updateProduct);
router.get("/:id", authMiddleware, getProductById);
router.delete("/:id", authMiddleware, deleteProduct);

module.exports = router;
