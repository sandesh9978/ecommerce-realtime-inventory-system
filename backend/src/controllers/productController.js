const Product = require("../models/Product");
const db = require('../config/db');
const { checkAndNotifyRestock } = require("./restockAlertController");
const fs = require('fs');
const path = require('path');

// Seed default products
exports.seedProducts = (req, res) => {
    const defaultProducts = [
        { brand: "Samsung", model: "Galaxy S24 Ultra (12+512GB)", price: 199999, stock: 10, status: "Out of stock", image: "https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s24-ultra-sm-s928bzkgmea-thumb-539207237?" },
        { brand: "Samsung", model: "Galaxy S25 (12+128GB)", price: 104999, stock: 5, status: "New", image: "https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s25-sm-s921bzkgmea-thumb-539207237?" },
        { brand: "Samsung", model: "Galaxy S25 (12+256GB)", price: 114999, stock: 8, status: "New", image: "https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s25-sm-s921bzkgmea-thumb-539207237?" },
        { brand: "Samsung", model: "Galaxy S25+ (12+256GB)", price: 141999, stock: 3, status: "New", image: "https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s25plus-sm-s926bzkgmea-thumb-539207237?" },
        { brand: "Samsung", model: "Galaxy S25 Ultra (12+256GB)", price: 184999, stock: 7, status: "New", image: "https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s24-ultra-sm-s928bzkgmea-thumb-539207237?" },
        { brand: "Samsung", model: "Galaxy S25 Ultra (12+512GB)", price: 199999, stock: 12, status: "New", image: "https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s24-ultra-sm-s928bzkgmea-thumb-539207237?" },
        { brand: "Apple", model: "iPhone 16 Pro (128GB)", price: 168700, oldPrice: 178900, stock: 5, status: "New", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-model-unselect-gallery-1-202309?wid=5120&hei=2880&fmt=jpeg&qlt=80&.v=1692924062367" },
        { brand: "Apple", model: "iPhone 16 Pro (256GB)", price: 188200, oldPrice: 198000, stock: 5, status: "New", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-model-unselect-gallery-1-202309?wid=5120&hei=2880&fmt=jpeg&qlt=80&.v=1692924062367" },
        { brand: "Apple", model: "iPhone 16 Pro (512GB)", price: 226600, oldPrice: 237500, stock: 5, status: "New", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-model-unselect-gallery-1-202309?wid=5120&hei=2880&fmt=jpeg&qlt=80&.v=1692924062367" },
        { brand: "Apple", model: "iPhone 16 Pro (1TB)", price: 265200, oldPrice: 275100, stock: 5, status: "New", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-model-unselect-gallery-1-202309?wid=5120&hei=2880&fmt=jpeg&qlt=80&.v=1692924062367" },
        { brand: "Apple", model: "iPhone 16 Pro Max (256GB)", price: 197000, oldPrice: 207000, stock: 5, status: "New", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-max-model-unselect-gallery-1-202309?wid=5120&hei=2880&fmt=jpeg&qlt=80&.v=1692924062367" },
        { brand: "Apple", model: "iPhone 16 Pro Max (512GB)", price: 235500, oldPrice: 245500, stock: 5, status: "New", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-max-model-unselect-gallery-1-202309?wid=5120&hei=2880&fmt=jpeg&qlt=80&.v=1692924062367" },
        { brand: "Apple", model: "iPhone 16 Pro Max (1TB)", price: 274000, oldPrice: 284000, stock: 5, status: "New", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-max-model-unselect-gallery-1-202309?wid=5120&hei=2880&fmt=jpeg&qlt=80&.v=1692924062367" },
    ];

    db.query("SELECT COUNT(*) as count FROM products", (err, result) => {
        if (err) {
            console.error("Error checking existing products:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (result[0].count > 0) {
            return res.status(400).json({ message: "Products already exist in database" });
        }

        let insertedCount = 0;
        const insertNext = (index) => {
            if (index >= defaultProducts.length) {
                return res.json({
                    message: "Default products seeded successfully",
                    count: insertedCount
                });
            }

            const product = defaultProducts[index];
            db.query(
                "INSERT INTO products (brand, model, price, oldPrice, stock, status, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [product.brand, product.model, product.price, product.oldPrice || null, product.stock, product.status, product.image],
                (err) => {
                    if (err) {
                        console.error("Error inserting product:", err);
                        return res.status(500).json({ message: "Failed to seed products" });
                    }
                    insertedCount++;
                    insertNext(index + 1);
                }
            );
        };
        insertNext(0);
    });
};

exports.getProductById = (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM products WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "DB error" });
        if (result.length === 0) return res.status(404).json({ message: "Product not found" });

        res.json(result[0]);
    });
};

exports.getAllProducts = (req, res) => {
    const query = `
    SELECT 
      p.*, 
      (SELECT ROUND(AVG(r.rating),1) FROM reviews r WHERE r.productId = p.id) as avgRating 
    FROM products p
  `;

    db.query(query, (err, result) => {
        if (err) return res.status(500).json({ message: "Failed to fetch products" });
        res.json(result);
    });
};

exports.searchProducts = (req, res) => {
    const { keyword = '', category = '', minPrice = 0, maxPrice = 1000000 } = req.query;
    let sql = "SELECT * FROM products WHERE name LIKE ? AND price BETWEEN ? AND ?";
    let params = [`%${keyword}%`, minPrice, maxPrice];

    if (category) {
        sql += " AND category = ?";
        params.push(category);
    }

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ message: "Search failed" });
        res.json({ products: results });
    });
};

