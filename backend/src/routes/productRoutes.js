const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authMiddleware } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/roleMiddleware");
const multer = require('../../helper/multer');

router.get("/", productController.getAllProducts); // public route
router.get("/search", productController.searchProducts);
router.get("/seed", productController.seedProducts); // Changed to GET for seeding
router.get("/:id", productController.getProductById); // get single product with images

// Admin CRUD
router.post("/", authMiddleware, adminOnly, multer.array('images', 10), productController.createProduct);
router.put("/:id", authMiddleware, adminOnly, multer.array('images', 10), productController.updateProduct);
router.delete("/:id", authMiddleware, adminOnly, productController.deleteProduct);
router.delete("/image/:imageId", authMiddleware, adminOnly, productController.deleteProductImage);

router.post('/upload-image', multer.single('image'), (req, res) => {
  console.log('Upload route hit');
  console.log('req.file:', req.file);
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

module.exports = router;
