const db = require("../config/db");
const path = require('path');
const { sendLowStockNotification, sendOutOfStockNotification } = require(path.join(__dirname, "adminNotification"));
const Order = require("../models/Order");

// CREATE ORDER
exports.createOrder = (req, res) => {
    const { userId, products, paymentMethod, userInfo, orderId } = req.body;
    if (!userId || !products || !products.length || !paymentMethod) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // Calculate total amount from products
    const totalAmount = products.reduce((total, product) => {
        return total + (product.price * product.quantity);
    }, 0);

    // Generate order ID if not provided
    const finalOrderId = orderId || `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Validate that all products exist in the database
    let validatedCount = 0;
    const validateNext = (index) => {
        if (index >= products.length) {
            // All products validated, proceed with order creation
            createOrder();
            return;
        }

        const product = products[index];
        const productId = product.product_id || product.productId;

        db.query("SELECT id FROM products WHERE id = ?", [productId], (err, result) => {
            if (err) {
                console.error("Error validating product:", err);
                return res.status(500).json({ message: "Database error during validation" });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    message: `Product with ID ${productId} not found in database`
                });
            }

            validatedCount++;
            validateNext(index + 1);
        });
    };

    const createOrder = () => {
        db.query("START TRANSACTION", (err) => {
            if (err) {
                console.error("Error starting transaction:", err);
                return res.status(500).json({ message: "Database error" });
            }

            // Insert order with user information
            const orderData = {
                user_id: userId,
                total_amount: totalAmount,
                status: "pending", // changed from "Pending" to "pending"
                payment_method: paymentMethod,
                order_id: finalOrderId,
                customer_name: userInfo?.fullName || "",
                customer_email: userInfo?.email || "",
                customer_phone: userInfo?.phoneNumber || "",
                customer_address: userInfo?.address || "",
                customer_city: userInfo?.city || "",
                customer_postal_code: userInfo?.postalCode || ""
            };

            db.query(
                "INSERT INTO orders SET ?",
                orderData,
                (err, orderResult) => {
                    if (err) {
                        return db.query("ROLLBACK", () => {
                            console.error("❌ Order creation failed:", err);
                            res.status(500).json({
                                success: false,
                                message: err.message || "Order creation failed."
                            });
                        });
                    }

                    const orderId = orderResult.insertId;
                    const orderItemsData = products.map((product) => [
                        orderId,
                        product.product_id || product.productId,
                        product.quantity,
                        product.price,
                    ]);

                    // Insert order items
                    db.query(
                        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?",
                        [orderItemsData],
                        (err) => {
                            if (err) {
                                return db.query("ROLLBACK", () => {
                                    console.error("❌ Order items creation failed:", err);
                                    res.status(500).json({
                                        success: false,
                                        message: err.message || "Order items creation failed."
                                    });
                                });
                            }

                            // Update product stock
                            let stockUpdatedCount = 0;
                            const updateStockNext = (index) => {
                                if (index >= orderItemsData.length) {
                                    // All stock updates complete, commit transaction
                                    db.query("COMMIT", (err) => {
                                        if (err) {
                                            console.error("Error committing transaction:", err);
                                            return res.status(500).json({ message: "Database error" });
                                        }
                                        res.status(201).json({
                                            success: true,
                                            orderId: finalOrderId,
                                            message: "Order created successfully"
                                        });
                                    });
                                    return;
                                }

                                const item = orderItemsData[index];
                                db.query(
                                    "UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?",
                                    [item[2], item[1]],
                                    (err) => {
                                        if (err) {
                                            console.error("Error updating stock:", err);
                                        }
                                        stockUpdatedCount++;
                                        updateStockNext(index + 1);
                                    }
                                );
                            };

                            updateStockNext(0);
                        }
                    );
                }
            );
        });
    };

    // Start validation process
    validateNext(0);
};

// GET ALL ORDERS FOR A USER (BY TOKEN ID)
exports.getUserOrders = (req, res) => {
    const userId = req.user.id;

    const sql = `
      SELECT 
      o.id AS id, 
      o.order_id,
      o.total_amount, 
      o.created_at, 
      o.status,
      o.payment_method,
      o.customer_name,
      o.customer_email,
      o.customer_phone,
      o.customer_address,
      o.customer_city,
      o.customer_postal_code,
      COALESCE(
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price', oi.price,
            'name', p.model
          )
        ), '[]'
        ) AS items
      FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
    GROUP BY o.id, o.order_id, o.total_amount, o.created_at, o.status, o.payment_method, o.customer_name, o.customer_email, o.customer_phone, o.customer_address, o.customer_city, o.customer_postal_code
      ORDER BY o.created_at DESC
  `;

    db.query(sql, [userId], (err, orders) => {
        if (err) {
            console.error("❌ Error fetching user orders:", err);
            return res.status(500).json({ success: false, message: "Error fetching orders" });
        }

        const formatted = orders.map((order) => ({
            ...order,
            items: order.items ? JSON.parse(order.items) : [],
        }));

        res.json(formatted);
    });
};

// Place order
exports.placeOrder = (req, res) => {
    const { items, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: "No items in order" });
    }

    // Calculate total amount
    const totalAmount = items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);

    // Check stock availability and create order
    let checkedCount = 0;
    const checkStockNext = (index) => {
        if (index >= items.length) {
            // All items checked, create order
            createOrder();
            return;
        }

        const item = items[index];
        const productId = item.productId || item.product_id;

        db.query("SELECT * FROM products WHERE id = ?", [productId], (err, product) => {
            if (err) {
                console.error("Error checking product:", err);
                return res.status(500).json({ message: "Database error" });
            }

            if (product.length === 0) {
                return res.status(404).json({ message: `Product ${productId} not found` });
            }

            if (product[0].stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product[0].name}. Available: ${product[0].stock}`
                });
            }

            checkedCount++;
            checkStockNext(index + 1);
        });
    };

    const createOrder = () => {
        db.query("START TRANSACTION", (err) => {
            if (err) {
                console.error("Error starting transaction:", err);
                return res.status(500).json({ message: "Database error" });
            }

            // Create order
            db.query(
                "INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_method) VALUES (?, ?, ?, ?, ?)",
                [userId, totalAmount, "pending", JSON.stringify(shippingAddress), paymentMethod],
                (err, orderResult) => {
                    if (err) {
                        return db.query("ROLLBACK", () => {
                            console.error("Error creating order:", err);
                            res.status(500).json({ message: "Failed to create order" });
                        });
                    }

                    const orderId = orderResult.insertId;

                    // Add order items
                    let itemsAddedCount = 0;
                    const addItemsNext = (index) => {
                        if (index >= items.length) {
                            // All items added, update stock and clear cart
                            updateStockAndClearCart();
                            return;
                        }

                        const item = items[index];
                        const productId = item.productId || item.product_id;

                        db.query(
                            "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
                            [orderId, productId, item.quantity, item.price],
                            (err) => {
                                if (err) {
                                    return db.query("ROLLBACK", () => {
                                        console.error("Error adding order item:", err);
                                        res.status(500).json({ message: "Failed to add order item" });
                                    });
                                }

                                itemsAddedCount++;
                                addItemsNext(index + 1);
                            }
                        );
                    };

                    const updateStockAndClearCart = () => {
                        let stockUpdatedCount = 0;
                        const updateStockNext = (index) => {
                            if (index >= items.length) {
                                // All stock updated, clear cart and commit
                                db.query("DELETE FROM cart WHERE user_id = ?", [userId], (err) => {
                                    if (err) {
                                        console.error("Error clearing cart:", err);
                                    }

                                    db.query("COMMIT", (err) => {
                                        if (err) {
                                            console.error("Error committing transaction:", err);
                                            return res.status(500).json({ message: "Database error" });
                                        }

                                        res.status(201).json({
                                            message: "Order placed successfully",
                                            orderId: orderId
                                        });
                                    });
                                });
                                return;
                            }

                            const item = items[index];
                            const productId = item.productId || item.product_id;

                            db.query(
                                "UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?",
                                [item.quantity, productId],
                                (err) => {
                                    if (err) {
                                        console.error("Error updating stock:", err);
                                    }
                                    stockUpdatedCount++;
                                    updateStockNext(index + 1);
                                }
                            );
                        };

                        updateStockNext(0);
                    };

                    addItemsNext(0);
                }
            );
        });
    };

    // Start stock checking process
    checkStockNext(0);
};

