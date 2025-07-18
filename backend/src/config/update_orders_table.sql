-- Add customer information columns to orders table
ALTER TABLE orders 
ADD COLUMN order_id VARCHAR(50) UNIQUE AFTER id,
ADD COLUMN payment_method VARCHAR(50) AFTER status,
ADD COLUMN customer_name VARCHAR(255) AFTER payment_method,
ADD COLUMN customer_email VARCHAR(255) AFTER customer_name,
ADD COLUMN customer_phone VARCHAR(20) AFTER customer_email,
ADD COLUMN customer_address TEXT AFTER customer_phone,
ADD COLUMN customer_city VARCHAR(100) AFTER customer_address,
ADD COLUMN customer_postal_code VARCHAR(20) AFTER customer_city;

-- Update existing orders to have a default order_id if NULL
UPDATE orders SET order_id = CONCAT('ORD-', id, '-', UNIX_TIMESTAMP()) WHERE order_id IS NULL; 