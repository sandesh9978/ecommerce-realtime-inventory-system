import React, { useState } from "react";

function PaymentAndOrder() {
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const placeOrder = async (orderData) => {
    setLoading(true);
    setError(null);
    setOrderId(null);

    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (res.ok) {
        setOrderId(data.orderId);
      } else {
        setError(data.message || "Order failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  // Sample order data — replace this with your actual cart data
  const sampleOrderData = {
    items: [
      {
        product_id: 1,
        quantity: 1,
        price: 199999,
      },
    ],
    totalAmount: 199999,
  };

  return (
    <div style={{ maxWidth: 400, margin: "20px auto", padding: 20, border: "1px solid #ccc" }}>
      <h2>Place Order</h2>

      <button onClick={() => placeOrder(sampleOrderData)} disabled={loading}>
        {loading ? "Placing Order..." : "Place Order (Simulate Payment Success)"}
      </button>

      {orderId && (
        <p style={{ marginTop: 20, color: "green" }}>
          🎉 Thank you for your order! Your Order ID is #{orderId}
        </p>
      )}

      {error && (
        <p style={{ marginTop: 20, color: "red" }}>
          ⚠️ Error: {error}
        </p>
      )}
    </div>
  );
}

export default PaymentAndOrder;
