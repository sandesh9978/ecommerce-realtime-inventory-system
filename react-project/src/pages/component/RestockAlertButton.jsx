import React, { useState } from "react";

const RestockAlertButton = ({ productId, productName, isOutOfStock, userEmail }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const handleSubscribe = async () => {
    if (!token) {
      setMessage("Please login to set up restock alerts");
      return;
    }

    if (!userEmail) {
      setMessage("Please provide your email address");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/restock-alerts/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          email: userEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubscribed(true);
        setMessage("Restock alert set up successfully! You'll be notified when this product is back in stock.");
      } else {
        setMessage(data.message || "Failed to set up restock alert");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOutOfStock) {
    return null;
  }

  return (
    <div className="mt-4">
      {!isSubscribed ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-yellow-800">Out of Stock</h3>
              <p className="text-sm text-yellow-700">
                Get notified when {productName} is back in stock
              </p>
            </div>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {loading ? "Setting up..." : "Notify When Available"}
            </button>
          </div>
          {message && (
            <p className={`text-sm mt-2 ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800 font-medium">
              Restock alert activated! You'll be notified when this product is back in stock.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestockAlertButton; 