// CANCEL ORDER (user)
exports.cancelOrder = async (req, res) => {
    const userId = req.user.id;
    const orderId = req.params.id;

    try {
        // Find the order and check ownership
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.user_id !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        if (["shipped", "delivered", "completed", "canceled", "cancelled"].includes(order.status.toLowerCase())) {
            return res.status(400).json({ message: `Order cannot be canceled (current status: ${order.status})` });
        }
        await Order.updateStatus(orderId, "pending_cancellation");
        res.json({ message: "Order cancellation requested and pending admin approval." });
    } catch (err) {
        console.error("Error canceling order:", err);
        res.status(500).json({ message: "Failed to cancel order" });
    }
};

// ADMIN: Approve order cancellation
exports.approveCancellation = async (req, res) => {
    const orderId = req.params.id;
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.status !== "pending_cancellation") {
            return res.status(400).json({ message: "Order is not pending cancellation" });
        }
        // Start transaction
        db.query("START TRANSACTION", (err) => {
            if (err) {
                console.error("Error starting transaction:", err);
                return res.status(500).json({ message: "Database error" });
            }
            // 1. Update order status
            db.query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [orderId], (err) => {
                if (err) {
                    return db.query("ROLLBACK", () => {
                        console.error("Error updating order status:", err);
                        res.status(500).json({ message: "Failed to update order status" });
                    });
                }
                // 2. Restore stock
                db.query("SELECT product_id, quantity FROM order_items WHERE order_id = ?", [orderId], (err, items) => {
                    if (err) {
                        return db.query("ROLLBACK", () => {
                            console.error("Error fetching items for stock restoration:", err);
                            res.status(500).json({ message: "Failed to restore stock" });
                        });
                    }
                    let done = 0;
                    if (items.length === 0) {
                        // No items, just commit
                        return db.query("COMMIT", (err) => {
                            if (err) {
                                return db.query("ROLLBACK", () => {
                                    res.status(500).json({ message: "Database error on commit" });
                                });
                            }
                            res.json({ message: "Order cancellation approved and stock restored (no items)." });
                        });
                    }
                    items.forEach(item => {
                        db.query("UPDATE products SET stock = stock + ? WHERE id = ?", [item.quantity, item.product_id], (err) => {
                            if (err) {
                                return db.query("ROLLBACK", () => {
                                    console.error("Error restoring stock:", err);
                                    res.status(500).json({ message: "Failed to restore stock" });
                                });
                            }
                            done++;
                            if (done === items.length) {
                                db.query("COMMIT", (err) => {
                                    if (err) {
                                        return db.query("ROLLBACK", () => {
                                            res.status(500).json({ message: "Database error on commit" });
                                        });
                                    }
                                    res.json({ message: "Order cancellation approved and stock restored." });
                                });
                            }
                        });
                    });
                });
            });
        });
    } catch (err) {
        console.error("Error approving cancellation:", err);
        res.status(500).json({ message: "Failed to approve cancellation" });
    }
};

// ADMIN: Reject order cancellation
exports.rejectCancellation = async (req, res) => {
    const orderId = req.params.id;
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.status !== "pending_cancellation") {
            return res.status(400).json({ message: "Order is not pending cancellation" });
        }
        await Order.updateStatus(orderId, "processing"); // or previous status if tracked
        res.json({ message: "Order cancellation rejected and set to processing." });
    } catch (err) {
        console.error("Error rejecting cancellation:", err);
        res.status(500).json({ message: "Failed to reject cancellation" });
    }
};

exports.deleteOrderItem = (req, res) => {
    const { orderId, productId } = req.params;
    db.query(
        "DELETE FROM order_items WHERE order_id = ? AND product_id = ?",
        [orderId, productId],
        (err, result) => {
            if (err) return res.status(500).json({ message: "Failed to delete order item" });
            if (result.affectedRows === 0) return res.status(404).json({ message: "Order item not found" });
            res.json({ message: "Order item deleted" });
        }
    );
};