import React, { useState, useEffect } from "react";
import { getOrdersApi, cancelOrderApi } from "./api/api";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackOrder, setTrackOrder] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  // Fetch orders from backend
  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await getOrdersApi(token);
      setOrders(res.data);
      setError("");
    } catch (err) {
      // fallback to localStorage
      const stored = JSON.parse(localStorage.getItem('orders')) || [];
      setOrders(stored);
      setError("Failed to load orders from backend, showing local orders.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Cancel order by orderId
  const cancelOrder = async (orderId) => {
    try {
      await cancelOrderApi(orderId, token);
      fetchOrders();
    } catch {}
  };

  const handleTrackOrder = (order) => {
    setTrackOrder(order);
    setShowTrackModal(true);
  };

  const closeTrackModal = () => {
    setShowTrackModal(false);
    setTrackOrder(null);
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">📦 Your Order History</h1>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No orders found.</p>
          <p className="text-sm text-gray-500">Start shopping to see your order history here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📦 Your Order History</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.orderId} className="bg-white rounded-lg shadow p-6">
            {/* Order Header */}
            <div className="flex justify-between items-start mb-4 pb-4 border-b">
              <div>
                <h2 className="text-xl font-semibold text-blue-600">Order #{order.orderId}</h2>
                <p className="text-gray-600">
                  Placed on: {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                  order.status === "Delivered" ? "bg-green-100 text-green-800" :
                  order.status === "Canceled" ? "bg-red-100 text-red-800" :
                  "bg-blue-100 text-blue-800"
                }`}>
                  {order.status}
                </span>
                <p className="text-lg font-bold mt-1">Rs. {order.totalAmount?.toLocaleString()}</p>
              </div>
            </div>

            {/* User Information */}
            {order.userInfo && (
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">📋 Delivery Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><strong>Name:</strong> {order.userInfo.fullName}</div>
                  <div><strong>Phone:</strong> {order.userInfo.phoneNumber}</div>
                  <div><strong>Email:</strong> {order.userInfo.email}</div>
                  <div><strong>City:</strong> {order.userInfo.city}</div>
                  <div className="md:col-span-2"><strong>Address:</strong> {order.userInfo.address}</div>
                  {order.userInfo.postalCode && (
                    <div><strong>Postal Code:</strong> {order.userInfo.postalCode}</div>
                  )}
                </div>
              </div>
            )}

            {/* Products */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">🛍️ Products</h3>
              <div className="space-y-2">
                {order.products?.map((product, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">Product ID: {product.productId}</span>
                      <span className="text-gray-600 ml-2">× {product.quantity}</span>
                    </div>
                    <span className="font-semibold">Rs. {(product.price * product.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-4 p-4 bg-blue-50 rounded">
              <h3 className="font-semibold mb-2">💳 Payment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><strong>Payment Method:</strong> {order.paymentMethod}</div>
                <div><strong>Total Amount:</strong> Rs. {order.totalAmount?.toLocaleString()}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              {order.status !== "Canceled" && (
                <button
                  onClick={() => cancelOrder(order.orderId)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Cancel Order
                </button>
              )}
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => handleTrackOrder(order)}
              >
                Track Order
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Track Order Modal */}
      {showTrackModal && trackOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative">
            <button
              onClick={closeTrackModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-bold text-xl leading-none"
              aria-label="Close tracking modal"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-blue-700">Order Tracking</h2>
            {trackOrder.trackingNumber ? (
              <>
                <div className="mb-2"><strong>Tracking Number:</strong> {trackOrder.trackingNumber}</div>
                <div className="mb-2"><strong>Status:</strong> {trackOrder.trackingStatus || 'In Transit'}</div>
                {/* You can add more tracking details here if available */}
              </>
            ) : (
              <div className="text-gray-600">Tracking not available yet for this order.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 