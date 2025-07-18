import React, { useEffect, useState } from "react";

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const token = localStorage.getItem("token");
  const adminUser = JSON.parse(localStorage.getItem("user") || '{}');
  const adminEmail = adminUser.email;

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to fetch admin orders");
        return;
      }
      // Filter out orders placed by the admin account
      const filtered = data.filter(order => order.email !== adminEmail);
      setOrders(filtered);
    } catch (err) {
      setError("Server error while fetching admin orders");
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to update order status");
        return;
      }
      setOrders(orders.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus }
          : order
      ));
      alert(`Order status updated to: ${newStatus}`);
    } catch (err) {
      alert("Server error while updating order status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const approveCancellation = async (orderId) => {
    setUpdatingStatus(orderId);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/approve-cancellation`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to approve cancellation");
        return;
      }
      setOrders(orders.map(order => order.id === orderId ? { ...order, status: "canceled" } : order));
      alert("Order cancellation approved.");
    } catch (err) {
      alert("Server error while approving cancellation");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const rejectCancellation = async (orderId) => {
    setUpdatingStatus(orderId);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/reject-cancellation`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to reject cancellation");
        return;
      }
      setOrders(orders.map(order => order.id === orderId ? { ...order, status: "processing" } : order));
      alert("Order cancellation rejected.");
    } catch (err) {
      alert("Server error while rejecting cancellation");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const exportCSV = () => {
    const header = ["Order ID", "User Email", "Amount", "Status", "Date"];
    const rows = paginatedOrders.map((order) => [
      order.id,
      order.email,
      order.total_amount,
      order.status,
      new Date(order.created_at).toLocaleString(),
    ]);
    const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "admin-orders.csv";
    link.click();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filtering
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(search.trim()) ||
      order.email.toLowerCase().includes(search.trim().toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    const orderDate = new Date(order.created_at);
    const matchesFrom = dateFrom ? orderDate >= new Date(dateFrom) : true;
    const matchesTo = dateTo ? orderDate <= new Date(dateTo) : true;
    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const paginatedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📋 Admin: All Orders</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
        <input
          type="text"
          placeholder="🔍 Search by ID or Email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-1/4 min-w-[180px]"
        />
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="p-2 border rounded"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <label className="flex items-center gap-2">
          From:
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="p-2 border rounded" />
        </label>
        <label className="flex items-center gap-2">
          To:
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="p-2 border rounded" />
        </label>
        <button
          onClick={exportCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          📄 Export CSV
        </button>
      </div>
      {paginatedOrders.length === 0 ? (
        <p>No matching orders found.</p>
      ) : (
        <>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Order ID</th>
                <th className="p-2">User Email</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Status</th>
                <th className="p-2">Date</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr
                    className="text-center border-t cursor-pointer"
                  >
                    <td className="p-2" onClick={() => setViewOrder(order)}>{order.id}</td>
                    <td className="p-2">
                      <button className="text-blue-600 underline" onClick={() => window.open(`/admin/users?email=${order.email}`, "_blank")}>{order.email}</button>
                    </td>
                    <td className="p-2">Rs. {order.total_amount}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-2">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    <td className="p-2">
                      {order.status === 'pending_cancellation' ? (
                        <div className="flex flex-col gap-1">
                          <button
                            className="bg-green-600 text-white px-2 py-1 rounded mb-1 hover:bg-green-700 disabled:opacity-50"
                            onClick={() => approveCancellation(order.id)}
                            disabled={updatingStatus === order.id}
                          >
                            Approve
                          </button>
                          <button
                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                            onClick={() => rejectCancellation(order.id)}
                            disabled={updatingStatus === order.id}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          disabled={updatingStatus === order.id}
                          className="p-1 border rounded text-sm"
                        >
                          <option value="pending">Pending (To Pay)</option>
                          <option value="shipped">Shipped (To Receive)</option>
                          <option value="delivered">Delivered (To Review)</option>
                          <option value="completed">Completed (Payment Done)</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      )}
                      {updatingStatus === order.id && (
                        <span className="ml-2 text-xs text-gray-500">Updating...</span>
                      )}
                      <button className="ml-2 text-gray-700 underline" onClick={() => setViewOrder(order)}>View</button>
                    </td>
                  </tr>
                  {expandedOrderId === order.id && (
                    <tr className="bg-gray-50">
                      <td colSpan="6" className="p-4 text-sm text-gray-700">
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
                          {(order.items || []).map((item, idx) => (
                            <li key={idx}>
                              {item.name} — Quantity: {item.quantity} — Price: Rs. {item.price?.toLocaleString?.() ?? item.price}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded ${page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
      {/* View Order Modal */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            <div className="mb-2"><strong>Order ID:</strong> {viewOrder.id}</div>
            <div className="mb-2"><strong>User Email:</strong> {viewOrder.email}</div>
            <div className="mb-2"><strong>Amount:</strong> Rs. {viewOrder.total_amount}</div>
            <div className="mb-2"><strong>Status:</strong> {viewOrder.status}</div>
            <div className="mb-2"><strong>Date:</strong> {new Date(viewOrder.created_at).toLocaleString()}</div>
            <div className="mb-2"><strong>Delivery Info:</strong>
              <ul className="ml-4">
                <li><strong>Name:</strong> {viewOrder.customer_name}</li>
                <li><strong>Phone:</strong> {viewOrder.customer_phone}</li>
                <li><strong>Email:</strong> {viewOrder.customer_email}</li>
                <li><strong>City:</strong> {viewOrder.customer_city}</li>
                <li><strong>Address:</strong> {viewOrder.customer_address}</li>
              </ul>
            </div>
            <div className="mb-2"><strong>Items:</strong>
              <ul className="ml-4">
                {(viewOrder.items || []).map((item, idx) => (
                  <li key={idx}>
                    {item.name} — Quantity: {item.quantity} — Price: Rs. {item.price?.toLocaleString?.() ?? item.price}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setViewOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrdersPage;
