const AdminNotification = require("../models/AdminNotification");
const nodemailer = require("nodemailer");

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send admin notification for low stock
const sendLowStockNotification = (productId, productName, currentStock, threshold = 5) => {
    const message = `Product "${productName}" is running low on stock. Current stock: ${currentStock}, Threshold: ${threshold}`;
    const priority = currentStock === 0 ? "high" : "medium";

    AdminNotification.exists("low_stock", productId, (err, result) => {
        if (err) {
            console.error("Error checking existing notification:", err);
            return;
        }

        if (result.length === 0) {
            AdminNotification.add("low_stock", productId, message, priority, (err) => {
                if (err) {
                    console.error("Error adding admin notification:", err);
                    return;
                }

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
                    subject: `🚨 Low Stock Alert: ${productName}`,
                    html: `
                        <h2>Low Stock Alert</h2>
                        <p><strong>Product:</strong> ${productName}</p>
                        <p><strong>Current Stock:</strong> ${currentStock}</p>
                        <p><strong>Threshold:</strong> ${threshold}</p>
                        <p><strong>Status:</strong> ${currentStock === 0 ? "OUT OF STOCK" : "LOW STOCK"}</p>
                        <br>
                        <p>Please restock this product to avoid customer dissatisfaction.</p>
                        <br>
                        <p>Best regards,<br>Inventory Management System</p>
                    `
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error("Email send error:", error);
                    } else {
                        console.log("Low stock notification sent:", info.messageId);
                    }
                });
            });
        }
    });
};

// Send admin notification for out of stock
const sendOutOfStockNotification = (productId, productName) => {
    const message = `Product "${productName}" is completely out of stock.`;
    const priority = "high";

    AdminNotification.exists("out_of_stock", productId, (err, result) => {
        if (err) {
            console.error("Error checking existing notification:", err);
            return;
        }

        if (result.length === 0) {
            AdminNotification.add("out_of_stock", productId, message, priority, (err) => {
                if (err) {
                    console.error("Error adding admin notification:", err);
                    return;
                }

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
                    subject: `🚨 URGENT: ${productName} is OUT OF STOCK`,
                    html: `
                        <h2>🚨 OUT OF STOCK ALERT</h2>
                        <p><strong>Product:</strong> ${productName}</p>
                        <p><strong>Status:</strong> COMPLETELY OUT OF STOCK</p>
                        <p><strong>Priority:</strong> HIGH</p>
                        <br>
                        <p>This product needs immediate attention. Customers cannot purchase it.</p>
                        <p>Please restock immediately to avoid losing sales.</p>
                        <br>
                        <p>Best regards,<br>Inventory Management System</p>
                    `
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error("Email send error:", error);
                    } else {
                        console.log("Out of stock notification sent:", info.messageId);
                    }
                });
            });
        }
    });
};

// Get all admin notifications
const getAdminNotifications = (req, res) => {
    AdminNotification.getAll((err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
};

// Get unread notifications
const getUnreadNotifications = (req, res) => {
    AdminNotification.getUnread((err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
};

// Mark notification as read
const markAsRead = (req, res) => {
    const { notificationId } = req.params;

    AdminNotification.markAsRead(notificationId, (err) => {
        if (err) return res.status(500).json({ message: "Failed to mark as read" });
        res.json({ message: "Notification marked as read" });
    });
};

// Mark all notifications as read
const markAllAsRead = (req, res) => {
    AdminNotification.markAllAsRead((err) => {
        if (err) return res.status(500).json({ message: "Failed to mark all as read" });
        res.json({ message: "All notifications marked as read" });
    });
};

// Delete notification
const deleteNotification = (req, res) => {
    const { notificationId } = req.params;

    AdminNotification.delete(notificationId, (err) => {
        if (err) return res.status(500).json({ message: "Failed to delete notification" });
        res.json({ message: "Notification deleted successfully" });
    });
};

// Get notification count
const getNotificationCount = (req, res) => {
    AdminNotification.getCount((err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ count: result[0].count });
    });
};

// Explicitly export all functions at the end
module.exports = {
    sendLowStockNotification,
    sendOutOfStockNotification,
    getAdminNotifications,
    getUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationCount,
};