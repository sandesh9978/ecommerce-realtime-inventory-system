-- Create restock_alerts table
CREATE TABLE IF NOT EXISTS restock_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Add index for better performance
CREATE INDEX idx_restock_alerts_product ON restock_alerts(product_id);
CREATE INDEX idx_restock_alerts_user ON restock_alerts(user_id);
CREATE INDEX idx_restock_alerts_notified ON restock_alerts(notified); 