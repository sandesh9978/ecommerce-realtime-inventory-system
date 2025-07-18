import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./pages/component/PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Page imports
import About from "./pages/About";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminReturnRequests from "./pages/AdminReturnRequests";
import AdminReviewManager from "./pages/AdminReviewManager";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQPage";
import HomePage from "./pages/HomePage";
import HowToOrder from "./pages/HowToOrder";
import OrderHistory from "./pages/OrderHistory"; // <-- new or placeholder import
import PaymentAndOrder from "./pages/PaymentAndOrder";
import PaymentPolicy from "./pages/PaymentPolicy";
import PaymentSuccess from "./pages/PaymentSuccess";
import ProductDetails from "./pages/ProductsDetails";
import RegisterPage from "./pages/RegisterPage";
import ReturnRefundPolicy from "./pages/ReturnRefund";
import UserDashboard from "./pages/UserDashboard";
import UserReturnRequests from "./pages/UserReturnRequests";
import WishlistPage from "./pages/WishlistPage";
import FeedbackPage from "./pages/Feedback";
import LoginPage from "./pages/LoginPage";
import { ProductProvider, useProducts } from "./pages/context/ProductContext";
import Header from "./pages/component/Header";
import OrdersPage from "./pages/OrdersPage";
// import Sidebar from "./pages/component/Sidebar";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <Router>
          <Header />
          {/* <Sidebar /> */}
          <AppRoutes />
          <ToastContainer />
        </Router>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
