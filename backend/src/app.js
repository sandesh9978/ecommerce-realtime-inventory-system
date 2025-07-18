const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const app = express();

// Enable proxy trust if behind a reverse proxy
app.enable("trust proxy");

// HTTPS redirect (production only)
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Middleware
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(helmet());
app.use(express.json());

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/admin/products", require("./routes/adminProducts"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/returns", require("./routes/returnRoutes"));
app.use("/api/activity", require("./routes/activityRoutes"));
app.use("/api/user-notifications", require("./routes/userNotificationRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));

// Default route
app.get("/", (req, res) => {
  res.send("✅ Server is running...");
});

module.exports = app;

// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");
// const path = require("path");

// const app = express(); // Must be declared before any app.use()

// // Enforce HTTPS in production
// if (process.env.NODE_ENV === "production") {
//   app.use((req, res, next) => {
//     if (req.headers["x-forwarded-proto"] !== "https") {
//       return res.redirect(`https://${req.headers.host}${req.url}`);
//     }
//     next();
//   });
// }

// // ✅ Middleware
// const corsOptions = {
//   origin: process.env.CLIENT_URL || 'http://localhost:5173', // Your frontend
//   credentials: true
// };

// app.use(cors(corsOptions));
// app.use(helmet());
// app.options("*", cors(corsOptions));
// app.use(express.json());

// // ✅ Static Files (uploads)
// app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// // ✅ Routes
// const authRoutes = require("./routes/authRoutes");
// const productRoutes = require("./routes/productRoutes");
// const cartRoutes = require("./routes/cartRoutes");
// const wishlistRoutes = require("./routes/wishlistRoutes");
// const adminRoutes = require("./routes/adminRoutes");
// const orderRoutes = require("./routes/orderRoutes");
// const returnRoutes = require("./routes/returnRoutes");
// const activityRoutes = require("./routes/activityRoutes");
// const userNotificationRoutes = require("./routes/userNotificationRoutes");
// const feedbackRoutes = require("./routes/feedbackRoutes");
// const adminProductsRoutes = require("./routes/adminProducts");

// app.use("/api/auth", authRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/cart", cartRoutes);
// app.use("/api/wishlist", wishlistRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/admin/products", adminProductsRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/returns", returnRoutes);
// app.use("/api/activity", activityRoutes);
// app.use("/api/user-notifications", userNotificationRoutes);
// app.use("/api/feedback", feedbackRoutes);

// // ✅ Default route
// app.get("/", (req, res) => {
//   res.send("✅ Server is running...");
// });

// module.exports = app;

// // const express = require("express");
// // const cors = require("cors");
// // const helmet = require("helmet");
// // const path = require("path");
// // if (process.env.NODE_ENV === "production") {
// //   app.use((req, res, next) => {
// //     if (req.headers["x-forwarded-proto"] !== "https") {
// //       return res.redirect(`https://${req.headers.host}${req.url}`);
// //     }
// //     next();
// //   });
// // }

// // const app = express();

// // // ✅ Middleware
// // const corsOptions = {
// //   origin: process.env.CLIENT_URL || 'http://localhost:5173', // frontend origin
// //   credentials: true
// // };

// // app.use(cors(corsOptions));
// // app.use(helmet()); // Adds secure HTTP headers

// // // Remove duplicate app.use(cors());
// // // Explicitly handle preflight OPTIONS requests
// // app.options('*', cors(corsOptions));

// // app.use(express.json());

// // // ✅ Routes
// // const authRoutes = require("./routes/authRoutes");
// // const productRoutes = require("./routes/productRoutes");
// // const cartRoutes = require("./routes/cartRoutes");
// // const wishlistRoutes = require("./routes/wishlistRoutes");
// // const adminRoutes = require("./routes/adminRoutes");
// // const orderRoutes = require("./routes/orderRoutes");
// // const returnRoutes = require("./routes/returnRoutes");
// // const activityRoutes = require("./routes/activityRoutes");
// // const userNotificationRoutes = require("./routes/userNotificationRoutes");
// // const feedbackRoutes = require("./routes/feedbackRoutes");
// // const adminProductsRoutes = require("./routes/adminProducts");

// // app.use("/api/auth", authRoutes);
// // app.use("/api/products", productRoutes);
// // app.use("/api/cart", cartRoutes);
// // app.use("/api/wishlist", wishlistRoutes);
// // app.use("/api/admin", adminRoutes);
// // app.use("/api/admin/products", adminProductsRoutes);
// // app.use("/api/orders", orderRoutes);
// // app.use("/api/returns", returnRoutes);
// // app.use("/api/activity", activityRoutes);
// // app.use("/api/user-notifications", userNotificationRoutes);
// // app.use("/api/feedback", feedbackRoutes);
// // app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// // module.exports = app;
