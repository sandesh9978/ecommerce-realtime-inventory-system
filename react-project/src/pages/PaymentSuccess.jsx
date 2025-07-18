import React, { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import { useNavigate, useLocation } from "react-router-dom";

export default function PaymentSuccess() {
  const [orderId, setOrderId] = useState("");
  const [productName, setProductName] = useState("");
  const [orderAmount, setOrderAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [userInfo, setUserInfo] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get order details from navigation state or localStorage
    if (location.state) {
      setOrderId(location.state.orderId || "ORD" + Math.floor(Math.random() * 1000000));
      setOrderAmount(location.state.totalAmount || "1500");
      setPaymentMethod(location.state.paymentMethod || "Esewa");
      setUserInfo(location.state.userInfo || {});
    } else {
      // Fallback to localStorage
      const savedOrderId = localStorage.getItem("lastOrderId") || "ORD" + Math.floor(Math.random() * 1000000);
      const savedAmount = localStorage.getItem("lastAmount") || "1500";
      const savedMethod = localStorage.getItem("lastPaymentMethod") || "Esewa";

      setOrderId(savedOrderId);
      setOrderAmount(savedAmount);
      setPaymentMethod(savedMethod);
    }
  }, [location.state]);

  const downloadReceipt = () => {
    const receipt = document.getElementById("receiptArea");
    if (!receipt) return;
    html2canvas(receipt).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "receipt.png";
      link.click();
    });
  };

  const handleContinueShopping = () => {
    // Clear localStorage if you want
    localStorage.removeItem("lastOrderId");
    localStorage.removeItem("lastProduct");
    localStorage.removeItem("lastAmount");
    localStorage.removeItem("lastPaymentMethod");

    // Redirect to products page or home page
    navigate("/products");
  };

  return (
    <div className="bg-green-50 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded shadow max-w-lg w-full text-center space-y-4">
        <h1 className="text-3xl font-bold text-green-700">✅ Payment Successful</h1>
        <p className="text-green-800">🎉 Thank you! Your payment has been successfully processed.</p>

        <div id="receiptArea" className="bg-gray-50 p-4 rounded border text-left">
          <h2 className="text-lg font-semibold mb-2">📋 Order Receipt</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Order ID:</strong> <span className="font-mono">{orderId}</span></p>
            <p><strong>Date:</strong> {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            <p><strong>Total Paid:</strong> Rs. <span className="font-semibold">{orderAmount}</span></p>
            <p><strong>Payment Method:</strong> {paymentMethod}</p>
            
            {userInfo.fullName && (
              <div className="mt-4 pt-2 border-t">
                <h3 className="font-semibold mb-1">📦 Delivery Information</h3>
                <p><strong>Name:</strong> {userInfo.fullName}</p>
                {userInfo.phoneNumber && <p><strong>Phone:</strong> {userInfo.phoneNumber}</p>}
                {userInfo.email && <p><strong>Email:</strong> {userInfo.email}</p>}
                {userInfo.city && <p><strong>City:</strong> {userInfo.city}</p>}
                {userInfo.address && <p><strong>Address:</strong> {userInfo.address}</p>}
                {userInfo.postalCode && <p><strong>Postal Code:</strong> {userInfo.postalCode}</p>}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={downloadReceipt}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
        >
          Download Receipt
        </button>

        <div className="space-y-2 mt-4">
          <button
            onClick={handleContinueShopping}
            className="block w-full bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate("/")}
            className="block w-full text-green-700 hover:underline"
          >
            Go to Home Page
          </button>
        </div>
      </div>
    </div>
  );
}