// Update product stock (admin only)
exports.updateProductStock = (req, res) => {
    const { productId } = req.params;
    const { stock } = req.body;

    if (!stock || stock < 0) {
        return res.status(400).json({ message: "Valid stock quantity is required" });
    }

    const sql = "UPDATE products SET stock = ? WHERE id = ?";
    db.query(sql, [stock, productId], (err, result) => {
        if (err) {
            console.error("Error updating product stock:", err);
            return res.status(500).json({ message: "Failed to update product stock" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (stock > 0) {
            const getProductSql = "SELECT name FROM products WHERE id = ?";
            db.query(getProductSql, [productId], (err, productResult) => {
                if (!err && productResult.length > 0) {
                    checkAndNotifyRestock(productId, productResult[0].name);
                }
            });
        }

        res.json({ message: "Product stock updated successfully" });
    });
};

// Create a new product (admin only)
exports.createProduct = (req, res) => {
    let { brand, model, price, oldPrice, status, details, stock, costPrice } = req.body;
    let imageUrl = null;

    if (req.files && req.files.length > 0) {
        imageUrl = `uploads/${req.files[0].filename}`;
    } else if (req.body.image) {
        imageUrl = req.body.image;
    }

    if (!brand || !model || !price) {
        return res.status(400).json({ message: "Brand, model, and price are required" });
    }
    
    if (costPrice === '') costPrice = null;

    db.query(
        "INSERT INTO products (brand, model, price, oldPrice, status, details, image, stock, costPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [brand, model, price, oldPrice || null, status || null, details || null, imageUrl, stock || 0, costPrice],
        (err, result) => {
            if (err) {
                console.error("Error inserting product:", err);
                return res.status(500).json({ message: "Failed to save product" });
            }
            res.status(201).json({ success: true, id: result.insertId, image: imageUrl });
        }
    );
};

// Update an existing product (admin only)
exports.updateProduct = (req, res) => {
    const productId = req.params.id;
    let { brand, model, price, oldPrice, status, stock, details, costPrice } = req.body;
    let imageUrl = undefined;
    
    if (req.files && req.files.length > 0) {
        imageUrl = `uploads/${req.files[0].filename}`;
    }
    
    if (costPrice === '') costPrice = null;
    
    const fields = [];
    const values = [];
    if (brand !== undefined) { fields.push('brand = ?'); values.push(brand); }
    if (model !== undefined) { fields.push('model = ?'); values.push(model); }
    if (price !== undefined) { fields.push('price = ?'); values.push(price); }
    if (oldPrice !== undefined) { fields.push('oldPrice = ?'); values.push(oldPrice); }
    if (status !== undefined) { fields.push('status = ?'); values.push(status); }
    if (stock !== undefined) { fields.push('stock = ?'); values.push(stock); }
    if (details !== undefined) { fields.push('details = ?'); values.push(details); }
    if (costPrice !== undefined) { fields.push('costPrice = ?'); values.push(costPrice); }
    if (imageUrl !== undefined) { fields.push('image = ?'); values.push(imageUrl); }
    if (fields.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
    }
    
    const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
    values.push(productId);
    
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Failed to update product:", err);
            return res.status(500).json({ message: 'Failed to update product', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ success: true, message: 'Product updated successfully', image: imageUrl });
    });
};

// Delete a product (admin only)
exports.deleteProduct = (req, res) => {
    const productId = req.params.id;
    const sql = "DELETE FROM products WHERE id = ?";
    db.query(sql, [productId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Failed to delete product", error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({ success: true, message: "Product deleted successfully" });
    });
};

// Delete a product image (admin only)
exports.deleteProductImage = (req, res) => {
    const imageId = req.params.imageId;

    db.query("SELECT image_path FROM product_images WHERE id = ?", [imageId], (err, result) => {
        if (err) return res.status(500).json({ message: "Failed to delete image" });
        if (result.length === 0) return res.status(404).json({ message: "Image not found" });

        const imagePath = result[0].image_path;
        
        db.query("DELETE FROM product_images WHERE id = ?", [imageId], (err, dbResult) => {
            if (err) return res.status(500).json({ message: "Failed to delete image from database" });

            // Attempt to delete the file from the server
            // Note: This path assumes 'uploads' is two levels up from the controllers directory.
            // If your 'uploads' folder is directly in 'backend', then it should be path.join(__dirname, '..', imagePath);
            const fullPath = path.join(__dirname, '..', '..', imagePath); 
            fs.unlink(fullPath, (fsErr) => {
                if (fsErr) {
                    console.error("Failed to delete file from disk:", fsErr);
                }
                res.json({ message: "Image deleted successfully" });
            });
        });
    });
};