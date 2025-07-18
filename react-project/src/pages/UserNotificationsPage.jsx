import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function UserNotificationsPage() {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    fetchNotifications();
    fetchUnreadCount();
    // eslint-disable-next-line
  }, [token]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user-notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/user-notifications/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch {}
  };

  const markAsRead = async (id) => {
    await fetch(`/api/user-notifications/${id}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchNotifications();
    fetchUnreadCount();
  };

  const markAllAsRead = async () => {
    await fetch(`/api/user-notifications/mark-all-read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchNotifications();
    fetchUnreadCount();
  };

  const deleteNotification = async (id) => {
    await fetch(`/api/user-notifications/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchNotifications();
    fetchUnreadCount();
  };

  if (!user) {
    return <div className="max-w-2xl mx-auto p-6">Please log in to view notifications.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🔔 My Notifications</h1>
          <p className="text-gray-600">Messages and alerts for your account</p>
        </div>
        <div className="flex items-center gap-3">
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
      </header>
      {loading && <p>Loading notifications...</p>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {!loading && notifications.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No notifications found.</p>
        </div>
      )}
      {!loading && notifications.length > 0 && (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 shadow-sm flex items-start justify-between ${
                notification.read_status === 0 ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-lg">{notification.type === "warning" ? "⚠️" : "📢"}</span>
                  <span className="font-medium">{notification.message}</span>
                  {notification.read_status === 0 && (
                    <span className="bg-blue-500 text-white px-2 py-1 text-xs rounded ml-2">NEW</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{new Date(notification.created_at).toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2 items-end ml-4">
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
          ))}
        </div>
      )}
    </div>
  );
} 