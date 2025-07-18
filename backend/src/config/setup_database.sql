-- Complete Database Setup Script for E-commerce Platform
-- Run this script to create all necessary tables and columns

USE ecommerce;

-- Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_address TEXT,
    customer_city VARCHAR(100),
    customer_postal_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create order_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(100),
    model VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    oldPrice DECIMAL(10,2),
    stock INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    image TEXT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    fullName VARCHAR(255),
    dob DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create cart table if it doesn't exist
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (user_id, product_id)
);

-- Create wishlist table if it doesn't exist
CREATE TABLE IF NOT EXISTS wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist_item (user_id, product_id)
);

-- Create activity_log table for admin/user actions
CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Add missing columns to existing orders table if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_id VARCHAR(50) UNIQUE AFTER id,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) AFTER status,
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255) AFTER payment_method,
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255) AFTER customer_name,
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20) AFTER customer_email,
ADD COLUMN IF NOT EXISTS customer_address TEXT AFTER customer_phone,
ADD COLUMN IF NOT EXISTS customer_city VARCHAR(100) AFTER customer_address,
ADD COLUMN IF NOT EXISTS customer_postal_code VARCHAR(20) AFTER customer_city;

-- Update existing orders to have a default order_id if NULL
UPDATE orders SET order_id = CONCAT('ORD-', id, '-', UNIX_TIMESTAMP()) WHERE order_id IS NULL;

-- Insert some sample products if the table is empty
INSERT IGNORE INTO products (id, brand, model, price, stock, status) VALUES
(1, 'Apple', 'iPhone 14', 129999, 10, 'active'),
(2, 'Samsung', 'Galaxy S24 Ultra', 199999, 5, 'active'),
(3, 'Nike', 'Air Max', 14999, 8, 'active'),
(4, 'Google', 'Pixel 8 Pro', 99999, 3, 'active'),
(5, 'OnePlus', 'OnePlus 12', 89999, 7, 'active'),
(6, 'Xiaomi', 'Redmi Note 13', 29999, 12, 'active');

-- Show the table structures
DESCRIBE orders;
DESCRIBE order_items;
DESCRIBE products;
DESCRIBE users;
DESCRIBE cart;
DESCRIBE wishlist; 

-- Create product_images table for multiple images per product
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
); 