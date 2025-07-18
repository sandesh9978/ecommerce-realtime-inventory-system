import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "./context/ProductContext";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getAllProductsApi, addProductApi, editProductApi, deleteProductApi } from "./api/api";

const STATUS_TABS = [
  { key: "all", label: "All Orders" },
  { key: "pending", label: "Pending" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered/Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const COLORS = ["#2563eb", "#22c55e", "#f59e42", "#ef4444", "#a3a3a3"];

function getDateString(date) {
  return new Date(date).toLocaleDateString();
}

export default function AdminDashboard({ isAdmin }) {
  // Only allow admin
  if (typeof isAdmin !== "undefined" && !isAdmin) {
    return (
      <div className="p-8 text-center text-red-600 font-bold text-xl">
        Access denied. Admins only.
      </div>
    );
  }

  const { products, setProducts } = useProducts();
  // Change form state to use images: [] instead of image: ""
  const [form, setForm] = useState({ model: "", price: "", stock: "", brand: "", images: [], costPrice: "" });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [productSaveStatus, setProductSaveStatus] = useState(null); // 'success' | 'error' | null

  // --- Admin Order Analytics ---
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/admin/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setOrdersError(data.message || "Failed to fetch orders");
          setOrders([]);
        } else {
          setOrders(data);
          setOrdersError("");
        }
      } catch (err) {
        setOrdersError("Server error while fetching orders.");
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusKey = (status) => {
    if (!status) return "pending";
    const s = status.toLowerCase();
    if (["pending", "pending payment"].includes(s)) return "pending";
    if (["shipped", "in transit"].includes(s)) return "shipped";
    if (["delivered", "completed"].includes(s)) return "delivered";
    if (["canceled", "cancelled"].includes(s)) return "cancelled";
    return "other";
  };

  // --- Date Filtering ---
  const filteredOrders = orders.filter((o) => {
    if (!dateRange.from && !dateRange.to) return true;
    const orderDate = new Date(o.created_at);
    const from = dateRange.from ? new Date(dateRange.from) : null;
    const to = dateRange.to ? new Date(dateRange.to) : null;
    if (from && orderDate < from) return false;
    if (to && orderDate > to) return false;
    return true;
  });

  const totalOrders = filteredOrders.length;
  const completedOrders = filteredOrders.filter((o) => getStatusKey(o.status) === "delivered").length;
  const pendingOrders = filteredOrders.filter((o) => getStatusKey(o.status) === "pending").length;
  const canceledOrders = filteredOrders.filter((o) => getStatusKey(o.status) === "cancelled").length;
  const totalSales = filteredOrders.reduce((sum, o) => sum + (getStatusKey(o.status) === "delivered" ? Number(o.total_amount) : 0), 0);
  const recentOrders = [...filteredOrders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  // --- Sales Trend Data (by day) ---
  const salesByDay = {};
  filteredOrders.forEach((o) => {
    if (getStatusKey(o.status) === "delivered") {
      const day = getDateString(o.created_at);
      salesByDay[day] = (salesByDay[day] || 0) + Number(o.total_amount);
    }
  });
  const salesTrendData = Object.entries(salesByDay).map(([date, sales]) => ({ date, sales }));

  // --- Order Status Breakdown ---
  const statusCounts = [
    { name: "Pending", value: pendingOrders },
    { name: "Completed", value: completedOrders },
    { name: "Cancelled", value: canceledOrders },
    { name: "Other", value: totalOrders - pendingOrders - completedOrders - canceledOrders },
  ];

  // --- Top Selling Products ---
  const productSales = {};
  filteredOrders.forEach((o) => {
    if (o.status && getStatusKey(o.status) === "delivered" && o.total_amount) {
      if (o.productName) {
        productSales[o.productName] = (productSales[o.productName] || 0) + Number(o.total_amount);
      }
    }
  });
  // If productName is not available, skip. For a real app, fetch order items and aggregate.
  const topProducts = Object.entries(productSales)
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  // --- Export CSV ---
  const exportOrders = () => {
    const header = ["Order ID", "User", "Total", "Date", "Status"];
    const rows = filteredOrders.map((o) => [
      o.id,
      o.email,
      o.total_amount,
      new Date(o.created_at).toLocaleString(),
      o.status,
    ]);
    const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "orders.csv";
    link.click();
  };

  const formatCurrency = (amount) =>
    amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const analyticsRef = useRef();

  // --- Export PDF ---
  const exportPDF = async () => {
    if (!analyticsRef.current) return;
    const input = analyticsRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("admin-analytics-report.pdf");
  };

  // --- Low Stock Alerts ---
  const lowStockProducts = products.filter(p => p.stock !== undefined && p.stock < 5);

  // --- Recent User Signups (real data) ---
  const [recentUsers, setRecentUsers] = useState([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setRecentUsers(data.slice(0, 5));
        }
      } catch (err) {
        // fallback: do nothing
      }
    };
    fetchUsers();
  }, []);

  // --- Recent Activity Feed (real data) ---
  const [recentActivity, setRecentActivity] = useState([]);
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/admin/activity", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setRecentActivity(data);
        }
      } catch (err) {
        // fallback: do nothing
      }
    };
    fetchActivity();
  }, []);

  // --- Quick Admin Links ---
  const quickLinks = [
    { label: "Add Product", action: () => {
        setEditingId(null); // ensure not editing
        setTimeout(() => {
          if (addFormRef.current) addFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    },
    { label: "Manage Orders", to: "/admin/orders" },
    { label: "View Cancelled Orders", to: "/admin/orders?status=cancelled" },
  ];

  // --- Notifications/Health Widget (real data) ---
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/admin/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setNotifications(data.slice(0, 5));
        }
      } catch (err) {
        // fallback: do nothing
      }
    };
    fetchNotifications();
  }, []);

  // --- Return/Refund Requests Widget ---
  const [returnRequests, setReturnRequests] = useState([]);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState("");
  useEffect(() => {
    const fetchReturns = async () => {
      const token = localStorage.getItem("token");
      console.log("[Return Widget] TOKEN:", token);
      setReturnLoading(true);
      try {
        if (!token) {
          setReturnError("No token found. Please log in as admin.");
          setReturnRequests([]);
          setReturnLoading(false);
          return;
        }
        const res = await fetch("http://localhost:5000/api/returns/admin", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setReturnError(data.message || "Failed to fetch return requests");
          setReturnRequests([]);
        } else {
          setReturnRequests(data);
          setReturnError("");
        }
      } catch (err) {
        setReturnError("Server error while fetching returns");
        setReturnRequests([]);
      } finally {
        setReturnLoading(false);
      }
    };
    fetchReturns();
  }, []);
  const pendingReturns = returnRequests.filter(r => r.status !== "processed").length;
  const processedReturns = returnRequests.filter(r => r.status === "processed").length;

  // Calculate profit overview
  const deliveredOrders = filteredOrders.filter((o) => getStatusKey(o.status) === "delivered");
  let totalCost = 0;
  deliveredOrders.forEach(order => {
    // If order has items, sum costPrice * quantity for each item
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.product_id);
        if (product && product.costPrice != null) {
          totalCost += Number(product.costPrice) * (item.quantity || 1);
        }
      });
    } else {
      // Fallback: try to match by productName/model if no items array
      const product = products.find(p => p.model === order.productName || p.name === order.productName);
      if (product && product.costPrice != null) {
        totalCost += Number(product.costPrice);
      }
    }
  });
  const totalProfit = totalSales - totalCost;

  // Product form handlers
  // Update handleChange to handle multiple images
  const handleChange = e => {
    if (e.target.name === "images" && e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const readers = files.map(file => {
        return new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });
      Promise.all(readers).then(images => {
        // No artificial limit: user can upload as many images as browser localStorage allows
        setForm(prev => ({ ...prev, images: [...prev.images, ...images] }));
      });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setProductSaveStatus(null);
    const token = localStorage.getItem("token");

    try {
      if (editingId) {
        await editProductApi(editingId, form, token);
      } else {
        await addProductApi(form, token);
      }
      // Refresh products from backend
      const res = await getAllProductsApi();
      setProducts(Array.isArray(res.data) ? res.data : res.data.products);
      setForm({ model: "", price: "", stock: "", brand: "", images: [], costPrice: "" });
      setEditingId(null);
      setSubmitting(false);
      setProductSaveStatus('success');
    } catch (err) {
      setSubmitting(false);
      setProductSaveStatus('error');
    }
  };

  const handleEdit = p => {
    setForm({ model: p.model, price: p.price, stock: p.stock, brand: p.brand || "", images: p.images || [], costPrice: p.costPrice || "" });
    setEditingId(p.id);
  };

  const handleDelete = async id => {
    if (window.confirm("Delete this product?")) {
      const token = localStorage.getItem("token");
      try {
        await deleteProductApi(id, token);
        // Refresh products from backend
        const res = await getAllProductsApi();
        setProducts(Array.isArray(res.data) ? res.data : res.data.products);
      } catch (err) {
        alert("Failed to delete product: " + (err.message || "Unknown error"));
      }
    }
  };

  const handleCancel = () => {
    setForm({ model: "", price: "", stock: "", brand: "", images: [], costPrice: "" });
    setEditingId(null);
  };

  // --- Pagination ---
  const ITEMS_PER_PAGE = 10;
  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginated = [...products].reverse().slice(startIndex, endIndex);

  const pagination = Array.from({ length: totalPages }, (_, i) => (
    <button
      key={i + 1}
      onClick={() => setPage(i + 1)}
      className={`px-3 py-1 rounded-md ${page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
    >
      {i + 1}
    </button>
  ));

  // 1. Add a ref for the add product form section:
  const addFormRef = useRef();

  return (
    <div className="bg-gray-100 text-gray-800 font-sans min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center">🛠️ Admin Panel</h1>
          <nav className="mt-4 text-center space-x-4 text-blue-600 font-medium">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/products">Products</Link>
            <Link to="/admin/orders" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-center">
              Manage Orders
            </Link>
            <Link to="/admin/notifications" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-center">
              View Notifications
            </Link>
          </nav>
        </div>
      </header>

      {/* --- Admin Widgets Row --- */}
      <section className="max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Low Stock Alerts */}
        <div className="bg-red-50 border border-red-200 rounded shadow p-4">
          <h3 className="font-semibold text-red-700 mb-2">Low Stock Alerts</h3>
          {lowStockProducts.length === 0 ? (
            <p className="text-gray-500">All products well stocked.</p>
          ) : (
            <ul className="text-sm">
              {lowStockProducts.map(p => (
                <li key={p.id} className="mb-1">
                  <span className="font-medium">{p.model}</span> ({p.stock} left)
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Quick Admin Links */}
        <div className="bg-green-50 border border-green-200 rounded shadow p-4 flex flex-col gap-2">
          <h3 className="font-semibold text-green-700 mb-2">Quick Links</h3>
          {quickLinks.map(link => (
            link.to ? (
              <Link key={link.label} to={link.to} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-center block">
                {link.label}
              </Link>
            ) : (
              <button key={link.label} onClick={link.action} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-center block">
                {link.label}
              </button>
            )
          ))}
        </div>
      </section>

      {/* --- Stats Cards Row --- */}
      <section className="max-w-6xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-blue-600">
          <span className="text-gray-500 text-sm">Sales</span>
          <span className="text-2xl font-bold text-blue-700 mt-2">Rs. {formatCurrency(totalSales)}</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-green-600">
          <span className="text-gray-500 text-sm">Profit</span>
          <span className="text-2xl font-bold text-green-700 mt-2">Rs. {formatCurrency(totalProfit)}</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-purple-600">
          <span className="text-gray-500 text-sm">Total Orders</span>
          <span className="text-2xl font-bold text-purple-700 mt-2">{totalOrders}</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-green-600">
          <span className="text-gray-500 text-sm">Completed</span>
          <span className="text-2xl font-bold text-green-700 mt-2">{completedOrders}</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-yellow-500">
          <span className="text-gray-500 text-sm">Pending</span>
          <span className="text-2xl font-bold text-yellow-600 mt-2">{pendingOrders}</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-red-600">
          <span className="text-gray-500 text-sm">Cancelled</span>
          <span className="text-2xl font-bold text-red-700 mt-2">{canceledOrders}</span>
        </div>
      </section>

      {/* --- Charts Row --- */}
      <section className="max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-2">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={salesTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={v => `Rs. ${formatCurrency(v)}`} />
              <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-2">Order Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                {statusCounts.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-2">Top Products (by Sales)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" fontSize={12} hide />
              <YAxis dataKey="name" type="category" fontSize={12} width={100} />
              <Tooltip formatter={v => `Rs. ${formatCurrency(v)}`} />
              <Bar dataKey="sales" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* --- Recent Activity Feed --- */}
      <section className="max-w-6xl mx-auto mt-8 mb-8 bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-2">Recent Activity</h3>
        <ul className="text-sm">
          {recentActivity.map(a => (
            <li key={a.id} className="mb-1">
              <span className="font-medium">{a.action}</span>
              <span className="block text-xs text-gray-400">Details: {a.details}, User: {a.user_email}, Date: {a.date}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* --- Admin Analytics Controls & Charts --- */}
      <section className="max-w-6xl mx-auto mt-8 mb-8" ref={analyticsRef}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div className="flex gap-2 items-center">
            <label className="font-medium">From:</label>
            <input type="date" value={dateRange.from} onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))} className="border rounded px-2 py-1" />
            <label className="font-medium ml-2">To:</label>
            <input type="date" value={dateRange.to} onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))} className="border rounded px-2 py-1" />
          </div>
          <div className="flex gap-2">
            <button onClick={exportOrders} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">Export CSV</button>
            <button onClick={exportPDF} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition">Export PDF</button>
          </div>
        </div>
        <div className="overflow-auto border rounded p-2 bg-gray-50">
          {paginated.length === 0 ? (
            <p className="text-gray-500">No products found.</p>
          ) : (
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">Image</th>
                  <th className="p-2">Brand</th>
                  <th className="p-2">Model</th>
                  <th className="p-2">Price (Rs)</th>
                  <th className="p-2">Cost Price (Rs)</th>
                  <th className="p-2">Stock</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(p => (
                  editingId === p.id ? (
                    <tr className="border-t bg-blue-50" key={p.id}>
                      <td className="p-2">
                        {form.images && form.images.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {form.images.map((img, idx) => (
                              <img key={idx} src={img} alt={`Preview ${idx + 1}`} className="h-12 w-12 object-contain rounded border" />
                            ))}
                          </div>
                        )}
                        <input
                          id="images"
                          type="file"
                          name="images"
                          accept="image/*"
                          multiple
                          onChange={handleChange}
                          className="mt-2"
                        />
                        {form.images && form.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {form.images.map((img, idx) => (
                              <div key={idx} className="relative">
                                <img src={img} alt={`Preview ${idx + 1}`} className="h-24 object-contain rounded border" />
                                <button type="button" onClick={() => {
                                  setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
                                }} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        <input type="text" name="brand" value={form.brand} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                      </td>
                      <td className="p-2">
                        <input type="text" name="model" value={form.model} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
                      </td>
                      <td className="p-2">
                        <input type="number" name="price" value={form.price} onChange={handleChange} className="border rounded px-2 py-1 w-full" min="0" />
                      </td>
                      <td className="p-2">
                        <input type="number" name="costPrice" value={form.costPrice} onChange={handleChange} className="border rounded px-2 py-1 w-full" min="0" />
                      </td>
                      <td className="p-2">
                        <input type="number" name="stock" value={form.stock} onChange={handleChange} className="border rounded px-2 py-1 w-full" min="0" />
                      </td>
                      <td className="p-2 space-x-2">
                        <button type="button" onClick={handleSubmit} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Save</button>
                        <button type="button" onClick={handleCancel} className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400">Cancel</button>
                      </td>
                    </tr>
                  ) : (
                    <tr className="border-t" key={p.id}>
                      <td className="p-2">
                        <div className="flex gap-1">
                          {(p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : []).map((img, idx) => (
                            <img key={idx} src={img} alt={`Product ${idx + 1}`} className="h-12 w-12 object-contain rounded border" />
                          ))}
                        </div>
                      </td>
                      <td className="p-2">{p.brand}</td>
                      <td className="p-2">{p.model}</td>
                      <td className="p-2">{p.price?.toLocaleString()}</td>
                      <td className="p-2">{p.costPrice?.toLocaleString()}</td>
                      <td className="p-2">{p.stock}</td>
                      <td className="p-2 space-x-2">
                        <button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* --- Product Add/Edit Form (Professional, Comfortable UI) --- */}
      {!editingId && (
        <section ref={addFormRef} className="max-w-2xl mx-auto mt-10 mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-8 relative border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-2xl text-gray-800">
                {editingId ? "Edit Product" : "Add New Product"}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  aria-label="Cancel editing"
                  className="text-gray-400 hover:text-red-500 text-2xl font-bold px-2 focus:outline-none"
                >
                  ×
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
              <div>
                <label className="block font-semibold mb-1 text-gray-700" htmlFor="model">Model <span className="text-red-500">*</span></label>
                <input
                  id="model"
                  type="text"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                  placeholder="e.g. iPhone 14 Pro Max"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-gray-700" htmlFor="brand">Brand</label>
                <input
                  id="brand"
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                  placeholder="e.g. Apple"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block font-semibold mb-1 text-gray-700" htmlFor="price">Price (Rs) <span className="text-red-500">*</span></label>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                    placeholder="e.g. 120000"
                    required
                    min="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-semibold mb-1 text-gray-700" htmlFor="stock">Stock <span className="text-red-500">*</span></label>
                  <input
                    id="stock"
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                    placeholder="e.g. 10"
                    required
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-gray-700" htmlFor="image">Image</label>
                <input
                  id="images"
                  type="file"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                />
                {form.images && form.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img src={img} alt={`Preview ${idx + 1}`} className="h-24 object-contain rounded border" />
                        <button type="button" onClick={() => {
                          setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
                        }} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">×</button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">Upload a product image (optional).</p>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? (editingId ? "Updating..." : "Adding...") : (editingId ? "Update Product" : "Add Product")}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-lg shadow transition"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                )}
              </div>
              {/* Success or error message */}
              {productSaveStatus === 'success' && (
                <div className="text-green-600 font-semibold mt-2">Product saved successfully!</div>
              )}
              {productSaveStatus === 'error' && (
                <div className="text-red-600 font-semibold mt-2">Product save failed!</div>
              )}
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
