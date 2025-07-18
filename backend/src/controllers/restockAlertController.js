const RestockAlert = require("../models/RestockAlert");
const nodemailer = require("nodemailer");

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Add restock alert
exports.addRestockAlert = (req, res) => {
  const { productId, email } = req.body;
  const userId = req.user.id;

  if (!productId || !email) {
    return res.status(400).json({ message: "Product ID and email are required" });
  }

  // Check if user already has an alert for this product
  RestockAlert.exists(userId, productId, (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    
    if (result.length > 0) {
      return res.status(400).json({ message: "You already have a restock alert for this product" });
    }

    // Add new alert
    RestockAlert.add(userId, productId, email, (err) => {
      if (err) return res.status(500).json({ message: "Failed to add restock alert" });
      res.json({ message: "Restock alert added successfully" });
    });
  });
};

// Get user's restock alerts
exports.getUserRestockAlerts = (req, res) => {
  const userId = req.user.id;

  RestockAlert.getByUser(userId, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
};

// Remove restock alert
exports.removeRestockAlert = (req, res) => {
  const { alertId } = req.params;
  const userId = req.user.id;

  RestockAlert.remove(alertId, userId, (err) => {
    if (err) return res.status(500).json({ message: "Failed to remove alert" });
    res.json({ message: "Restock alert removed successfully" });
  });
};

// Send restock notification emails
exports.sendRestockNotifications = (productId, productName) => {
  RestockAlert.getAlertsForRestockedProduct(productId, (err, alerts) => {
    if (err) {
      console.error("Error fetching restock alerts:", err);
      return;
    }

    if (alerts.length === 0) return;

    const alertIds = alerts.map(alert => alert.id);
    const emailPromises = alerts.map(alert => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: alert.user_email,
        subject: `${productName} is back in stock!`,
        html: `
          <h2>Great news! ${productName} is back in stock!</h2>
          <p>We're excited to let you know that ${productName} is now available for purchase.</p>
          <p>Don't miss out - head to our website to place your order!</p>
          <br>
          <p>Best regards,<br>Your E-Commerce Team</p>
        `
      };

      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Email send error:", error);
            reject(error);
          } else {
            console.log("Restock notification sent:", info.messageId);
            resolve(info);
          }
        });
      });
    });

    // Send all emails
    Promise.all(emailPromises)
      .then(() => {
        // Mark alerts as notified
        RestockAlert.markAsNotified(alertIds, (err) => {
          if (err) console.error("Error marking alerts as notified:", err);
          else console.log(`Marked ${alertIds.length} alerts as notified`);
        });
      })
      .catch(err => {
        console.error("Error sending restock notifications:", err);
      });
  });
};

// Check and send restock notifications for a product
exports.checkAndNotifyRestock = (productId, productName) => {
  RestockAlert.getAlertsForRestockedProduct(productId, (err, alerts) => {
    if (err) {
      console.error("Error checking restock alerts:", err);
      return;
    }

    if (alerts.length > 0) {
      console.log(`Sending ${alerts.length} restock notifications for ${productName}`);
      exports.sendRestockNotifications(productId, productName);
    }
  });
}; 