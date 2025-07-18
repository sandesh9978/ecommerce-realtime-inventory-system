const Cart = require("../models/Cart");

exports.addToCart = (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  if (!productId || !quantity) {
    return res.status(400).json({ message: "Missing productId or quantity" });
  }

  Cart.addItem(userId, productId, quantity, (err) => {
    if (err) return res.status(500).json({ message: "DB Error" });
    res.json({ message: "Item added to cart" });
  });
};

exports.getCart = (req, res) => {
  const userId = req.user.id;

  Cart.getItems(userId, (err, items) => {
    if (err) return res.status(500).json({ message: "DB Error" });
    res.json(items);
  });
};
exports.removeFromCart = (req, res) => {
  const cartId = req.params.id;
  const userId = req.user.id;

  if (!cartId) {
    return res.status(400).json({ message: "Cart ID missing" });
  }

  Cart.deleteItem(cartId, userId, (err) => {
    if (err) return res.status(500).json({ message: "DB Error" });
    res.json({ message: "Item removed from cart" });
  });
};
const db = require("../config/db");

exports.checkout = (req, res) => {
  const userId = req.user.id;

  // Step 1: Get all cart items
  const getCartSQL = `
    SELECT products.price, cart.quantity
    FROM cart
    JOIN products ON cart.product_id = products.id
    WHERE cart.user_id = ?
  `;

  db.query(getCartSQL, [userId], (err, items) => {
    if (err) return res.status(500).json({ message: "DB Error - cart read" });

    if (items.length === 0) return res.status(400).json({ message: "Cart is empty" });

    const totalAmount = items.reduce((sum, item) => {
      return sum + parseFloat(item.price) * item.quantity;
    }, 0);

    // Step 2: Save to orders
    const insertOrder = "INSERT INTO orders (user_id, total_amount) VALUES (?, ?)";
    db.query(insertOrder, [userId, totalAmount], (err2) => {
      if (err2) return res.status(500).json({ message: "DB Error - order save" });

      // Step 3: Clear cart
      Cart.clearCart(userId, (err3) => {
        if (err3) return res.status(500).json({ message: "DB Error - clear cart" });

        res.json({ message: "Checkout successful", total: totalAmount });
      });
    });
  });
};
exports.checkout = (req, res) => {
  const userId = req.user.id;

  const getCartSQL = `
    SELECT cart.product_id, cart.quantity, products.price
    FROM cart
    JOIN products ON cart.product_id = products.id
    WHERE cart.user_id = ?
  `;

  db.query(getCartSQL, [userId], (err, cartItems) => {
    if (err) return res.status(500).json({ message: "DB Error - cart read" });

    if (cartItems.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.quantity * parseFloat(item.price),
      0
    );

    const insertOrderSQL = `INSERT INTO orders (user_id, total_amount) VALUES (?, ?)`;
    db.query(insertOrderSQL, [userId, totalAmount], (err2, orderResult) => {
      if (err2) return res.status(500).json({ message: "DB Error - order create" });

      const orderId = orderResult.insertId;

      // Prepare order_items
      const orderItemsData = cartItems.map(item => [
        orderId,
        item.product_id,
        item.quantity,
        item.price
      ]);

      const insertItemsSQL = `
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES ?
      `;

      db.query(insertItemsSQL, [orderItemsData], (err3) => {
        if (err3) return res.status(500).json({ message: "DB Error - saving items" });

        // Clear cart
        Cart.clearCart(userId, (err4) => {
          if (err4) return res.status(500).json({ message: "DB Error - clear cart" });

          res.json({
            message: "Order placed successfully!",
            orderId,
            total: totalAmount
          });
        });
      });
    });
  });
};
