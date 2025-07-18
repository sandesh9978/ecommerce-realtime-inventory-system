import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
import { FaUser, FaMapMarkerAlt, FaCreditCard, FaSignOutAlt } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { getOrdersApi, getWishlistApi } from "./api/api";

const STATUS_TABS = [
  { key: "all", label: "My Orders" },
  { key: "pending", label: "Pending Payment" },
  { key: "processing", label: "Processing / To Ship" },
  { key: "shipped", label: "Shipped / In Transit" },
  { key: "delivered", label: "Delivered / Completed" },
  { key: "canceled", label: "Cancelled" },
];

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [searchId, setSearchId] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [restockAlerts, setRestockAlerts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [notifError, setNotifError] = useState("");
  const [wishlistError, setWishlistError] = useState("");
  const [restockError, setRestockError] = useState("");
  const [returnModal, setReturnModal] = useState({ open: false, order: null });
  const [returnReason, setReturnReason] = useState("");
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState("");
  const [returnSuccess, setReturnSuccess] = useState("");
  const [activeSidebarSection, setActiveSidebarSection] = useState('dashboard');
  const [activeManageTab, setActiveManageTab] = useState('profile');
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileName, setProfileName] = useState('Hello');
  const [profileEmail, setProfileEmail] = useState('hello@gmail.com');
  const [profileMobile, setProfileMobile] = useState('+977 981*****87');
  const [profileBirthday, setProfileBirthday] = useState('2000-01-21');
  const [profileGender, setProfileGender] = useState('male');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'khalti'
  // Add state for user reviews
  const [userReviews, setUserReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        setError("Please log in to view your orders");
        return;
      }
      setLoading(true);
      try {
        const res = await getOrdersApi(token);
        setOrders(res.data);
        setError("");
      } catch (err) {
        setError("Server error while fetching orders. Please try again later.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  // Fetch wishlist from backend
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await getWishlistApi(token);
        setWishlist(res.data);
      } catch {
        setWishlist([]);
      }
    };
    fetchWishlist();
  }, [token]);

  // Fetch user reviews from localStorage (if you store them, else set empty)
  useEffect(() => {
    try {
      const storedReviews = localStorage.getItem("userReviews");
      setUserReviews(storedReviews ? JSON.parse(storedReviews) : []);
      setReviewsError("");
    } catch {
      setUserReviews([]);
      setReviewsError("");
    }
    setReviewsLoading(false);
  }, []);

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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toString().includes(searchId.trim());
    if (activeTab === "all") return matchesSearch;
    return getStatusKey(order.status) === activeTab && matchesSearch;
  });

  // --- Analytics Widgets ---
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => getStatusKey(o.status) === "delivered").length;
  const pendingOrders = orders.filter((o) => getStatusKey(o.status) === "pending").length;
  const canceledOrders = orders.filter((o) => getStatusKey(o.status) === "canceled").length;
  const totalSales = orders.reduce((sum, o) => sum + (getStatusKey(o.status) === "delivered" ? Number(o.total_amount) : 0), 0);
  const recentOrders = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  // Orders per month chart data
  const ordersByMonth = {};
  orders.forEach((o) => {
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    ordersByMonth[key] = (ordersByMonth[key] || 0) + 1;
  });
  const chartLabels = Object.keys(ordersByMonth).sort();
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Orders per Month",
        data: chartLabels.map((k) => ordersByMonth[k]),
        borderColor: "#2563eb",
        backgroundColor: "#93c5fd",
        tension: 0.3,
      },
    ],
  };

  // CSV Export
  const exportOrdersCSV = () => {
    if (!orders.length) return;
    const header = [
      "Order ID,Total,Date,Status,Payment Method,Customer Name,Customer Email,Customer Phone,Customer City,Customer Address,Items"
    ];
    const rows = orders.map((o) => {
      const items = (o.items || []).map((i) => `${i.name} (x${i.quantity})`).join("; ");
      return [
        o.id,
        o.total_amount,
        new Date(o.created_at).toLocaleString(),
        o.status,
        o.payment_method || "",
        o.customer_name || "",
        o.customer_email || "",
        o.customer_phone || "",
        o.customer_city || "",
        o.customer_address || "",
        items.replace(/,/g, " ")
      ].join(",");
    });
    const csv = header.concat(rows).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Return/Refund Modal submit
  const submitReturn = async (e) => {
    e.preventDefault();
    setReturnLoading(true);
    setReturnError("");
    setReturnSuccess("");
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user"));
    try {
      const res = await fetch("http://localhost:5000/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: userData?.fullName || "",
          email: userData?.email || "",
          orderId: returnModal.order.id,
          reason: returnReason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReturnSuccess("Return/refund request submitted successfully.");
        setReturnModal({ open: false, order: null });
        setReturnReason("");
      } else {
        setReturnError(data.message || "Failed to submit request");
      }
    } catch {
      setReturnError("Server error");
    } finally {
      setReturnLoading(false);
    }
  };

  const categories = [
    "All Categories",
    "Motors, Tools & DIY",
    "Home & Lifestyle",
    "Sports & Outdoor",
    "Electronic Accessories",
    "Groceries & Pets",
    "Electronic Devices",
    "TV & Home Appliances",
    "Men's Fashion",
    "Watches & Accessories",
    "Women's Fashion",
    "Health & Beauty",
    "Babies & Toys",
  ];
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef();
  useEffect(() => {
    function handleClickOutside(e) {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
    }
    if (catOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [catOpen]);

  // Update profile info and save to localStorage
  const handleProfileSave = (updatedProfile) => {
    setProfileName(updatedProfile.fullName);
    setProfileEmail(updatedProfile.email);
    setProfileMobile(updatedProfile.mobile);
    setProfileBirthday(updatedProfile.dob);
    setProfileGender(updatedProfile.gender);
    // Save to localStorage
    const userData = {
      ...user,
      fullName: updatedProfile.fullName,
      email: updatedProfile.email,
      mobile: updatedProfile.mobile,
      dob: updatedProfile.dob,
      gender: updatedProfile.gender,
    };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Remove all shipping and billing useEffects and logic here

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white rounded shadow p-6 flex flex-col gap-4">
        <div className="text-gray-800 font-semibold mb-1">Hello, {user?.name || user?.fullName || "User"}</div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white mb-4">
          &#10003; Verified Account
        </span>
        <nav className="w-full">
          <div className="mb-2">
            <button className={`text-blue-700 font-bold text-base mb-1 hover:underline ${activeSidebarSection === 'manage-all' ? 'underline' : ''}`} onClick={() => setActiveSidebarSection('manage-all')}>Manage My Account</button>
            <ul className="ml-2 text-blue-600 font-medium space-y-1">
              <li><button className={`hover:underline ${activeSidebarSection === 'profile' ? 'font-bold underline' : ''}`} onClick={() => setActiveSidebarSection('profile')}>My Profile</button></li>
              <li><button className={`hover:underline ${activeSidebarSection === 'address' ? 'font-bold underline' : ''}`} onClick={() => setActiveSidebarSection('address')}>Address Book</button></li>
              <li><button className={`hover:underline ${activeSidebarSection === 'payment' ? 'font-bold underline' : ''}`} onClick={() => setActiveSidebarSection('payment')}>My Payment Options</button></li>
            </ul>
          </div>
          <div className="mb-2">
            <div className="font-bold text-gray-800 mb-1">My Orders</div>
            <ul className="ml-2 text-gray-700 font-medium space-y-1">
              <li><button className={`hover:underline ${activeSidebarSection === 'orders' ? 'font-bold underline' : ''}`} onClick={() => setActiveSidebarSection('orders')}>My Orders</button></li>
              <li><button className={`hover:underline ${activeSidebarSection === 'cancellations' ? 'font-bold underline' : ''}`} onClick={() => setActiveSidebarSection('cancellations')}>My Cancellations</button></li>
            </ul>
          </div>
          <div className="mb-2">
            <button className={`font-bold text-gray-800 mb-1 hover:underline ${activeSidebarSection === 'reviews' ? 'underline' : ''}`} onClick={() => setActiveSidebarSection('reviews')}>My Reviews</button>
          </div>
          <div className="mb-2">
            <button className={`font-bold text-gray-800 mb-1 hover:underline ${activeSidebarSection === 'wishlist' ? 'underline' : ''}`} onClick={() => setActiveSidebarSection('wishlist')}>My Wishlist</button>
          </div>
          <div className="mb-2">
            <button
              className={`font-bold text-gray-800 mb-1 hover:underline ${location.pathname === '/notifications' ? 'underline text-blue-700' : ''}`}
              onClick={() => navigate('/notifications')}
            >
              Notifications
            </button>
          </div>
          <div className="mb-2">
            <button className={`font-bold text-gray-800 mb-1 hover:underline ${activeSidebarSection === 'products' ? 'underline' : ''}`} onClick={() => setActiveSidebarSection('products')}>My Products</button>
          </div>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto p-6 font-sans text-gray-800">
        {activeSidebarSection === 'manage-all' ? (
          <section className="mb-8 bg-white rounded shadow p-6">
            <h2 className="text-2xl font-bold mb-6 text-blue-700">Manage My Account</h2>
            {/* Personal Profile */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Personal Profile</h3>
                <button className="text-blue-600 font-semibold hover:underline" onClick={() => setActiveSidebarSection('profile')}>EDIT</button>
              </div>
              <div className="ml-2 text-gray-800">{profileName}</div>
              <div className="ml-2 text-gray-600">{profileEmail}</div>
            </div>
            {/* Address Book */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Address Book</h3>
                <button className="text-blue-600 font-semibold hover:underline" onClick={() => setActiveSidebarSection('address')}>EDIT</button>
              </div>
              <div className="ml-2 text-gray-700 italic">See Address Book section for your default addresses.</div>
            </div>
            {/* Recent Orders */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Order #</th>
                      <th className="p-2 border">Placed On</th>
                      <th className="p-2 border">Items</th>
                      <th className="p-2 border">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 text-center">123456</td>
                      <td className="p-2 text-center">2024-05-01</td>
                      <td className="p-2 text-center">2</td>
                      <td className="p-2 text-center">Rs. 2,000</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-center">123457</td>
                      <td className="p-2 text-center">2024-04-28</td>
                      <td className="p-2 text-center">1</td>
                      <td className="p-2 text-center">Rs. 1,200</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : activeSidebarSection === 'profile' ? (
          <section className="mb-8 bg-white rounded shadow p-6">
            <h2 className="text-2xl font-bold mb-6 text-blue-700">My Profile</h2>
            {profileEdit ? (
              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mb-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setProfileLoading(true);
                  setProfileError('');
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch('http://localhost:5000/api/auth/profile', {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        fullName: profileName,
                        email: profileEmail,
                        mobile: profileMobile,
                        dob: profileBirthday,
                        gender: profileGender,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || 'Failed to update profile');
                    // Update localStorage and UI
                    localStorage.setItem('user', JSON.stringify(data.user));
                    setProfileName(data.user.fullName || '');
                    setProfileEmail(data.user.email || '');
                    setProfileMobile(data.user.mobile || '');
                    setProfileBirthday(data.user.dob || '');
                    setProfileGender(data.user.gender || '');
                    setProfileEdit(false);
                  } catch (err) {
                    setProfileError(err.message || 'Failed to update profile');
                  } finally {
                    setProfileLoading(false);
                  }
                }}
              >
                <div>
                  <div className="text-gray-500 text-xs font-semibold">Full Name</div>
                  <input className="border rounded px-2 py-1 w-full" value={profileName} onChange={e => setProfileName(e.target.value)} required />
                </div>
                <div>
                  <div className="text-gray-500 text-xs font-semibold flex items-center">Email Address</div>
                  <input className="border rounded px-2 py-1 w-full" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} required />
                </div>
                <div>
                  <div className="text-gray-500 text-xs font-semibold flex items-center">Mobile</div>
                  <input className="border rounded px-2 py-1 w-full" value={profileMobile} onChange={e => setProfileMobile(e.target.value)} />
                </div>
                <div>
                  <div className="text-gray-500 text-xs font-semibold">Birthday</div>
                  <input type="date" className="border rounded px-2 py-1 w-full" value={profileBirthday} onChange={e => setProfileBirthday(e.target.value)} />
                </div>
                <div>
                  <div className="text-gray-500 text-xs font-semibold">Gender</div>
                  <select className="border rounded px-2 py-1 w-full" value={profileGender} onChange={e => setProfileGender(e.target.value)}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="col-span-2 flex gap-4 mt-6">
                  <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded font-semibold hover:bg-blue-700" disabled={profileLoading}>{profileLoading ? 'Saving...' : 'Save'}</button>
                  <button type="button" className="bg-gray-200 text-blue-700 px-5 py-2 rounded font-semibold hover:bg-blue-100" onClick={() => setProfileEdit(false)} disabled={profileLoading}>Cancel</button>
                </div>
                {profileError && <div className="col-span-2 text-red-600 mt-2">{profileError}</div>}
              </form>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mb-4">
                  <div>
                    <div className="text-gray-500 text-xs font-semibold">Full Name</div>
                    <div className="text-gray-900 font-medium">{profileName}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs font-semibold flex items-center">Email Address <button className="ml-2 text-blue-600 text-xs font-semibold hover:underline cursor-pointer">Change</button></div>
                    <div className="text-gray-900 font-medium">{profileEmail}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs font-semibold flex items-center">Mobile <button className="ml-2 text-blue-600 text-xs font-semibold hover:underline cursor-pointer">Change</button></div>
                    <div className="text-gray-900 font-medium">{profileMobile}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs font-semibold">Birthday</div>
                    <div className="text-gray-900 font-medium">{profileBirthday}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs font-semibold">Gender</div>
                    <div className="text-gray-900 font-medium capitalize">{profileGender}</div>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button className="bg-blue-600 text-white px-5 py-2 rounded font-semibold hover:bg-blue-700" onClick={() => setProfileEdit(true)}>EDIT PROFILE</button>
                  <button className="bg-gray-200 text-blue-700 px-5 py-2 rounded font-semibold hover:bg-blue-100">CHANGE PASSWORD</button>
                </div>
              </>
            )}
          </section>
        ) : activeSidebarSection === 'address' ? (
          <section className="mb-8 bg-white rounded shadow p-6">
            <h2 className="text-2xl font-bold mb-6 text-blue-700">Address Book</h2>
            <AddressBook />
          </section>
        ) : activeSidebarSection === 'payment' ? (
          <section className="mb-8 bg-white rounded shadow p-6">
            <h2 className="text-2xl font-bold mb-6 text-blue-700">My Payment Options</h2>
            <div className="mb-4 text-gray-700 font-semibold">Select Payment Method</div>
            <div className="flex gap-6 mb-6">
              <label className={`flex items-center gap-2 px-4 py-3 rounded cursor-pointer border-2 transition-all ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-400'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-blue-600"
                />
                <span className="font-medium">Cash on Delivery</span>
              </label>
              <label className={`flex items-center gap-2 px-4 py-3 rounded cursor-pointer border-2 transition-all ${paymentMethod === 'khalti' ? 'border-purple-600 bg-purple-50' : 'border-gray-300 bg-white hover:border-purple-400'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="khalti"
                  checked={paymentMethod === 'khalti'}
                  onChange={() => setPaymentMethod('khalti')}
                  className="accent-purple-600"
                />
                <span className="font-medium">Khalti</span>
              </label>
            </div>
            <div className="mt-4 text-gray-600">Selected: <span className="font-bold">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Khalti'}</span></div>
          </section>
        ) : activeSidebarSection === 'orders' ? (
          <section className="mb-8 bg-white rounded shadow p-6">
            <h2 className="text-2xl font-bold mb-6 text-blue-700">My Orders</h2>
            {orders.length === 0 ? (
              <p className="text-gray-600">No orders found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Order ID</th>
                      <th className="p-2 border">Total</th>
                      <th className="p-2 border">Date</th>
                      <th className="p-2 border">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="p-2 text-center">{order.id}</td>
                        <td className="p-2 text-right">Rs. {formatCurrency(order.total_amount)}</td>
                        <td className="p-2 text-center">{new Date(order.created_at).toLocaleString()}</td>
                        <td className="p-2 text-center">{order.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : activeSidebarSection === 'cancellations' ? (
          <section className="mb-8 bg-white rounded shadow p-6">
            <h2 className="text-2xl font-bold mb-6 text-blue-700">My Cancellations</h2>
            {orders.filter(o => getStatusKey(o.status) === 'canceled').length === 0 ? (
              <p className="text-gray-600">No cancelled orders found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Order ID</th>
                      <th className="p-2 border">Date</th>
                      <th className="p-2 border">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.filter(o => getStatusKey(o.status) === 'canceled').map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="p-2 text-center">{order.id}</td>
                        <td className="p-2 text-center">{new Date(order.created_at).toLocaleString()}</td>
                        <td className="p-2 text-center">{order.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : activeSidebarSection === 'reviews' ? (
          <section className="mb-8 bg-white rounded shadow p-6">
            <h2 className="text-2xl font-bold mb-6 text-blue-700">My Reviews</h2>
            {userReviews.length === 0 ? (
              <p className="text-gray-600">No reviews found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Product</th>
                      <th className="p-2 border">Rating</th>
                      <th className="p-2 border">Comment</th>
                      <th className="p-2 border">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userReviews.map((r) => (
                      <tr key={r.id}>
                        <td className="p-2 border">{r.productName}</td>
                        <td className="p-2 border">{"⭐".repeat(r.rating)}</td>
                        <td className="p-2 border">{r.comment}</td>
                        <td className="p-2 border">{new Date(r.createdAt || r.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : activeSidebarSection === 'wishlist' ? (
          <section className="mb-8 bg-white rounded shadow p-6">
            <h2 className="text-2xl font-bold mb-6 text-blue-700">My Wishlist & Followed Stores</h2>
            {wishlist.length === 0 ? (
              <p className="text-gray-600">No wishlist items found.</p>
            ) : (
              <ul className="list-disc ml-5">
                {wishlist.map((item, idx) => (
                  <li key={idx}>{item.name} - Rs. {item.price?.toLocaleString()}</li>
                ))}
              </ul>
            )}
          </section>
        ) : activeSidebarSection === 'products' ? (
          <section className="mb-8 bg-white rounded shadow p-6">
            <h2 className="text-2xl font-bold mb-6 text-blue-700">My Products</h2>
            <div className="mb-4 text-gray-700 font-semibold">Manage your products here.</div>
            <div className="flex gap-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">Add New Product</button>
              <button className="bg-gray-200 text-blue-700 px-4 py-2 rounded font-semibold hover:bg-blue-100">View All Products</button>
            </div>
          </section>
        ) : (
          <>
            <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="mb-2">
                  <a href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition font-semibold">Home</a>
                </div>
                <h1 className="text-3xl font-bold mb-1">🛒 My Dashboard</h1>
                {user ? (
                  <p className="text-lg text-gray-600">
                    Welcome, <span className="font-semibold">{user.email}</span>!
                  </p>
                ) : (
                  <div className="text-red-500">
                    <p>User not logged in.</p>
                    <a href="/login" className="text-blue-600 hover:underline">Click here to log in</a>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="🔍 Search Order ID"
                  className="border border-gray-300 rounded px-4 py-2 flex-1 md:max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  onClick={exportOrdersCSV}
                  disabled={!orders.length}
                >
                  Download CSV
                </button>
              </div>
            </header>

            {/* --- Analytics Widgets --- */}
            <section className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded shadow p-4 flex flex-col items-center">
                <span className="text-2xl font-bold text-blue-600">{totalOrders}</span>
                <span className="text-gray-600 mt-1">Total Orders</span>
              </div>
              <div className="bg-white rounded shadow p-4 flex flex-col items-center">
                <span className="text-2xl font-bold text-green-600">{completedOrders}</span>
                <span className="text-gray-600 mt-1">Completed</span>
              </div>
              <div className="bg-white rounded shadow p-4 flex flex-col items-center">
                <span className="text-2xl font-bold text-yellow-600">{pendingOrders}</span>
                <span className="text-gray-600 mt-1">Pending</span>
              </div>
              <div className="bg-white rounded shadow p-4 flex flex-col items-center">
                <span className="text-2xl font-bold text-red-600">{canceledOrders}</span>
                <span className="text-gray-600 mt-1">Cancelled</span>
              </div>
            </section>
            {/* Removed Sales Overview section for user dashboard */}
            <section className="mb-8 bg-white rounded shadow p-4">
              <h2 className="text-lg font-semibold mb-2">Recent Orders</h2>
              {recentOrders.length === 0 ? (
                <p className="text-gray-500">No recent orders.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 border">Order ID</th>
                        <th className="p-2 border">Total</th>
                        <th className="p-2 border">Date</th>
                        <th className="p-2 border">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b">
                          <td className="p-2 text-center">{order.id}</td>
                          <td className="p-2 text-right">Rs. {formatCurrency(order.total_amount)}</td>
                          <td className="p-2 text-center">{new Date(order.created_at).toLocaleString()}</td>
                          <td className="p-2 text-center">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                getStatusKey(order.status) === "canceled"
                                  ? "bg-red-100 text-red-700"
                                  : getStatusKey(order.status) === "delivered"
                                  ? "bg-green-100 text-green-700"
                                  : getStatusKey(order.status) === "shipped"
                                  ? "bg-blue-100 text-blue-700"
                                  : getStatusKey(order.status) === "processing"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {order.status || "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
            {/* --- Orders Per Month Chart --- */}
            <section className="mb-8 bg-white rounded shadow p-4">
              <h2 className="text-lg font-semibold mb-2">Orders Per Month</h2>
              <div className="w-full h-64">
                <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </section>
            {/* --- Wishlist & Restock Alerts Widgets --- */}
            <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded shadow p-4">
                <h2 className="text-lg font-semibold mb-2">Wishlist</h2>
                {wishlistError && <div className="text-red-600 mb-2">{wishlistError}</div>}
                {wishlist.length === 0 ? (
                  <div className="text-gray-500">No wishlist items.</div>
                ) : (
                  <ul className="list-disc ml-5">
                    {wishlist.slice(0, 5).map((item, idx) => (
                      <li key={idx}>{item.name} - Rs. {item.price?.toLocaleString()}</li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Removed Restock Alerts section */}
            </section>
            {/* --- Notifications/Recent Activity Widget --- */}
            <section className="mb-8 bg-white rounded shadow p-4">
              <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
              {notifError && <div className="text-red-600 mb-2">{notifError}</div>}
              {activity.length === 0 ? (
                <div className="text-gray-500">No recent activity.</div>
              ) : (
                <ul className="list-disc ml-5">
                  {activity.slice(0, 5).map((act, idx) => (
                    <li key={idx}>{act.action} - {act.details} ({new Date(act.created_at).toLocaleString()})</li>
                  ))}
                </ul>
              )}
            </section>
            {/* My Reviews Section */}
            <section className="mb-8 bg-white rounded shadow p-4">
              <h2 className="text-lg font-semibold mb-2">My Reviews</h2>
              {reviewsLoading ? (
                <p>Loading...</p>
              ) : reviewsError ? (
                <p className="text-red-600">{reviewsError}</p>
              ) : userReviews.length === 0 ? (
                <p className="text-gray-600">No reviews found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 border">Product</th>
                        <th className="p-2 border">Rating</th>
                        <th className="p-2 border">Comment</th>
                        <th className="p-2 border">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userReviews.map((r) => (
                        <tr key={r.id}>
                          <td className="p-2 border">{r.productName}</td>
                          <td className="p-2 border">{"⭐".repeat(r.rating)}</td>
                          <td className="p-2 border">{r.comment}</td>
                          <td className="p-2 border">{new Date(r.createdAt || r.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Tab Navigation for mobile */}
            <nav className="flex md:hidden gap-2 mb-6 overflow-x-auto">
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
                                    statusKey === "canceled"
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
                                  {order.status || "Pending"}
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
                                {canCancel && (
                                  <button
                                    onClick={() => handleCancelOrder(order.id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                                  >
                                    Cancel Order
                                  </button>
                                )}
                                {statusKey === "delivered" && (
                                  <button
                                    onClick={() => setReturnModal({ open: true, order })}
                                    className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition ml-2"
                                  >
                                    Request Return/Refund
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
            {/* Return/Refund Modal */}
            {returnModal.open && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <form className="bg-white rounded shadow p-6 w-full max-w-md" onSubmit={submitReturn}>
                  <h2 className="text-xl font-bold mb-4">Request Return/Refund</h2>
                  <div className="mb-2"><strong>Order ID:</strong> {returnModal.order.id}</div>
                  <label className="block mb-2">Reason
                    <textarea
                      value={returnReason}
                      onChange={e => setReturnReason(e.target.value)}
                      className="border rounded px-3 py-2 w-full"
                      required
                    />
                  </label>
                  {returnError && <div className="text-red-600 mb-2">{returnError}</div>}
                  {returnSuccess && <div className="text-green-600 mb-2">{returnSuccess}</div>}
                  <div className="flex gap-2 justify-end mt-4">
                    <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setReturnModal({ open: false, order: null })} disabled={returnLoading}>Cancel</button>
                    <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded" disabled={returnLoading}>Submit</button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// Helper to generate unique IDs
const generateId = () => "_" + Math.random().toString(36).substr(2, 9);

// AddressBook component definition
function AddressBook() {
  // Load addresses from localStorage on mount
  const [addresses, setAddresses] = useState(() => {
    try {
      const stored = localStorage.getItem("addresses");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save addresses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("addresses", JSON.stringify(addresses));
  }, [addresses]);

  // Form state
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    postcode: "",
    phone: "",
    isDefaultShipping: false,
    isDefaultBilling: false,
  });
  const [editingId, setEditingId] = useState(null);

  // Handle form input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Add or update address
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.address || !form.phone) return;

    let updatedAddresses;
    if (editingId) {
      updatedAddresses = addresses.map((a) =>
        a.id === editingId ? { ...a, ...form } : a
      );
    } else {
      updatedAddresses = [
        ...addresses,
        { ...form, id: generateId() },
      ];
    }

    // Ensure only one default shipping and billing
    if (form.isDefaultShipping) {
      updatedAddresses = updatedAddresses.map((a) =>
        a.id !== (editingId || "") ? { ...a, isDefaultShipping: false } : a
      );
    }
    if (form.isDefaultBilling) {
      updatedAddresses = updatedAddresses.map((a) =>
        a.id !== (editingId || "") ? { ...a, isDefaultBilling: false } : a
      );
    }

    setAddresses(updatedAddresses);
    setForm({
      fullName: "",
      address: "",
      postcode: "",
      phone: "",
      isDefaultShipping: false,
      isDefaultBilling: false,
    });
    setEditingId(null);
  };

  // Edit address
  const handleEdit = (addr) => {
    setForm(addr);
    setEditingId(addr.id);
  };

  // Delete address
  const handleDelete = (id) => {
    setAddresses(addresses.filter((a) => a.id !== id));
    if (editingId === id) {
      setForm({
        fullName: "",
        address: "",
        postcode: "",
        phone: "",
        isDefaultShipping: false,
        isDefaultBilling: false,
      });
      setEditingId(null);
    }
  };

  // Set default shipping/billing
  const setDefault = (id, type) => {
    setAddresses(addresses.map((a) => ({
      ...a,
      isDefaultShipping: type === "shipping" ? a.id === id : a.isDefaultShipping,
      isDefaultBilling: type === "billing" ? a.id === id : a.isDefaultBilling,
    })));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          className="border p-2 w-full"
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
        />
        <input
          className="border p-2 w-full"
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
        />
        <input
          className="border p-2 w-full"
          name="postcode"
          placeholder="Postcode"
          value={form.postcode}
          onChange={handleChange}
        />
        <input
          className="border p-2 w-full"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
        />
        <label>
          <input
            type="checkbox"
            name="isDefaultShipping"
            checked={form.isDefaultShipping}
            onChange={handleChange}
          />{" "}
          Default Shipping
        </label>
        <label>
          <input
            type="checkbox"
            name="isDefaultBilling"
            checked={form.isDefaultBilling}
            onChange={handleChange}
          />{" "}
          Default Billing
        </label>
        <div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
          >
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => {
                setForm({
                  fullName: "",
                  address: "",
                  postcode: "",
                  phone: "",
                  isDefaultShipping: false,
                  isDefaultBilling: false,
                });
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Address</th>
            <th className="p-2 border">Postcode</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Default</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {addresses.map((a) => (
            <tr key={a.id}>
              <td className="p-2 border">{a.fullName}</td>
              <td className="p-2 border">{a.address}</td>
              <td className="p-2 border">{a.postcode}</td>
              <td className="p-2 border">{a.phone}</td>
              <td className="p-2 border">
                {a.isDefaultShipping && (
                  <span className="text-green-600 text-xs block">Shipping</span>
                )}
                {a.isDefaultBilling && (
                  <span className="text-blue-600 text-xs block">Billing</span>
                )}
                {!a.isDefaultShipping && (
                  <button
                    className="text-xs text-green-700 underline"
                    onClick={() => setDefault(a.id, "shipping")}
                  >
                    Set Shipping
                  </button>
                )}
                {!a.isDefaultBilling && (
                  <button
                    className="text-xs text-blue-700 underline"
                    onClick={() => setDefault(a.id, "billing")}
                  >
                    Set Billing
                  </button>
                )}
              </td>
              <td className="p-2 border">
                <button
                  className="text-xs text-yellow-700 underline mr-2"
                  onClick={() => handleEdit(a)}
                >
                  Edit
                </button>
                <button
                  className="text-xs text-red-700 underline"
                  onClick={() => handleDelete(a.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {addresses.length === 0 && (
            <tr>
              <td colSpan={6} className="p-2 text-center text-gray-500">
                No addresses saved.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex flex-col md:flex-row gap-4 mb-4 mt-6">
        <div className="flex-1 bg-blue-50 rounded p-3">
          <div className="font-bold text-blue-700 mb-1">Default Shipping Address</div>
          {addresses.find(a => a.isDefaultShipping) ? (
            <div className="text-gray-800 text-sm">{addresses.find(a => a.isDefaultShipping).address}</div>
          ) : <div className="text-gray-500 text-sm">No default shipping address</div>}
        </div>
        <div className="flex-1 bg-green-50 rounded p-3">
          <div className="font-bold text-green-700 mb-1">Default Billing Address</div>
          {addresses.find(a => a.isDefaultBilling) ? (
            <div className="text-gray-800 text-sm">{addresses.find(a => a.isDefaultBilling).address}</div>
          ) : <div className="text-gray-500 text-sm">No default billing address</div>}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
