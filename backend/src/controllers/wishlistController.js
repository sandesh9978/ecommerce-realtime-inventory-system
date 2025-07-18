const Wishlist = require("../models/Wishlist");

exports.addToWishlist = (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  if (!productId) return res.status(400).json({ message: "Missing productId" });

  Wishlist.add(userId, productId, (err) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Added to wishlist ❤️" });
  });
};

exports.getWishlist = (req, res) => {
  const userId = req.user.id;

  Wishlist.getAll(userId, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
};

exports.removeFromWishlist = (req, res) => {
  const wishlistId = req.params.id;
  const userId = req.user.id;

  Wishlist.remove(wishlistId, userId, (err) => {
    if (err) return res.status(500).json({ message: "Failed to remove" });
    res.json({ message: "Removed from wishlist" });
  });
};
