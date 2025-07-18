import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

function RestockAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = getUser();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (user && token) {
      fetchAlerts();
    }
  }, [user, token]);

  const fetchAlerts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/restock-alerts/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }

      const data = await response.json();
      setAlerts(data);
    } catch (err) {
      setError("Failed to load restock alerts");
    } finally {
      setLoading(false);
    }
  };

  const removeAlert = async (alertId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/restock-alerts/${alertId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove alert");
      }

      // Remove from local state
      setAlerts(alerts.filter(alert => alert.id !== alertId));
      alert("Restock alert removed successfully");
    } catch (err) {
      alert("Failed to remove alert");
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Restock Alerts</h1>
        <p>Please <Link to="/login" className="text-blue-600 hover:underline">login</Link> to view your restock alerts.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">🔔 Restock Alerts</h1>
        <p className="text-gray-600">Manage your product restock notifications</p>
      </header>

      <nav className="mb-6">
        <Link to="/" className="text-blue-600 hover:underline mr-4">Home</Link>
        <Link to="/products" className="text-blue-600 hover:underline mr-4">Products</Link>
        <Link to="/wishlist" className="text-blue-600 hover:underline">Wishlist</Link>
      </nav>

      {loading && <p>Loading your restock alerts...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!loading && alerts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">You don't have any restock alerts yet.</p>
          <p className="text-sm text-gray-400">
            When products are out of stock, you can subscribe to restock alerts to get notified when they become available again.
          </p>
        </div>
      )}

      {!loading && alerts.length > 0 && (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {alert.product_image && (
                    <img
                      src={alert.product_image}
                      alt={alert.product_name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{alert.product_name}</h3>
                    <p className="text-gray-600">Price: Rs. {alert.product_price?.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                      Alert created: {new Date(alert.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                    Waiting for restock
                  </span>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove Alert
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

export default RestockAlertsPage; 