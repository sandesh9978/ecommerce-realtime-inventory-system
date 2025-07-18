import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import KhaltiCheckout from "khalti-checkout-web";
import KhaltiPaymentButton from "./component/khaltiPaymentButton";
import { useProducts, defaultProducts } from "./context/ProductContext";

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[()+,]/g, "")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

const products = [
  { id: 1, brand: "Samsung", model: "Galaxy S24 Ultra (12+512GB)", price: 199999, status: "Out of stock" },
  { id: 2, brand: "Samsung", model: "Galaxy S25 (12+128GB)", price: 104999, status: "New" },
  { id: 3, brand: "Samsung", model: "Galaxy S25 (12+256GB)", price: 114999, status: "New" },
  { id: 4, brand: "Samsung", model: "Galaxy S25+ (12+256GB)", price: 141999, status: "New" },
  { id: 5, brand: "Samsung", model: "Galaxy S25 Ultra (12+256GB)", price: 184999, status: "New" },
  { id: 6, brand: "Samsung", model: "Galaxy S25 Ultra (12+512GB)", price: 199999, status: "New" },
  { id: 7, brand: "Apple", model: "iPhone 16 Pro (128GB)", price: 168700, oldPrice: 178900, status: "New" },
  { id: 8, brand: "Apple", model: "iPhone 16 Pro (256GB)", price: 188200, oldPrice: 198000, status: "New" },
  { id: 9, brand: "Apple", model: "iPhone 16 Pro (512GB)", price: 226600, oldPrice: 237500, status: "New" },
  { id: 10, brand: "Apple", model: "iPhone 16 Pro (1TB)", price: 265200, oldPrice: 275100, status: "New" },
  { id: 11, brand: "Apple", model: "iPhone 16 Pro Max (256GB)", price: 197000, oldPrice: 207000, status: "New" },
  { id: 12, brand: "Apple", model: "iPhone 16 Pro Max (512GB)", price: 235500, oldPrice: 245500, status: "New" },
  { id: 13, brand: "Apple", model: "iPhone 16 Pro Max (1TB)", price: 274000, oldPrice: 284000, status: "New" },
];

