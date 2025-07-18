import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendForm, setSendForm] = useState({ type: "info", message: "" });
  const [sendLoading, setSendLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState("");
  const [sendError, setSendError] = useState("");
  const { user, token } = useAuth();

  // --- Admin: Send notification to users ---
  const [userNotifForm, setUserNotifForm] = useState({ type: "info", message: "", recipient: "all", email: "" });
  const [userNotifLoading, setUserNotifLoading] = useState(false);
  const [userNotifSuccess, setUserNotifSuccess] = useState("");
  const [userNotifError, setUserNotifError] = useState("");

  useEffect(() => {
    if (user && token && user.role === "admin") {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user, token]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/notifications/count", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Update local state
        setNotifications(notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read_status: 1 }
            : notification
        ));
        fetchUnreadCount();
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/notifications/mark-all-read", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(notifications.map(notification => ({ ...notification, read_status: 1 })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(notifications.filter(notification => notification.id !== notificationId));
        fetchUnreadCount();
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "out_of_stock":
        return "🚨";
      case "low_stock":
        return "⚠️";
      default:
        return "📢";
    }
  };

  // Add notification sender
  const handleSendChange = (e) => {
    setSendForm({ ...sendForm, [e.target.name]: e.target.value });
  };
  const handleSendNotification = async (e) => {
    e.preventDefault();
    setSendLoading(true);
    setSendSuccess("");
    setSendError("");
    try {
      const response = await fetch("http://localhost:5000/api/admin/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sendForm),
      });
      const data = await response.json();
      if (response.ok) {
        setSendSuccess("Notification sent successfully!");
        setSendForm({ type: "info", message: "" });
        fetchNotifications();
      } else {
        setSendError(data.message || "Failed to send notification");
      }
    } catch {
      setSendError("Server error while sending notification");
    } finally {
      setSendLoading(false);
    }
  };

  // --- Admin: Send notification to users ---
  const handleUserNotifChange = (e) => {
    setUserNotifForm({ ...userNotifForm, [e.target.name]: e.target.value });
  };
  const handleSendUserNotification = async (e) => {
    e.preventDefault();
    setUserNotifLoading(true);
    setUserNotifSuccess("");
    setUserNotifError("");
    try {
      const payload = {
        type: userNotifForm.type,
        message: userNotifForm.message,
      };
      if (userNotifForm.recipient === "user" && userNotifForm.email) {
        // You would need to look up userId by email in a real app; for now, just send email as userId
        payload.userId = userNotifForm.email;
      }
      const res = await fetch("/api/user-notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setUserNotifSuccess("Notification sent to users!");
        setUserNotifForm({ type: "info", message: "", recipient: "all", email: "" });
      } else {
        setUserNotifError(data.message || "Failed to send notification");
      }
    } catch {
      setUserNotifError("Server error while sending notification");
    } finally {
      setUserNotifLoading(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Notifications</h1>
        <p>Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🔔 Admin Notifications</h1>
            <p className="text-gray-600">Inventory alerts and system notifications</p>
          </div>
          <div className="flex items-center space-x-4">
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {unreadCount} unread
              </span>
            )}
            <button
              onClick={markAllAsRead}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Mark All as Read
            </button>
          </div>
        </div>
      </header>

      {/* Send Notification Form */}
      <section className="mb-6 bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Send Notification</h2>
        <form className="flex flex-col md:flex-row gap-2 items-center" onSubmit={handleSendNotification}>
          <select
            name="type"
            value={sendForm.type}
            onChange={handleSendChange}
            className="border rounded px-3 py-2"
            required
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="low_stock">Low Stock</option>
          </select>
          <input
            type="text"
            name="message"
            value={sendForm.message}
            onChange={handleSendChange}
            className="border rounded px-3 py-2 flex-1"
            placeholder="Notification message"
            required
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={sendLoading}
          >
            {sendLoading ? "Sending..." : "Send"}
          </button>
        </form>
        {sendSuccess && <div className="text-green-600 mt-2">{sendSuccess}</div>}
        {sendError && <div className="text-red-600 mt-2">{sendError}</div>}
      </section>

      {/* --- Admin: Send notification to users --- */}
      {user && user.role === "admin" && (
        <section className="mb-6 bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Send Notification to Users</h2>
          <form className="flex flex-col md:flex-row gap-2 items-center" onSubmit={handleSendUserNotification}>
            <select
              name="type"
              value={userNotifForm.type}
              onChange={handleUserNotifChange}
              className="border rounded px-3 py-2"
              required
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
            </select>
            <input
              type="text"
              name="message"
              value={userNotifForm.message}
              onChange={handleUserNotifChange}
              className="border rounded px-3 py-2 flex-1"
              placeholder="Notification message"
              required
            />
            <select
              name="recipient"
              value={userNotifForm.recipient}
              onChange={handleUserNotifChange}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Users</option>
              <option value="user">Specific User (by email)</option>
            </select>
            {userNotifForm.recipient === "user" && (
              <input
                type="email"
                name="email"
                value={userNotifForm.email}
                onChange={handleUserNotifChange}
                className="border rounded px-3 py-2"
                placeholder="User email"
                required
              />
            )}
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={userNotifLoading}
            >
              {userNotifLoading ? "Sending..." : "Send"}
            </button>
          </form>
          {userNotifSuccess && <div className="text-green-600 mt-2">{userNotifSuccess}</div>}
          {userNotifError && <div className="text-red-600 mt-2">{userNotifError}</div>}
        </section>
      )}

      <nav className="mb-6">
        <Link to="/admin" className="text-blue-600 hover:underline mr-4">Dashboard</Link>
        <Link to="/admin/products" className="text-blue-600 hover:underline mr-4">Products</Link>
        <Link to="/admin/orders" className="text-blue-600 hover:underline">Orders</Link>
      </nav>

      {loading && <p>Loading notifications...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No notifications found.</p>
          <p className="text-sm text-gray-400">
            Notifications will appear here when products are low on stock or out of stock.
          </p>
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`border rounded-lg p-4 shadow-sm ${
                notification.read_status === 0 ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{notification.message}</h3>
                      <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      {notification.read_status === 0 && (
                        <span className="bg-blue-500 text-white px-2 py-1 text-xs rounded">
                          NEW
                        </span>
                      )}
                    </div>
                    
                    {notification.product_name && (
                      <div className="flex items-center space-x-3 mb-2">
                        {notification.product_image && (
                          <img
                            src={notification.product_image}
                            alt={notification.product_name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">{notification.product_name}</p>
                          {notification.current_stock !== undefined && (
                            <p className="text-sm text-gray-600">
                              Current stock: {notification.current_stock}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {notification.read_status === 0 && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminNotificationsPage; 