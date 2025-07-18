import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import KhaltiCheckout from "khalti-checkout-web";
import { useProducts, defaultProducts, addDeletedProductId } from "./context/ProductContext";
import ChatBot from "./component/ChatBot";
import Markdown from "./component/Markdown";
import OrderHistory from "./OrderHistory";
import WishlistPage from "./WishlistPage";
import { FaHome, FaBoxOpen, FaCreditCard, FaTruck, FaInbox, FaRegCommentDots, FaUndo, FaTimesCircle, FaCamera, FaEdit, FaTrash, FaPlus, FaCheckCircle, FaUserShield, FaUser, FaSignOutAlt, FaSmile, FaHeart, FaStar, FaBox } from "react-icons/fa";

const defaultSections = [
  { type: "heading", content: "Welcome to Our Mobile Store" },
  { type: "paragraph", content: "Discover the latest smartphones and accessories at unbeatable prices. Enjoy real-time inventory, fast checkout, and a seamless shopping experience!" },
  { type: "paragraph", content: "Browse our curated selection, add to your wishlist, and shop with confidence. Our admin dashboard ensures up-to-date stock and smooth order management." },
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[()+,]/g, "")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function HomePage() {
  // Load user from localStorage, including profilePic if present
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    let profilePic = "/default-avatar.svg";
    let name = "";
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role === "admin") {
        profilePic = localStorage.getItem("adminProfilePic") || parsedUser.profilePic || "/default-avatar.svg";
        name = localStorage.getItem("adminName") || parsedUser.name || "Admin";
      } else {
        profilePic = localStorage.getItem("userProfilePic") || parsedUser.profilePic || "/default-avatar.svg";
        name = localStorage.getItem("userName") || parsedUser.name || "User";
      }
      return {
        ...parsedUser,
        profilePic,
        name,
      };
    }
    // If no user, fallback to userProfilePic and userName
    profilePic = localStorage.getItem("userProfilePic") || "/default-avatar.svg";
    name = localStorage.getItem("userName") || "User";
    return { profilePic, name };
  });
  const [search, setSearch] = useState("");
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscribeMessage, setSubscribeMessage] = useState("");

  // Cart and Wishlist states initialized from localStorage (parse safely)
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch {
      return [];
    }
  });

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderStatus, setOrderStatus] = useState({ message: null, error: false, loading: false });

  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem("homeSections");
    return saved ? JSON.parse(saved) : defaultSections;
  });
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [addType, setAddType] = useState("paragraph");
  const [addValue, setAddValue] = useState("");
  const isAdmin = user && user.role === "admin";
  const [activeSection, setActiveSection] = useState('orders');
  const [orderCounts, setOrderCounts] = useState({
    total: 0,
    returnRefund: 0,
    cancelled: 0
  });

  // State for fetched orders
  const [orders, setOrders] = useState([]);
  const [activeDashboardSection, setActiveDashboardSection] = useState("account");

  // For products, ensure useProducts context is synced with localStorage
  const { products: contextProducts, setProducts } = useProducts();
  const [products, setLocalProducts] = useState(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : contextProducts;
  });
  useEffect(() => {
    setProducts(products);
    localStorage.setItem('products', JSON.stringify(products));
  }, [products, setProducts]);

  // For cart and wishlist, already using localStorage sync in useEffect
  // For sections, already using localStorage sync in useEffect
  // Update all add, update, delete actions for products to use setLocalProducts
  // Example for edit product:
  // Example for delete product:
  // Example for add product:

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    localStorage.setItem("homeSections", JSON.stringify(sections));
  }, [sections]);

  // Sync cart and wishlist to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Fetch real order counts from backend
  useEffect(() => {
    if (user && user.token) {
      fetchOrderCounts();
    }
  }, [user]);

  // Fetch orders for the user
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !user.token) return;
      try {
        const response = await fetch("http://localhost:5000/api/orders", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
          // Debug log: print all orders and their statuses
          console.log("Fetched orders:", data.map(o => ({ id: o.id || o.orderId, status: o.status })));
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };
    fetchOrders();
  }, [user]);

  const fetchOrderCounts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const orders = await response.json();
        // Only count total, returnRefund, and cancelled
        const counts = {
          total: orders.length,
          returnRefund: 0, // This would need a separate API call for return requests
          cancelled: orders.filter(order => order.status === 'cancelled').length
        };
        setOrderCounts(counts);
      }
    } catch (error) {
      console.error("Failed to fetch order counts:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // Store categories in state, initialize from localStorage if available
  const [categories, setCategories] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('homeCategories'));
      if (stored && Array.isArray(stored) && stored.length > 0) return stored;
    } catch {}
    return [
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
  });
  // Persist categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('homeCategories', JSON.stringify(categories));
  }, [categories]);
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

  // Filter products by selectedCategory and isFeatured
  const filteredProducts = Array.isArray(products)
    ? products.filter(
      (p) =>
        (selectedCategory === "All Categories" || p.category === selectedCategory) &&
        (p.model || p.name || "").toLowerCase().includes(search.toLowerCase())
    )
    : [];

  // Newsletter subscribe handler
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!subscriberEmail.includes("@")) {
      setSubscribeMessage("❌ Please enter a valid email address.");
      return;
    }
    setSubscribeMessage("✅ Thank you for subscribing!");
    setSubscriberEmail("");
  };

  // Add product to cart (increase quantity if exists)
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Always set name property
      return [
        ...prev,
        {
          ...product,
          name: product.model || product.name || "Product",
          quantity: 1,
        },
      ];
    });
    alert(`Added "${product.model || product.name || 'Product'}" to cart.`);
  };

  // Add product to wishlist if not already present
  const addToWishlist = (product) => {
    setWishlist((prev) => {
      if (prev.find((item) => item.id === product.id)) {
        alert("Already in wishlist!");
        return prev;
      }
      alert(`Added "${product.model || product.name}" to wishlist.`);
      return [...prev, product];
    });
  };

  // Utility function to clear all localStorage data
  const clearAllData = () => {
    if (window.confirm("This will clear all cart, wishlist, and other stored data. Continue?")) {
      localStorage.removeItem("cart");
      localStorage.removeItem("wishlist");
      localStorage.removeItem("cartItems"); // Remove old key too
      setCart([]);
      setWishlist([]);
      alert("All data cleared successfully!");
    }
  };

  // Open payment modal with product
  const handleBuyNow = (product) => {
    setSelectedProduct(product);
    setOrderStatus({ message: null, error: false, loading: false });
    setPaymentModalOpen(true);
  };

  // Close payment modal & clear selected product/status
  const closeModal = () => {
    setPaymentModalOpen(false);
    setSelectedProduct(null);
    setOrderStatus({ message: null, error: false, loading: false });
  };

  // In saveOrder, use the correct backend format
  const saveOrder = async (paymentMethod, product) => {
    setOrderStatus({ message: null, error: false, loading: true });
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id;
      const userInfo = {
        fullName: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        city: user.city || "",
        postalCode: user.postalCode || ""
      };
      const orderData = {
        userId,
        products: [
          {
            productId: product.id,
            quantity: 1,
            price: product.price
          }
        ],
        paymentMethod,
        userInfo
      };
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const result = await response.json();

      if (result.success) {
        setOrderStatus({
          message: `Order placed successfully with ${paymentMethod}.`,
          error: false,
          loading: false,
        });
      } else {
        throw new Error(result.message || "Failed to save order.");
      }
    } catch (error) {
      setOrderStatus({ message: `Error: ${error.message}`, error: true, loading: false });
    }
  };

  // Khalti payment integration
  const handleKhaltiPayment = (product) => {
    const khaltiConfig = {
      publicKey: "test_public_key_dc74b7a36c6e47c6b4d33a446e4f69c7",
      productIdentity: product.id.toString(),
      productName: product.name,
      productUrl: window.location.href,
      eventHandler: {
        onSuccess(payload) {
          alert("✅ Payment Successful!");
          saveOrder("Khalti", product);
          closeModal();
        },
        onError(error) {
          alert("❌ Payment Failed. Please try again.");
          console.error("Khalti payment error:", error);
        },
        onClose() {
          console.log("Khalti widget closed.");
        },
      },
      paymentPreference: ["KHALTI", "EBANKING", "MOBILE_BANKING", "CONNECT_IPS", "SCT"],
    };

    const checkout = new KhaltiCheckout(khaltiConfig);
    checkout.show({ amount: product.price * 100 }); // paisa
  };

  // Handle selection of payment method in modal
  const handlePaymentSelection = (method) => {
    if (!selectedProduct) return;
    if (method === "Khalti") {
      handleKhaltiPayment(selectedProduct);
    } else if (method === "Cash on Delivery") {
      saveOrder("Cash on Delivery", selectedProduct);
      alert("Order placed with Cash on Delivery!");
      closeModal();
    }
  };

  const handleEdit = (idx) => {
    setEditIndex(idx);
    setEditValue(sections[idx].content);
  };

  const handleEditSave = (idx) => {
    const updated = [...sections];
    updated[idx].content = editValue;
    setSections(updated);
    setEditIndex(null);
    setEditValue("");
  };

  const handleDelete = (idx) => {
    if (window.confirm("Delete this section?")) {
      setSections(sections.filter((_, i) => i !== idx));
    }
  };

  const handleAddSection = () => {
    let newSection;
    if (addType === "heading") {
      newSection = { type: "heading", content: addValue };
    } else {
      newSection = { type: "paragraph", content: addValue };
    }
    setSections([...sections, newSection]);
    setAddValue("");
  };

  // Sidebar navigation items for main pages (no order statuses)
  const sidebarLinks = [
    { key: 'home', label: 'Home', icon: <FaHome />, path: '/' },
    { key: 'about', label: 'About', icon: <FaRegCommentDots />, path: '/about' },
    { key: 'contact', label: 'Contact', icon: <FaInbox />, path: '/contact' },
    { key: 'wishlist', label: 'Wishlist', icon: <FaHeart />, path: '/wishlist' },
    { key: 'mycancellations', label: 'My Cancellations', icon: <FaTimesCircle />, path: '/orders' },
    { key: 'cart', label: 'Cart', icon: <FaBoxOpen />, path: '/cart' },
    { key: 'products', label: 'Products', icon: <FaBox />, path: '/products' },
    { key: 'howtoorder', label: 'How to Order', icon: <FaTruck />, path: '/how-to-order' },
    { key: 'paymentpolicy', label: 'Payment Policy', icon: <FaCreditCard />, path: '/payment-policy' },
    { key: 'faq', label: 'FAQs', icon: <FaSmile />, path: '/faq' },
    { key: 'returns', label: 'Returns', icon: <FaUndo />, path: '/return-refund' },
    { key: 'feedback', label: 'Feedback', icon: <FaStar />, path: '/feedback' },
  ];

  // Add a ref for the file input
  const fileInputRef = useRef();

  // Add state for editing name
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');

  // Handle profile image upload
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUser((prev) => {
          const updatedUser = { ...prev, profilePic: event.target.result };
          // Also update the user object in localStorage
          const storedUser = JSON.parse(localStorage.getItem('user')) || {};
          localStorage.setItem('user', JSON.stringify({ ...storedUser, profilePic: event.target.result }));
          // Save to the correct key based on role
          if (updatedUser.role === "admin") {
            localStorage.setItem('adminProfilePic', event.target.result);
          } else {
            localStorage.setItem('userProfilePic', event.target.result);
          }
          return updatedUser;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle name save
  const handleNameSave = () => {
    setUser((prev) => {
      const updatedUser = { ...prev, name: editedName };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Save to the correct key based on role
      if (updatedUser.role === "admin") {
        localStorage.setItem('adminName', editedName);
      } else {
        localStorage.setItem('userName', editedName);
      }
      // Also update profilePic in localStorage if present (for legacy)
      if (updatedUser.profilePic) {
        localStorage.setItem('profilePic', updatedUser.profilePic);
      }
      return updatedUser;
    });
    setIsEditingName(false);
  };

  // On mount, always set activeSection to 'home'
  useEffect(() => {
    setActiveSection('home');
    // On mount, sync user state with localStorage (in case profilePic or name changed elsewhere)
    const storedUser = localStorage.getItem("user");
    let profilePic = "/default-avatar.svg";
    let name = "";
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role === "admin") {
        profilePic = localStorage.getItem("adminProfilePic") || parsedUser.profilePic || "/default-avatar.svg";
        name = localStorage.getItem("adminName") || parsedUser.name || "Admin";
      } else {
        profilePic = localStorage.getItem("userProfilePic") || parsedUser.profilePic || "/default-avatar.svg";
        name = localStorage.getItem("userName") || parsedUser.name || "User";
      }
      setUser({
        ...parsedUser,
        profilePic,
        name,
      });
    } else {
      profilePic = localStorage.getItem("userProfilePic") || "/default-avatar.svg";
      name = localStorage.getItem("userName") || "User";
      setUser({ profilePic, name });
    }
  }, []);

  // Sidebar content
  const renderSidebar = () => (
    <div className="w-full max-w-xs mx-auto">
      {/* Sidebar content only, 3D background removed */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-blue-100">
        {/* Profile */}
        <div className="relative mb-6">
          <div className="bg-gradient-to-tr from-blue-200 to-blue-50 rounded-full p-1 shadow-lg">
            <img
              src={user?.profilePic || '/default-avatar.svg'}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow transition-transform hover:scale-105"
            />
            <button
              className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2 shadow-lg hover:bg-blue-700 transition"
              aria-label="Edit profile picture"
              title="Edit profile picture"
              onClick={() => fileInputRef.current.click()}
            >
              <FaCamera />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleProfileImageChange}
            />
          </div>
        </div>
        <div className="text-center mb-4">
          {isEditingName ? (
            <div className="flex flex-col items-center gap-2">
              <input
                type="text"
                value={editedName}
                onChange={e => setEditedName(e.target.value)}
                className="border rounded px-2 py-1 text-center"
                autoFocus
              />
              <div className="flex gap-2 justify-center">
                <button
                  className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                  onClick={handleNameSave}
                >
                  Save
                </button>
                <button
                  className="bg-gray-300 text-gray-800 px-2 py-1 rounded text-xs hover:bg-gray-400"
                  onClick={() => { setIsEditingName(false); setEditedName(user?.name || ''); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-2xl font-extrabold tracking-tight flex items-center justify-center gap-2">
              {user?.name || "No Name"}
              <button className="text-blue-500 text-xs ml-2 underline hover:text-blue-700" onClick={() => setIsEditingName(true)}>Edit</button>
            </div>
          )}
          <div className="text-gray-400 text-sm">{user?.email}</div>
          <span className="inline-flex items-center mt-3 px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-400/20 to-blue-200/40 text-blue-700 shadow">
            {user?.role === 'admin' ? <FaUserShield className="mr-1" /> : <FaUser className="mr-1" />}
            {user?.role === 'admin' ? 'Admin' : 'User'}
          </span>
        </div>
        <hr className="my-6 w-full border-blue-100" />

        {/* Navigation */}
        <nav className="flex flex-col gap-2 w-full">
          {sidebarLinks.map(link => (
            link.key === 'home' ? (
              <Link
                key={link.key}
                to={link.path}
                className={`flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-base transition-all
                  ${activeSection === link.key
                    ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg border-l-4 border-blue-700'
                    : 'hover:bg-blue-50 text-blue-700'}
                `}
                aria-current={activeSection === link.key ? "page" : undefined}
                onClick={() => setActiveSection('home')}
              >
                <span className="text-xl">{link.icon}</span>
                {link.label}
              </Link>
            ) : (
              <Link
                key={link.key}
                to={link.path}
                className={`flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-base transition-all
                  ${activeSection === link.key
                    ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg border-l-4 border-blue-700'
                    : 'hover:bg-blue-50 text-blue-700'}
                `}
                aria-current={activeSection === link.key ? "page" : undefined}
                onClick={() => setActiveSection(link.key)}
              >
                <span className="text-xl">{link.icon}</span>
                {link.label}
              </Link>
            )
          ))}
        </nav>
        <hr className="my-6 w-full border-blue-100" />

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <button
            className="w-full bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 font-bold py-3 rounded-xl border border-orange-200 hover:from-orange-200 hover:to-orange-100 transition flex items-center justify-center gap-2"
            onClick={clearAllData}
          >
            <FaTrash className="text-lg group-hover:rotate-12 transition-transform" /> Clear Data
          </button>
          <button
            className="w-full bg-gradient-to-r from-red-100 to-red-50 text-red-700 font-bold py-3 rounded-xl border border-red-200 hover:from-red-200 hover:to-red-100 transition flex items-center justify-center gap-2"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="text-lg" /> Logout
          </button>
        </div>
      </div>
    </div>
  );

  // Main content for each section
  const renderMainContent = () => {
    if (activeSection === 'home') {
      return (
        <div>
          <h2 className="text-xl font-bold mb-4">🏠 Home - Products</h2>
          {/* Categories Dropdown */}
          <div ref={catRef} className="relative max-w-xs mb-6">
            <button
              className="w-full flex items-center justify-between px-4 py-2 bg-orange-50 text-orange-700 font-semibold rounded-lg hover:bg-orange-100 border border-orange-200 shadow transition-all focus:outline-none"
              onClick={() => setCatOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={catOpen}
            >
              {selectedCategory}
              <span className={`ml-2 transition-transform ${catOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            <ul className={`absolute left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 z-10 transition-all duration-200 ${catOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`} role="listbox">
              {categories.map((cat) => (
                <li
                  key={cat}
                  className="flex items-center justify-between px-4 py-2 hover:bg-orange-100 cursor-pointer text-gray-800 transition-all"
                  role="option"
                >
                  <span onClick={() => { setSelectedCategory(cat); setCatOpen(false); }}>{cat}</span>
                  {cat !== 'All Categories' && (
                    <span className="flex items-center gap-1">
                      <button
                        type="button"
                        className="ml-2 text-blue-500 hover:text-blue-700"
                        title={`Edit ${cat}`}
                        onClick={e => {
                          e.stopPropagation();
                          const newCat = prompt('Enter new category name:', cat);
                          if (newCat && newCat !== cat && !categories.includes(newCat)) {
                            setCategories(categories.map(c => c === cat ? newCat : c));
                            setProducts(products.map(p => p.category === cat ? { ...p, category: newCat } : p));
                            if (selectedCategory === cat) setSelectedCategory(newCat);
                          }
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        className="ml-2 text-red-500 hover:text-red-700"
                        title={`Delete ${cat}`}
                        onClick={e => {
                          e.stopPropagation();
                          setCategories(categories.filter(c => c !== cat));
                          if (selectedCategory === cat) setSelectedCategory('All Categories');
                        }}
                      >
                        <FaTrash />
                      </button>
                    </span>
                  )}
                </li>
              ))}
              <li
                className="px-4 py-2 hover:bg-green-100 cursor-pointer text-green-700 font-semibold border-t border-gray-200"
                onClick={() => {
                  const newCat = prompt('Enter new category name:');
                  if (newCat && !categories.includes(newCat)) {
                    setCategories([...categories, newCat]);
                    setSelectedCategory(newCat);
                  }
                  setCatOpen(false);
                }}
                role="option"
              >
                + Add Category
              </li>
            </ul>
          </div>
          <div className="overflow-x-auto">
            <div className="flex flex-row gap-6 min-w-max">
              {filteredProducts.length === 0 ? (
                selectedCategory !== 'All Categories' ? (
                  <p className="text-gray-600 col-span-full text-center">Products in this category will be available soon.</p>
                ) : (
                  <p className="text-gray-600 col-span-full">No products available in this category.</p>
                )
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 shadow bg-white flex flex-col items-center min-w-[260px]">
                    {/* Price row above name */}
                    {product.oldPrice ? (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="line-through text-gray-500 text-base">
                          NPR {product.oldPrice.toLocaleString()}
                        </span>
                        <span className="font-bold text-blue-700 text-lg">
                          NPR {product.price.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-blue-700 text-lg mb-1 block">NPR {product.price?.toLocaleString?.() ?? 'N/A'}</span>
                    )}
                    {/* Product name below price */}
                    <h3 className="font-semibold text-lg mb-1">
                      <Link
                        to={`/product-details/${slugify(product.model || product.name)}`}
                        className="text-blue-700 hover:underline"
                        style={{ textDecoration: 'underline' }}
                      >
                        {product.model || product.name}
                      </Link>
                    </h3>
                    {/* Product image below name and price */}
                    <img
                      src={product.image || (product.images && product.images[0]) || getFirstBlockImage(product) || 'placeholder.jpg'}
                      alt={product.model || product.name}
                      className="w-full h-40 sm:h-48 md:h-56 object-cover rounded mb-2"
                    />
                    {/* Action buttons below image */}
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-auto mb-2"
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </button>
                    <button
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mb-2"
                      onClick={() => addToWishlist(product)}
                    >
                      Add to Wishlist
                    </button>
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      onClick={() => handleBuyNow(product)}
                    >
                      Buy
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }
    if (activeSection === 'orders') {
      return (
        <div>
          <h2 className="text-xl font-bold mb-4">📦 My Orders</h2>
          {orders.length === 0 ? (
            <p className="text-gray-600">No orders found.</p>
          ) : (
            <ul className="space-y-6">
              {orders.map((order) => (
                <li key={order.id || order.orderId} className="border rounded p-4 shadow bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Order ID: {order.orderId || order.id}</span>
                    <span className="text-sm px-2 py-1 rounded-full bg-gray-100">{order.status}</span>
                  </div>
                  <div className="text-gray-700 text-sm mb-1">Placed on: {new Date(order.created_at || order.orderDate).toLocaleString()}</div>
                  <div className="mb-1"><strong>Total:</strong> Rs. {order.total_amount?.toLocaleString?.() ?? order.amount}</div>
                  <div className="mb-1"><strong>Payment:</strong> {order.paymentMethod || order.payment_method}</div>
                  <div className="mb-1"><strong>Delivery:</strong> {order.customer_name || order.userInfo?.fullName} | {order.customer_phone || order.userInfo?.phoneNumber} | {order.customer_city || order.userInfo?.city} | {order.customer_address || order.userInfo?.address}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    if (activeSection === 'pending') {
      const pendingOrders = orders.filter(order => order.status === 'pending');
      return (
        <div>
          <h2 className="text-xl font-bold mb-4">💳 Pending Payment</h2>
          {pendingOrders.length === 0 ? (
            <p className="text-gray-600">No pending payment orders.</p>
          ) : (
            <ul className="space-y-6">
              {pendingOrders.map((order) => (
                <li key={order.id || order.orderId} className="border rounded p-4 shadow bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Order ID: {order.orderId || order.id}</span>
                    <span className="text-sm px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                  </div>
                  <div className="mb-1"><strong>Total:</strong> Rs. {order.total_amount?.toLocaleString?.() ?? order.amount}</div>
                  <div className="mb-1"><strong>Payment:</strong> {order.paymentMethod || order.payment_method}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    if (activeSection === 'processing') {
      const processingOrders = orders.filter(order => order.status === 'processing' || order.status === 'to ship');
      return (
        <div>
          <h2 className="text-xl font-bold mb-4">🚚 Processing / To Ship</h2>
          {processingOrders.length === 0 ? (
            <p className="text-gray-600">No orders to be shipped.</p>
          ) : (
            <ul className="space-y-6">
              {processingOrders.map((order) => (
                <li key={order.id || order.orderId} className="border rounded p-4 shadow bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Order ID: {order.orderId || order.id}</span>
                    <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800">Processing</span>
                  </div>
                  <div className="mb-1"><strong>Total:</strong> Rs. {order.total_amount?.toLocaleString?.() ?? order.amount}</div>
                  <div className="mb-1"><strong>Payment:</strong> {order.paymentMethod || order.payment_method}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    if (activeSection === 'shipped') {
      const shippedOrders = orders.filter(order => order.status === 'shipped' || order.status === 'in transit');
      return (
        <div>
          <h2 className="text-xl font-bold mb-4">📬 Shipped / In Transit</h2>
          {shippedOrders.length === 0 ? (
            <p className="text-gray-600">No shipped orders.</p>
          ) : (
            <ul className="space-y-6">
              {shippedOrders.map((order) => (
                <li key={order.id || order.orderId} className="border rounded p-4 shadow bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Order ID: {order.orderId || order.id}</span>
                    <span className="text-sm px-2 py-1 rounded-full bg-purple-100 text-purple-800">Shipped</span>
                  </div>
                  <div className="mb-1"><strong>Total:</strong> Rs. {order.total_amount?.toLocaleString?.() ?? order.amount}</div>
                  <div className="mb-1"><strong>Payment:</strong> {order.paymentMethod || order.payment_method}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    if (activeSection === 'delivered') {
      const deliveredOrders = orders.filter(order => order.status === 'delivered' || order.status === 'completed');
      return (
        <div>
          <h2 className="text-xl font-bold mb-4">✅ Delivered / Completed</h2>
          {deliveredOrders.length === 0 ? (
            <p className="text-gray-600">No delivered orders.</p>
          ) : (
            <ul className="space-y-6">
              {deliveredOrders.map((order) => (
                <li key={order.id || order.orderId} className="border rounded p-4 shadow bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Order ID: {order.orderId || order.id}</span>
                    <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-800">Delivered</span>
                  </div>
                  <div className="mb-1"><strong>Total:</strong> Rs. {order.total_amount?.toLocaleString?.() ?? order.amount}</div>
                  <div className="mb-1"><strong>Payment:</strong> {order.paymentMethod || order.payment_method}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    if (activeSection === 'cancelled') {
      const cancelledOrders = orders.filter(order => order.status === 'cancelled');
      return (
        <div>
          <h2 className="text-xl font-bold mb-4">❌ Cancelled Orders</h2>
          {cancelledOrders.length === 0 ? (
            <p className="text-gray-600">No cancelled orders.</p>
          ) : (
            <ul className="space-y-6">
              {cancelledOrders.map((order) => (
                <li key={order.id || order.orderId} className="border rounded p-4 shadow bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Order ID: {order.orderId || order.id}</span>
                    <span className="text-sm px-2 py-1 rounded-full bg-red-100 text-red-800">Cancelled</span>
                  </div>
                  <div className="mb-1"><strong>Total:</strong> Rs. {order.total_amount?.toLocaleString?.() ?? order.amount}</div>
                  <div className="mb-1"><strong>Payment:</strong> {order.paymentMethod || order.payment_method}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    if (activeSection === 'products') {
      return (
        <div>
          <h2 className="text-xl font-bold mb-4">📦 Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.length === 0 ? (
              <p className="text-gray-600 col-span-full">No products available.</p>
            ) : (
              products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4 shadow bg-white flex flex-col items-center">
                  <img src={product.image || '/placeholder.png'} alt={product.model || product.name} className="w-32 h-32 object-contain mb-2" />
                  <h3 className="font-semibold text-lg mb-1">{product.model || product.name}</h3>
                  <p className="text-blue-700 font-bold mb-2">Rs. {product.price?.toLocaleString?.() ?? 'N/A'}</p>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-auto mb-2"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                  <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mb-2"
                    onClick={() => addToWishlist(product)}
                  >
                    Add to Wishlist
                  </button>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    onClick={() => handleBuyNow(product)}
                  >
                    Buy
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Find the first image block in product.blocks
  const getFirstBlockImage = (product) => {
    if (!product.blocks) return null;
    const imgBlock = product.blocks.find(b => b.type === 'image' && b.src);
    return imgBlock ? imgBlock.src : null;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-6">Welcome!</h2>
          <p className="text-center text-gray-600 mb-6">
            Please log in to access your dashboard.
          </p>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-center"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 text-center"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen text-gray-800">
      {/* Unified Header */}
      <header className="bg-white shadow p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span role="img" aria-label="mobile">📱</span> Welcome to Sandesh Mobile Store
          </h1>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by model or brand..."
            className="border px-4 py-2 rounded w-full md:w-1/3"
            aria-label="Search products"
          />
        </div>
        <nav className="w-full mt-3">
          <ul className="flex flex-wrap justify-center gap-8 text-lg font-semibold">
            <li><Link to="/" className="text-blue-600 hover:underline" onClick={() => setActiveSection('home')}>Home</Link></li>
            <li><Link to="/about" className="text-blue-600 hover:underline">About</Link></li>
            <li><Link to="/contact" className="text-blue-600 hover:underline">Contact</Link></li>
            <li><Link to="/wishlist" className="text-blue-600 hover:underline">Wishlist ({wishlist.length})</Link></li>
            <li><Link to="/cart" className="text-blue-600 hover:underline">Cart ({cart.length})</Link></li>
            <li><Link to="/admin" className="text-blue-600 hover:underline">Dashboard</Link></li>
            <li><Link to="/products" className="text-blue-600 hover:underline">Browse Products</Link></li>
            <li><Link to="/how-to-order" className="text-blue-600 hover:underline">How to Order</Link></li>
            <li><Link to="/payment-policy" className="text-blue-600 hover:underline">Payment Policy</Link></li>
            <li><Link to="/faq" className="text-blue-600 hover:underline">FAQs</Link></li>
            <li><Link to="/return-refund" className="text-blue-600 hover:underline">Returns</Link></li>
            <li><Link to="/feedback" className="text-blue-600 hover:underline">Feedback</Link></li>
          </ul>
        </nav>
      </header>
      {/* Main Content: Always show sidebar, main area changes by section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row mt-8 gap-6">
        {renderSidebar()}
        <main className="flex-1">
          {activeSection === 'home' ? (
            renderMainContent()
          ) : (
            // Only show the section content, not the extra dashboard menu
            <div>
              <h1 className="text-3xl font-bold mb-6">
                {user ? `${user.name || user.fullName || user.email} Dashboard (${user.role === 'admin' ? 'Admin' : 'User'})` : 'Dashboard'}
              </h1>
              {/* Section content for the selected dashboard section */}
              {activeDashboardSection === "account" && (
                <div><h2 className="text-2xl font-bold mb-4">Manage My Account</h2></div>
              )}
              {activeDashboardSection === "orders" && (
                <div><h2 className="text-2xl font-bold mb-4">My Orders</h2></div>
              )}
              {activeDashboardSection === "wishlist" && (
                <div><h2 className="text-2xl font-bold mb-4">My Wishlist & Followed Stores</h2></div>
              )}
              {activeDashboardSection === "reviews" && (
                <div><h2 className="text-2xl font-bold mb-4">My Reviews</h2></div>
              )}
              {activeDashboardSection === "returns" && (
                <div><h2 className="text-2xl font-bold mb-4">My Returns & Cancellations</h2></div>
              )}
            </div>
          )}
        </main>
      </div>
      {/* Products */}
      {paymentModalOpen && selectedProduct && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-modal-title"
        >
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative">
            <h3 id="payment-modal-title" className="text-xl font-semibold mb-4">
              Choose Payment Method
            </h3>

            <p className="mb-4 font-medium">
              {selectedProduct.name} - Rs. {selectedProduct.price.toLocaleString()}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handlePaymentSelection("Khalti")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold"
                aria-label="Pay with Khalti"
              >
                Pay with Khalti
              </button>

              <button
                onClick={() => handlePaymentSelection("Cash on Delivery")}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold"
                aria-label="Pay with Cash on Delivery"
              >
                Cash on Delivery
              </button>
            </div>

            {orderStatus.loading && (
              <p className="mt-3 text-yellow-700 font-semibold">Processing your order...</p>
            )}
            {orderStatus.message && !orderStatus.loading && (
              <p
                className={`mt-3 font-semibold ${
                  orderStatus.error ? "text-red-700" : "text-green-700"
                }`}
              >
                {orderStatus.message}
              </p>
            )}

            <button
              onClick={closeModal}
              aria-label="Close payment modal"
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-bold text-xl leading-none"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <h4 className="font-bold mb-2">Contact Info</h4>
            <p>
              <strong>Project:</strong> E-Commerce Storefront
            </p>
            <p>
              <strong>Location:</strong> Kathmandu, Nepal
            </p>
            <p>
              <strong>Email:</strong> info@estorefront.com
            </p>
            <p>
              <strong>Hours:</strong> Sun–Fri / 9AM–5PM
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-2">Customer Service</h4>
            <p>
              <Link to="/about" className="hover:underline">
                About Us
              </Link>
            </p>
            <p>
              <Link to="/contact" className="hover:underline">
                Contact Us
              </Link>
            </p>
            <p>
              <Link to="/how-to-order" className="hover:underline">
                How to Order
              </Link>
            </p>
            <p>
              <Link to="/payment-policy" className="hover:underline">
                Payment Policy
              </Link>
            </p>
            <p>
              <Link to="/faq" className="hover:underline">
                FAQs
              </Link>
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-2">Popular Categories</h4>
            <span className="bg-gray-800 px-2 py-1 rounded text-xs">Smartphones</span>
          </div>

          <div>
            <h4 className="font-bold mb-2">Subscribe to Our Newsletter</h4>
            <p className="text-sm mb-2">
              Get updates on new products, stock alerts, and offers.
            </p>
            <form onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full text-white bg-gray-800 px-2 py-1 rounded mb-2"
                value={subscriberEmail}
                onChange={(e) => setSubscriberEmail(e.target.value)}
                required
                aria-label="Email address for newsletter subscription"
              />
              <button
                type="submit"
                className="bg-blue-600 px-4 py-1 rounded hover:bg-blue-700 w-full"
                aria-label="Subscribe to newsletter"
              >
                Subscribe
              </button>
            </form>
            {subscribeMessage && (
              <p className="mt-2 text-xs text-green-300" role="alert" aria-live="polite">
                {subscribeMessage}
              </p>
            )}
          </div>
        </div>

        <div className="text-center text-gray-400 text-xs mt-6 border-t pt-4 border-gray-700">
          © 2025 E-Commerce Storefront. Payment is made only after the customer receives the
          product.
        </div>
      </footer>
      {/* Place ChatBot at the end so it floats above everything */}
      <ChatBot />
    </div>
  );
}

export default HomePage;