export default function ProductPage() {
  const [editProduct, setEditProduct] = useState(null);
  // Change editForm and product model to use images: [] instead of image: ""
  const [editForm, setEditForm] = useState({ model: "", price: "", stock: "", brand: "", images: [], details: "", costPrice: "", showOnHome: false, showOnProduct: true });
  const [addMode, setAddMode] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user && user.role === "admin";

  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem("orders");
    return savedOrders ? JSON.parse(savedOrders) : [];
  });
  const [orderSuccess, setOrderSuccess] = useState(() => {
    const savedOrder = localStorage.getItem("lastOrder");
    return savedOrder ? JSON.parse(savedOrder) : null;
  });
  const [orderStatus, setOrderStatus] = useState({ message: null, error: false, loading: false });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [brandFilter, setBrandFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { products: contextProducts, setProducts } = useProducts();
  const [products, setLocalProducts] = useState(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : contextProducts;
  });

  // Sync products state with context and localStorage
  useEffect(() => {
    setProducts(products);
    localStorage.setItem('products', JSON.stringify(products));
  }, [products, setProducts]);

  const navigate = useNavigate();

  // Editing logic
  const handleEditClick = (product) => {
    // Check if product is in homeProducts
    let homeProducts = [];
    try {
      homeProducts = JSON.parse(localStorage.getItem('homeProducts')) || [];
    } catch {}
    const inHome = homeProducts.some(p => p.id === product.id);
    const inProduct = products.some(p => p.id === product.id);
    setEditProduct(product);
    // Update handleEditClick to support images array
    setEditForm({
      model: product.model || "",
      price: product.price || "",
      stock: product.stock || "",
      brand: product.brand || "",
      images: product.images || (product.image ? [product.image] : []),
      details: product.details || "",
      costPrice: product.costPrice || "",
      showOnHome: inHome,
      showOnProduct: inProduct,
    });
  };
  // Update handleEditChange to handle multiple images
  const handleEditChange = (e) => {
    if (e.target.type === "checkbox") {
      setEditForm({ ...editForm, [e.target.name]: e.target.checked });
    } else if (e.target.name === "images" && e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const readers = files.map(file => {
        return new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });
      Promise.all(readers).then(images => {
        setEditForm(prev => ({ ...prev, images: [...prev.images, ...images] }));
      });
    } else {
      setEditForm({ ...editForm, [e.target.name]: e.target.value });
    }
  };
  const handleEditSave = () => {
    // Home page sync
    let homeProducts = [];
    try {
      homeProducts = JSON.parse(localStorage.getItem('homeProducts')) || [];
    } catch {}
    if (editForm.showOnHome) {
      // Add or update in homeProducts
      const updated = homeProducts.some(p => p.id === editProduct.id)
        ? homeProducts.map(p => p.id === editProduct.id ? { ...editProduct, ...editForm, price: Number(editForm.price), stock: Number(editForm.stock), costPrice: editForm.costPrice === '' ? null : Number(editForm.costPrice) } : p)
        : [...homeProducts, { ...editProduct, ...editForm, price: Number(editForm.price), stock: Number(editForm.stock), costPrice: editForm.costPrice === '' ? null : Number(editForm.costPrice) }];
      localStorage.setItem('homeProducts', JSON.stringify(updated));
    } else {
      // Remove from homeProducts
      const updated = homeProducts.filter(p => p.id !== editProduct.id);
      localStorage.setItem('homeProducts', JSON.stringify(updated));
    }
    // Product page sync
    if (editForm.showOnProduct) {
      setLocalProducts(products.map((p) =>
        p.id === editProduct.id
          ? { ...p, ...editForm, price: Number(editForm.price), stock: Number(editForm.stock), costPrice: editForm.costPrice === '' ? null : Number(editForm.costPrice) }
          : p
      ));
    } else {
      setLocalProducts(products.filter((p) => p.id !== editProduct.id));
    }
    setEditProduct(null);
  };
  const handleEditCancel = () => setEditProduct(null);

  // Add product logic
  const handleAddClick = () => {
    setAddMode(true);
    // Update handleAddClick to reset images array
    setEditForm({ model: "", price: "", stock: "", brand: "", images: [], details: "", costPrice: "", showOnHome: false, showOnProduct: true });
  };
  const handleAddSave = () => {
    const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    // Ensure all selected images are saved in the images array
    const newProduct = {
      id: newId,
      ...editForm,
      images: editForm.images ? [...editForm.images] : [], // Always use the full array
      price: Number(editForm.price),
      stock: Number(editForm.stock),
      costPrice: editForm.costPrice === '' ? null : Number(editForm.costPrice)
    };
    // Home page sync
    let homeProducts = [];
    try {
      homeProducts = JSON.parse(localStorage.getItem('homeProducts')) || [];
    } catch {}
    if (editForm.showOnHome) {
      localStorage.setItem('homeProducts', JSON.stringify([...homeProducts, newProduct]));
    }
    // Product page sync
    if (editForm.showOnProduct) {
      const updatedProducts = [...products, newProduct];
      setLocalProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts)); // <-- This line is critical!
    }
    setAddMode(false);
  };
  const handleAddCancel = () => setAddMode(false);

  const handleDeleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setLocalProducts(products.filter((p) => p.id !== id));
    }
  };

  // Generate brands dynamically
  const uniqueBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    setCartCount(count);
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Whenever orders change, update localStorage
  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const filteredProducts = products.filter(({ brand, model }) => {
    const matchesBrand = brandFilter === "all" || (brand || "").toLowerCase() === brandFilter.toLowerCase();
    const matchesSearch = (model || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex((item) => item.id === product.id);

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setCartCount(cart.reduce((acc, item) => acc + item.quantity, 0));
    alert(`Added "${product.model || product.name || 'product'}" to cart.`);
  };

  const addToWishlist = (productId) => {
    if (wishlist.find((item) => item.id === productId)) {
      alert("Item already in wishlist");
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newWishlist = [...wishlist, product];
    setWishlist(newWishlist);
    alert(`❤️ Added "${product.model || product.name || 'product'}" to wishlist`);
  };

  const removeFromWishlist = (productId) => {
    const newWishlist = wishlist.filter((item) => item.id !== productId);
    setWishlist(newWishlist);
  };

  const saveOrder = (paymentMethod, product, quantity = 1) => {
    setOrderStatus({ message: null, error: false, loading: true });

    try {
      const orderId = "ORD" + Math.floor(Math.random() * 1000000);
      const orderData = {
        orderId,
        productName: product.model,
        amount: product.price * quantity,
        paymentMethod,
        orderDate: new Date().toISOString(),
        status: "Completed",
        items: [
          {
            name: product.model,
            quantity,
            price: product.price,
          },
        ],
      };

      // Save lastOrder for immediate success screen
      localStorage.setItem("lastOrder", JSON.stringify(orderData));
      setOrderSuccess(orderData);

      // Append to the "orders" array in localStorage for history
      const updatedOrders = [orderData, ...orders];
      setOrders(updatedOrders);

      // Subtract stock from product
      setLocalProducts(products.map(p =>
        p.id === product.id
          ? {
              ...p,
              stock: Math.max(0, (p.stock || 0) - quantity),
              status: Math.max(0, (p.stock || 0) - quantity) === 0 ? "Out of stock" : p.status
            }
          : p
      ));

      setOrderStatus({ message: null, error: false, loading: false });
      closeModal();
      navigate('/orders'); // Redirect to orders page after successful order
    } catch (error) {
      setOrderStatus({ message: `Error saving order: ${error.message}`, error: true, loading: false });
    }
  };

  // Khalti payment integration (robust)
  const handleKhaltiPayment = () => {
    // Get product from localStorage
    const product = JSON.parse(localStorage.getItem('selectedProduct'));
    if (!product || typeof product.price !== 'number' || product.price <= 0) {
      alert("Invalid product price for Khalti payment.");
      return;
    }
    const khaltiConfig = {
      publicKey: "live_public_key_xxxxxxxxxxxxxxxxxxxxx", // <-- Your real Khalti key here
      productIdentity: product.id ? product.id.toString() : "unknown",
      productName: product.model || product.name || "Product",
      productUrl: window.location.href,
      eventHandler: {
        onSuccess(payload) {
          console.log("Khalti payment success", payload);
          alert("✅ Payment Successful!");
          saveOrder("Khalti", product, 1);
          closeModal();
        },
        onError(error) {
          console.error("Khalti payment error:", error);
          alert("❌ Payment Failed. Please try again.");
        },
        onClose() {
          console.log("Khalti widget closed.");
        },
      },
      paymentPreference: ["KHALTI", "EBANKING", "MOBILE_BANKING", "CONNECT_IPS", "SCT"],
    };
    try {
      const checkout = new KhaltiCheckout(khaltiConfig);
      checkout.show({ amount: Math.round(product.price * 100) }); // paisa
    } catch (err) {
      alert("Khalti modal could not be opened. See console for details.");
      console.error(err);
    }
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setOrderStatus({ message: null, error: false, loading: false });
    localStorage.setItem('selectedProduct', JSON.stringify(product));
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setOrderStatus({ message: null, error: false, loading: false });
  };

  const handlePaymentSelection = (method) => {
    if (!selectedProduct) return;

    if (method === "Khalti") {
      handleKhaltiPayment();
    } else if (method === "Cash on Delivery") {
      saveOrder("Cash on Delivery", selectedProduct, 1);
      alert("Order placed with Cash on Delivery!");
      closeModal();
      navigate('/orders'); // Redirect to orders page after cash on delivery
    }
  };

  const cancelOrder = (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    const updatedOrders = orders.map((order) =>
      order.orderId === orderId ? { ...order, status: "Cancelled" } : order
    );
    setOrders(updatedOrders);

    // If the cancelled order is the current orderSuccess, update its status too
    if (orderSuccess && orderSuccess.orderId === orderId) {
      setOrderSuccess({ ...orderSuccess, status: "Cancelled" });
    }

    alert("Order cancelled.");
  };

  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  // Backup/export products
  const handleExportProducts = () => {
    const data = localStorage.getItem('products');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Restore/import products (merge, not replace)
  const handleImportProducts = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          // Merge: keep current products, add only new ones from backup (by id)
          const current = [...products];
          const currentIds = new Set(current.map(p => p.id));
          const merged = [
            ...current,
            ...imported.filter(p => !currentIds.has(p.id))
          ];
          setLocalProducts(merged);
          localStorage.setItem('products', JSON.stringify(merged));
          alert('Products merged successfully!');
        } else {
          alert('Invalid products file.');
        }
      } catch {
        alert('Failed to import products.');
      }
    };
    reader.readAsText(file);
  };

  // Add these functions to your ProductPage component
  const updateProductDetails = async (productId, newDetails) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}` // if using JWT
        },
        body: JSON.stringify({
          details: newDetails
        })
      });
      
      if (res.ok) {
        alert("Product details updated successfully!");
        // Refresh your product list or update local state
      } else {
        alert("Failed to update product details");
      }
    } catch (error) {
      console.error("Error updating product details:", error);
      alert("Error updating product details");
    }
  };

  const updateProductImage = async (productId, newImageUrl) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}` // if using JWT
        },
        body: JSON.stringify({
          image: newImageUrl
        })
      });
      
      if (res.ok) {
        alert("Product image updated successfully!");
        // Refresh your product list or update local state
      } else {
        alert("Failed to update product image");
      }
    } catch (error) {
      console.error("Error updating product image:", error);
      alert("Error updating product image");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:5000/api/products/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.imageUrl) {
        // 1. Update form state
        setEditForm(prev => ({
          ...prev,
          images: [...(prev.images || []), data.imageUrl]
        }));
        // 2. Update localStorage
        const productDraft = JSON.parse(localStorage.getItem('productDraft')) || {};
        productDraft.images = [...(productDraft.images || []), data.imageUrl];
        localStorage.setItem('productDraft', JSON.stringify(productDraft));
      } else {
        alert('Image upload failed');
      }
    } catch (err) {
      alert('Image upload failed');
      console.error(err);
    }
  };

  if (orderSuccess) {
    return (
      <div className="bg-gray-100 min-h-screen p-6">
        <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded shadow">
          <h1 className="text-2xl font-bold">📱 Mobile Price List</h1>
          <nav className="mt-2 md:mt-0 space-x-4 text-blue-600 font-medium">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/products" className="hover:underline font-semibold">Products</Link>
            <Link to="/cart" className="hover:underline">Cart ({cartCount})</Link>
            <Link to="/wishlist" className="hover:underline">Wishlist ({wishlist.length})</Link>
          </nav>
        </header>

        <main className="max-w-6xl mx-auto bg-white rounded shadow p-6 flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 bg-gray-50 rounded p-4 shadow">
            <h3 className="text-lg font-semibold mb-4">Filter by Brand</h3>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full p-2 mb-6 rounded border border-gray-300"
            >
              <option value="all">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand.toLowerCase()}>
                  {brand}
                </option>
              ))}
            </select>

            <h3 className="text-lg font-semibold mb-2">Search Products</h3>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by model..."
              className="w-full p-2 rounded border border-gray-300"
              aria-label="Search products"
            />
          </aside>

          <section className="flex-1 overflow-x-auto">
            {brands.map((brand) => {
              const brandProducts = filteredProducts.filter(
                (product) => (product.brand || "").toLowerCase() === brand.toLowerCase()
              );
              if (!brandProducts.length) return null;

              return (
                <section key={brand} className="mb-10">
                  <h2 className="text-xl font-semibold mb-4">{brand} Phones</h2>
                  <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">Model</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Images</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                        {isAdmin && <th className="border border-gray-300 px-4 py-2 text-left">Cost Price</th>}
                        {isAdmin && <th className="border border-gray-300 px-4 py-2 text-left">Profit</th>}
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {brandProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-100">
                          <td className="border border-gray-300 px-4 py-2">
                            <Link
                              to={`/product-details/${slugify(product.model)}`}
                              className="text-blue-600 hover:underline"
                            >
                              {product.model}
                            </Link>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="flex gap-1">
                              {/* No artificial limit: show all images in the array */}
                              {(product.images && product.images.length > 0 ? product.images : product.image ? [product.image] : []).map((img, idx) => (
                                <img key={idx} src={img} alt={`Product ${idx + 1}`} className="h-10 w-10 object-contain rounded border" />
                              ))}
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {product.oldPrice ? (
                              <div>
                                <span className="line-through text-gray-500 mr-2">
                                  NPR {product.oldPrice.toLocaleString()}
                                </span>
                                <span className="font-bold text-blue-600">
                                  NPR {product.price.toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              `NPR ${product.price.toLocaleString()}`
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {product.stock === 0 ? (
                              <span className="px-2 py-1 rounded text-sm font-semibold bg-red-200 text-red-800">Out of stock</span>
                            ) : product.stock < 5 ? (
                              <span className="px-2 py-1 rounded text-sm font-semibold bg-yellow-200 text-yellow-800">Low Stock</span>
                            ) : (
                              <span className="px-2 py-1 rounded text-sm font-semibold bg-green-200 text-green-800">In Stock</span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 space-y-2">
                            <button
                              onClick={() => addToCart(product)}
                              disabled={product.status === "Out of stock"}
                              className={`block w-full px-3 py-1 rounded text-white ${
                                product.status === "Out of stock"
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700"
                              }`}
                            >
                              Add to Cart
                            </button>

                            {product.status !== "Out of stock" && (
                              <>
                                <button
                                  onClick={() => addToWishlist(product.id)}
                                  className="block w-full px-3 py-1 rounded bg-pink-600 text-white hover:bg-pink-700"
                                >
                                  Add to Wishlist
                                </button>

                                <button
                                  onClick={() => openModal(product)}
                                  className="block w-full px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                                >
                                  Buy
                                </button>
                              </>
                            )}
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => handleEditClick(product)}
                                  className="block w-full px-3 py-1 rounded bg-orange-600 text-white hover:bg-orange-700 mb-1"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="block w-full px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </td>
                          {isAdmin && <td className="border border-gray-300 px-4 py-2">{product.costPrice != null ? `NPR ${product.costPrice.toLocaleString()}` : '-'}</td>}
                          {isAdmin && <td className="border border-gray-300 px-4 py-2">{product.costPrice != null && product.price != null ? `NPR ${(product.price - product.costPrice).toLocaleString()}` : '-'}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              );
            })}

            {!filteredProducts.length && (
              <p className="text-center text-gray-600">No products found.</p>
            )}

            {orderStatus.loading && (
              <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded font-semibold text-center">
                Processing your order...
              </div>
            )}
            {orderStatus.message && !orderStatus.loading && (
              <div
                className={`mt-4 p-3 rounded font-semibold text-center ${
                  orderStatus.error ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"
                }`}
              >
                {orderStatus.message}
              </div>
            )}
          </section>
        </main>

        {selectedProduct && (
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
                {selectedProduct.model} - NPR {selectedProduct.price.toLocaleString()}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handlePaymentSelection("Khalti")}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold"
                >
                  Pay with Khalti
                </button>

                <button
                  onClick={() => handlePaymentSelection("Cash on Delivery")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold"
                >
                  Cash on Delivery
                </button>
              </div>

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
        {(editProduct || addMode) && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
              <h3 className="text-xl font-semibold mb-4">{addMode ? "Add Product" : "Edit Product"}</h3>
              <form onSubmit={e => { e.preventDefault(); addMode ? handleAddSave() : handleEditSave(); }}>
                <input type="text" name="model" value={editForm.model} onChange={handleEditChange} placeholder="Model" className="w-full p-2 mb-2 border rounded" required />
                <input type="number" name="price" value={editForm.price} onChange={handleEditChange} placeholder="Price" className="w-full p-2 mb-2 border rounded" required />
                <input type="number" name="stock" value={editForm.stock} onChange={handleEditChange} placeholder="Stock" className="w-full p-2 mb-2 border rounded" required />
                <input type="text" name="brand" value={editForm.brand} onChange={handleEditChange} placeholder="Brand" className="w-full p-2 mb-2 border rounded" required />
                <input type="number" name="costPrice" value={editForm.costPrice} onChange={handleEditChange} placeholder="Cost Price" className="w-full p-2 mb-2 border rounded" />
                <textarea name="details" value={editForm.details} onChange={handleEditChange} placeholder="Details/Description" className="w-full p-2 mb-2 border rounded" rows={3} />
                <input type="file" name="images" accept="image/*" multiple onChange={handleEditChange} className="w-full p-2 mb-2 border rounded" />
                {editForm.images && editForm.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editForm.images.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img src={img} alt={`Preview ${idx + 1}`} className="h-24 object-contain rounded border" />
                        <button type="button" onClick={() => {
                          setEditForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
                        }} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">×</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center mb-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.showOnHome && editForm.showOnProduct}
                      onChange={e => {
                        const checked = e.target.checked;
                        setEditForm({
                          ...editForm,
                          showOnHome: checked,
                          showOnProduct: checked
                        });
                      }}
                    />
                    Display this product in Home page and Product page
                  </label>
                </div>
                <div className="flex gap-2 mt-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{addMode ? "Add" : "Save"}</button>
                  <button type="button" onClick={addMode ? handleAddCancel : handleEditCancel} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
                </div>
              </form>
              <button onClick={addMode ? handleAddCancel : handleEditCancel} aria-label="Close modal" className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-bold text-xl leading-none">&times;</button>
            </div>
          </div>
        )}
        {isAdmin && (
          <>
            <button onClick={handleAddClick} className="mb-4 bg-green-600 text-white px-4 py-2 rounded">Add Product</button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to restore all default products? This will overwrite current products.')) {
                  setLocalProducts(defaultProducts);
                  localStorage.setItem('products', JSON.stringify(defaultProducts));
                }
              }}
              className="mb-4 ml-2 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Restore Default Products
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded shadow">
        <h1 className="text-2xl font-bold">📱 Mobile Price List</h1>
        <nav className="mt-2 md:mt-0 space-x-4 text-blue-600 font-medium">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/products" className="hover:underline font-semibold">Products</Link>
          <Link to="/cart" className="hover:underline">Cart ({cartCount})</Link>
          <Link to="/wishlist" className="hover:underline">Wishlist ({wishlist.length})</Link>
        </nav>
      </header>
      {/* Admin backup/restore buttons */}
      {isAdmin && (
        <div className="max-w-6xl mx-auto mb-4 flex gap-4 items-center">
          <button onClick={handleExportProducts} className="bg-blue-600 text-white px-4 py-2 rounded">Export Products</button>
          <label className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer">
            Import Products
            <input type="file" accept="application/json" onChange={handleImportProducts} className="hidden" />
          </label>
        </div>
      )}

      <main className="max-w-6xl mx-auto bg-white rounded shadow p-6 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 bg-gray-50 rounded p-4 shadow">
          <h3 className="text-lg font-semibold mb-4">Filter by Brand</h3>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="w-full p-2 mb-6 rounded border border-gray-300"
          >
            <option value="all">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand.toLowerCase()}>
                {brand}
              </option>
            ))}
          </select>

          <h3 className="text-lg font-semibold mb-2">Search Products</h3>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by model..."
            className="w-full p-2 rounded border border-gray-300"
            aria-label="Search products"
          />
        </aside>

        <section className="flex-1 overflow-x-auto">
          {brands.map((brand) => {
            const brandProducts = filteredProducts.filter(
              (product) => (product.brand || "").toLowerCase() === brand.toLowerCase()
            );
            if (!brandProducts.length) return null;

            // Calculate totals for admin
            const totalCostPrice = isAdmin ? filteredProducts.reduce((sum, p) => sum + (p.costPrice != null ? Number(p.costPrice) : 0), 0) : 0;
            const totalProfit = isAdmin ? filteredProducts.reduce((sum, p) => sum + (p.costPrice != null && p.price != null ? (Number(p.price) - Number(p.costPrice)) : 0), 0) : 0;

            return (
              <section key={brand} className="mb-10">
                <h2 className="text-xl font-semibold mb-4">{brand} Phones</h2>
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left">Model</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Images</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                      {isAdmin && <th className="border border-gray-300 px-4 py-2 text-left">Cost Price</th>}
                      {isAdmin && <th className="border border-gray-300 px-4 py-2 text-left">Profit</th>}
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {brandProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-100">
                        <td className="border border-gray-300 px-4 py-2">
                          <Link
                            to={`/product-details/${slugify(product.model)}`}
                            className="text-blue-600 hover:underline"
                          >
                            {product.model}
                          </Link>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <div className="flex gap-1">
                            {/* No artificial limit: show all images in the array */}
                            {(product.images && product.images.length > 0 ? product.images : product.image ? [product.image] : []).map((img, idx) => (
                              <img key={idx} src={img} alt={`Product ${idx + 1}`} className="h-10 w-10 object-contain rounded border" />
                            ))}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {product.oldPrice ? (
                            <div>
                              <span className="line-through text-gray-500 mr-2">
                                NPR {product.oldPrice.toLocaleString()}
                              </span>
                              <span className="font-bold text-blue-600">
                                NPR {product.price.toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            `NPR ${product.price.toLocaleString()}`
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {product.stock === 0 ? (
                            <span className="px-2 py-1 rounded text-sm font-semibold bg-red-200 text-red-800">Out of stock</span>
                          ) : product.stock < 5 ? (
                            <span className="px-2 py-1 rounded text-sm font-semibold bg-yellow-200 text-yellow-800">Low Stock</span>
                          ) : (
                            <span className="px-2 py-1 rounded text-sm font-semibold bg-green-200 text-green-800">In Stock</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 space-y-2">
                          <button
                            onClick={() => addToCart(product)}
                            disabled={product.status === "Out of stock"}
                            className={`block w-full px-3 py-1 rounded text-white ${
                              product.status === "Out of stock"
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            Add to Cart
                          </button>

                          {product.status !== "Out of stock" && (
                            <>
                              <button
                                onClick={() => addToWishlist(product.id)}
                                className="block w-full px-3 py-1 rounded bg-pink-600 text-white hover:bg-pink-700"
                              >
                                Add to Wishlist
                              </button>

                              <button
                                onClick={() => openModal(product)}
                                className="block w-full px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                              >
                                Buy
                              </button>
                            </>
                          )}
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleEditClick(product)}
                                className="block w-full px-3 py-1 rounded bg-orange-600 text-white hover:bg-orange-700 mb-1"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="block w-full px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                        {isAdmin && <td className="border border-gray-300 px-4 py-2">{product.costPrice != null ? `NPR ${product.costPrice.toLocaleString()}` : '-'}</td>}
                        {isAdmin && <td className="border border-gray-300 px-4 py-2">{product.costPrice != null && product.price != null ? `NPR ${(product.price - product.costPrice).toLocaleString()}` : '-'}</td>}
                      </tr>
                    ))}
                    {isAdmin && filteredProducts.length > 0 && (
                      <tr className="font-bold bg-gray-100">
                        <td colSpan={4}>Total</td>
                        <td className="border border-gray-300 px-4 py-2">NPR {totalCostPrice.toLocaleString()}</td>
                        <td className="border border-gray-300 px-4 py-2">NPR {totalProfit.toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            );
          })}

          {!filteredProducts.length && (
            <p className="text-center text-gray-600">No products found.</p>
          )}

          {orderStatus.loading && (
            <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded font-semibold text-center">
              Processing your order...
            </div>
          )}
          {orderStatus.message && !orderStatus.loading && (
            <div
              className={`mt-4 p-3 rounded font-semibold text-center ${
                orderStatus.error ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"
              }`}
            >
              {orderStatus.message}
            </div>
          )}
        </section>
      </main>

      {selectedProduct && (
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
              {selectedProduct.model} - NPR {selectedProduct.price.toLocaleString()}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handlePaymentSelection("Khalti")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold"
              >
                Pay with Khalti
              </button>

              <button
                onClick={() => handlePaymentSelection("Cash on Delivery")}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold"
              >
                Cash on Delivery
              </button>
            </div>

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
      {(editProduct || addMode) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" role="dialog" aria-modal="true">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <h3 className="text-xl font-semibold mb-4">{addMode ? "Add Product" : "Edit Product"}</h3>
            <form onSubmit={e => { e.preventDefault(); addMode ? handleAddSave() : handleEditSave(); }}>
              <input type="text" name="model" value={editForm.model} onChange={handleEditChange} placeholder="Model" className="w-full p-2 mb-2 border rounded" required />
              <input type="number" name="price" value={editForm.price} onChange={handleEditChange} placeholder="Price" className="w-full p-2 mb-2 border rounded" required />
              <input type="number" name="stock" value={editForm.stock} onChange={handleEditChange} placeholder="Stock" className="w-full p-2 mb-2 border rounded" required />
              <input type="text" name="brand" value={editForm.brand} onChange={handleEditChange} placeholder="Brand" className="w-full p-2 mb-2 border rounded" required />
              <input type="number" name="costPrice" value={editForm.costPrice} onChange={handleEditChange} placeholder="Cost Price" className="w-full p-2 mb-2 border rounded" />
              <textarea name="details" value={editForm.details} onChange={handleEditChange} placeholder="Details/Description" className="w-full p-2 mb-2 border rounded" rows={3} />
              <input type="file" name="images" accept="image/*" multiple onChange={handleEditChange} className="w-full p-2 mb-2 border rounded" />
              {editForm.images && editForm.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {editForm.images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img src={img} alt={`Preview ${idx + 1}`} className="h-24 object-contain rounded border" />
                      <button type="button" onClick={() => {
                        setEditForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
                      }} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">×</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center mb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.showOnHome && editForm.showOnProduct}
                    onChange={e => {
                      const checked = e.target.checked;
                      setEditForm({
                        ...editForm,
                        showOnHome: checked,
                        showOnProduct: checked
                      });
                    }}
                  />
                  Display this product in Home page and Product page
                </label>
              </div>
              <div className="flex gap-2 mt-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{addMode ? "Add" : "Save"}</button>
                <button type="button" onClick={addMode ? handleAddCancel : handleEditCancel} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
            <button onClick={addMode ? handleAddCancel : handleEditCancel} aria-label="Close modal" className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-bold text-xl leading-none">&times;</button>
          </div>
        </div>
      )}
      {isAdmin && <button onClick={handleAddClick} className="mb-4 bg-green-600 text-white px-4 py-2 rounded">Add Product</button>}
    </div>
  );
}