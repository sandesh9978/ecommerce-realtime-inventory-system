import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import RegisterPage from "../pages/RegisterPage";
import CartPage from "../pages/CartPage";
import OrdersPage from "../pages/OrdersPage";
import AdminOrdersPage from "../pages/AdminOrdersPage";
import WishlistPage from "../pages/WishlistPage";
import RestockAlertsPage from "../pages/RestockAlertsPage";
import AdminNotificationsPage from "../pages/AdminNotificationsPage";
import UserDashboard from "../pages/UserDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import PrivateRoute from "../pages/component/PrivateRoute";
import AdminReviewManager from "../pages/AdminReviewManager";
import ProductDetails from "../pages/ProductsDetails";
import AdminReturnRequests from "../pages/AdminReturnRequests";
import UserReturnRequests from "../pages/UserReturnRequests";
import UserNotificationsPage from "../pages/UserNotificationsPage";
import ProductList from '../pages/ProductPage';
import AdminProductManager from '../pages/AdminProductManager';
import About from '../pages/About';
import Contact from '../pages/Contact';
import HowToOrder from '../pages/HowToOrder';
import PaymentPolicy from '../pages/PaymentPolicy';
import FAQPage from '../pages/FAQPage';
import ReturnRefund from '../pages/ReturnRefund';
import Feedback from '../pages/Feedback';
import Checkout from "../pages/Checkout";
import Receipt from "../pages/Receipt";
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/how-to-order" element={<HowToOrder />} />
      <Route path="/payment-policy" element={<PaymentPolicy />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/return-refund" element={<ReturnRefund />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
      <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
      <Route path="/admin/orders" element={<PrivateRoute><AdminOrdersPage /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute isAdminOnly={true}><AdminDashboard /></PrivateRoute>} />
      <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
      <Route path="/user-returns" element={<PrivateRoute><UserReturnRequests /></PrivateRoute>} />
      <Route path="/restock-alerts" element={<PrivateRoute><RestockAlertsPage /></PrivateRoute>} />
      <Route path="/admin/notifications" element={<PrivateRoute isAdminOnly={true}><AdminNotificationsPage /></PrivateRoute>} />
      <Route path="/admin/reviews" element={<PrivateRoute><AdminReviewManager /></PrivateRoute>} />
      <Route path="/admin/returns" element={<PrivateRoute><AdminReturnRequests /></PrivateRoute>} />
      <Route path="/admin/products-manager" element={<PrivateRoute isAdminOnly={true}><AdminProductManager /></PrivateRoute>} />
      <Route path="/admin/products" element={<PrivateRoute isAdminOnly={true}><AdminProductManager /></PrivateRoute>} />
      <Route path="/product-details/:slug" element={<PrivateRoute><ProductDetails /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><UserNotificationsPage /></PrivateRoute>} />
      <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
      <Route path="/receipt" element={<PrivateRoute><Receipt /></PrivateRoute>} />
    </Routes>
  );
}

export default AppRoutes;
