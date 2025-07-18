import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"; // assuming you have auth context
import { toast } from "react-toastify";

function UserOrders() {
  const { user } = useAuth(); // get current user info
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch orders on mount
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    async function fetchOrders() {
      try {
        const res = await fetch('http://localhost:5000/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : (data.orders || []));
      } catch (err) {
        // fallback to localStorage
        const stored = JSON.parse(localStorage.getItem('orders')) || [];
        setOrders(stored);
        toast.error('Failed to load orders from backend, showing local orders.');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to cancel order");

      // Update local state after cancellation
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: "Cancelled" } : order
        )
      );
      toast.success("Order cancelled successfully.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!user) return <p>Please login to view your orders.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

      {loading && <p>Loading your orders...</p>}

      {!loading && orders.length === 0 && <p>You have no orders yet.</p>}

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white p-4 rounded shadow flex flex-col md:flex-row md:justify-between md:items-center gap-4"
          >
            <div>
              <p><strong>Product:</strong> {order.productName}</p>
              <p><strong>Price:</strong> Rs. {order.price.toLocaleString()}</p>
              <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
              <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
              <p><strong>Status:</strong> {order.status}</p>
            </div>

            <div>
              {order.status !== "Cancelled" && order.status !== "Delivered" ? (
                <button
                  onClick={() => handleCancelOrder(order._id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Cancel Order
                </button>
              ) : (
                <span className="text-gray-500 italic">Cannot cancel</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserOrders;
