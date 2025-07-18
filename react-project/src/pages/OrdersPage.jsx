import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const STATUS_TABS = [
  { key: "all", label: "All Orders" },
  { key: "pending", label: "Pending Payment" },
  { key: "processing", label: "Processing / To Ship" },
  { key: "shipped", label: "Shipped / In Transit" },
  { key: "delivered", label: "Delivered / Completed" },
  { key: "canceled", label: "Cancelled" },
];

const CANCELLED_STATUSES = [
  "cancel_process",
  "pending_cancellation",
  "canceled",
  "cancelled",
  "completed"
];

export default function OrdersPage() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchId, setSearchId] = useState("");

  // Load orders from localStorage
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    async function fetchOrders() {
      try {
        const res = await fetch('http://localhost:5000/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
          setError("");
        } else {
          // fallback to localStorage
          const stored = JSON.parse(localStorage.getItem('orders')) || [];
          setOrders(stored);
          setError("Failed to load orders from backend, showing local orders.");
        }
      } catch {
        const stored = JSON.parse(localStorage.getItem('orders')) || [];
        setOrders(stored);
        setError("Failed to load orders from backend, showing local orders.");
      }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  // Set default tab based on navigation state or query param
  useEffect(() => {
    if (location.state && location.state.showCancelled) {
      setActiveTab("canceled");
    }
  }, [location.state]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to cancel order");
      } else {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "canceled" } : o))
        );
        alert("Order canceled successfully");
      }
    } catch (err) {
      alert("Server error while canceling order");
    }
  };

  const formatCurrency = (amount) =>
    amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Group/filter orders by status
  const getStatusKey = (status) => {
    if (!status) return "pending";
    const s = status.toLowerCase();
    if (["pending", "pending payment"].includes(s)) return "pending";
    if (["processing", "to ship"].includes(s)) return "processing";
    if (["shipped", "in transit"].includes(s)) return "shipped";
    if (["delivered", "completed"].includes(s)) return "delivered";
    if (["canceled", "cancelled"].includes(s)) return "canceled";
    return "other";
  };

  const getStatusLabel = (order) => {
    const status = order.status?.toLowerCase();
    const date = new Date(order.updated_at || order.canceled_at || order.completed_at || order.created_at);
    const now = new Date();
    const daysSince = (now - date) / (1000 * 60 * 60 * 24);
    if (["canceled", "cancelled", "completed"].includes(status) && daysSince > 7) {
      return "Refunded";
    }
    if (status === "cancel_process") return "Cancellation In Process";
    if (status === "pending_cancellation") return "Cancellation Pending Approval";
    if (status === "canceled" || status === "cancelled") return "Cancelled";
    if (status === "completed") return "Cancellation Completed";
    return order.status || "Pending";
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id?.toString().includes(searchId.trim());
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "canceled") {
      return (
        CANCELLED_STATUSES.includes(order.status?.toLowerCase()) && matchesSearch
      );
    }
    return getStatusKey(order.status) === activeTab && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans text-gray-800">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">📦 My Orders</h1>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="🔍 Search Order ID"
            className="border border-gray-300 rounded px-4 py-2 flex-1 md:max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
        </div>
      </header>
      {/* Tab Navigation */}
      <nav className="flex gap-2 mb-6 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-3 py-2 rounded font-medium whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow"
                : "hover:bg-blue-100 text-gray-700"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <section className="bg-white rounded shadow p-6">
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {loading ? (
          <p className="text-center py-10">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-gray-600 text-center py-10">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-blue-50 text-blue-700 font-semibold">
                <tr>
                  <th className="p-3 border">Order ID</th>
                  <th className="p-3 border">Total</th>
                  <th className="p-3 border">Date</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const statusKey = getStatusKey(order.status);
                  const canCancel = ["pending", "processing"].includes(statusKey);
                  return (
                    <React.Fragment key={order.id}>
                      <tr className="border-b hover:bg-blue-50 cursor-pointer">
                        <td className="p-3 text-center">{order.id}</td>
                        <td className="p-3 text-right font-semibold">
                          Rs. {formatCurrency(order.total_amount)}
                        </td>
                        <td className="p-3 text-center">
                          {new Date(order.created_at).toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                              order.status === "pending_cancellation"
                                ? "bg-yellow-100 text-yellow-700"
                                : order.status === "cancel_process"
                                ? "bg-orange-100 text-orange-700"
                                : order.status === "completed" || getStatusLabel(order) === "Refunded"
                                ? "bg-green-100 text-green-700"
                                : statusKey === "canceled"
                                ? "bg-red-100 text-red-700"
                                : statusKey === "delivered"
                                ? "bg-green-100 text-green-700"
                                : statusKey === "shipped"
                                ? "bg-blue-100 text-blue-700"
                                : statusKey === "processing"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {getStatusLabel(order)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                            aria-label={`Toggle details for order ${order.id}`}
                            className="text-blue-600 hover:underline focus:outline-none mr-2"
                          >
                            {expandedOrderId === order.id ? "▲ Hide" : "▼ Show"}
                          </button>
                          {canCancel && order.status !== "pending_cancellation" && order.status !== "cancel_process" && order.status !== "completed" && getStatusLabel(order) !== "Refunded" && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                            >
                              Cancel Order
                            </button>
                          )}
                        </td>
                      </tr>
                      {expandedOrderId === order.id && order.items && (
                        <tr className="bg-gray-50">
                          <td colSpan="5" className="p-4 text-sm text-gray-700">
                            <strong>Delivery Information:</strong>
                            <ul className="mt-2 mb-2 list-disc list-inside space-y-1">
                              <li><strong>Name:</strong> {order.customer_name}</li>
                              <li><strong>Phone:</strong> {order.customer_phone}</li>
                              <li><strong>Email:</strong> {order.customer_email}</li>
                              <li><strong>City:</strong> {order.customer_city}</li>
                              <li><strong>Address:</strong> {order.customer_address}</li>
                            </ul>
                            <strong>Items:</strong>
                            <ul className="mt-2 list-disc list-inside space-y-1">
                              {order.items.map((item, idx) => (
                                <li key={idx}>
                                  {item.name} — Quantity: {item.quantity} — Price: Rs. {formatCurrency(item.price)}
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

