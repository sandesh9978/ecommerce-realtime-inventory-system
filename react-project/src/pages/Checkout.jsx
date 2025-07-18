import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import KhaltiCheckout from "khalti-checkout-web";

function Checkout() {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  const [orderStatus, setOrderStatus] = useState({ message: null, error: false, loading: false });
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    postalCode: ""
  });

  const navigate = useNavigate();

  // Calculate total price
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Remove item from cart
  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Save cart changes to localStorage whenever cart updates
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Add handler for user info form
  const handleUserInfoChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  // Save order to backend API
  const saveOrder = async (paymentMethod) => {
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }
    // Validate user info
    if (!userInfo.fullName || !userInfo.email || !userInfo.phoneNumber || !userInfo.address) {
      setOrderStatus({ message: "Please fill in all required information.", error: true, loading: false });
      return;
    }
    // Ensure all products have a name
    const productsWithNames = cart.map((item) => ({
      ...item,
      name: item.name || item.productName || "Product"
    }));
    if (productsWithNames.some(item => !item.name || item.name === "Product")) {
      setOrderStatus({ message: "One or more products are missing a name.", error: true, loading: false });
      return;
    }
    setOrderStatus({ message: null, error: false, loading: true });
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null;
      const userId = user ? user.id : null;
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId,
          products: productsWithNames.map(({ id, name, price, quantity }) => ({
            productId: id,
            productName: name,
            price,
            quantity,
          })),
          totalAmount: totalPrice,
          paymentMethod,
          orderDate: new Date().toISOString(),
          userEmail: user ? user.email : "guest",
          userInfo, // send user info
        }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        setOrderStatus({
          message: `Order placed successfully with ${paymentMethod}.`,
          error: false,
          loading: false,
        });
        setCart([]);
        localStorage.removeItem("cart");
        // Redirect to receipt page with order details
        navigate("/receipt", { state: { order: {
          ...result,
          userInfo,
          products: cart,
          totalAmount: totalPrice,
          paymentMethod,
        } } });
      } else {
        throw new Error(result.message || "Failed to save order.");
      }
    } catch (error) {
      setOrderStatus({ message: `Error: ${error.message}`, error: true, loading: false });
    }
  };

  // Khalti payment handler
  const handleKhaltiPayment = () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const khaltiConfig = {
      publicKey: "test_public_key_dc74b7a36c6e47c6b4d33a446e4f69c7",
      productIdentity: "cart_checkout",
      productName: "Cart Checkout",
      productUrl: window.location.href,
      eventHandler: {
        onSuccess(payload) {
          alert("✅ Payment Successful!");
          saveOrder("Khalti");
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
    checkout.show({ amount: totalPrice * 100 }); // amount in paisa
  };

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      {/* User Info Form */}
      <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-2xl shadow-lg mb-8 max-w-lg mx-auto border border-blue-200">
        <h2 className="text-2xl font-extrabold text-blue-700 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 01-8 0" /></svg>
          Shipping & Contact Information
        </h2>
        <form className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold text-blue-700">Full Name</label>
            <input type="text" name="fullName" value={userInfo.fullName} onChange={handleUserInfoChange} required className="w-full border-2 border-blue-200 focus:border-blue-500 px-3 py-2 rounded-lg bg-white focus:bg-blue-50 transition" />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-blue-700">Email</label>
            <input type="email" name="email" value={userInfo.email} onChange={handleUserInfoChange} required className="w-full border-2 border-blue-200 focus:border-blue-500 px-3 py-2 rounded-lg bg-white focus:bg-blue-50 transition" />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-blue-700">Phone Number</label>
            <input type="tel" name="phoneNumber" value={userInfo.phoneNumber} onChange={handleUserInfoChange} required className="w-full border-2 border-blue-200 focus:border-blue-500 px-3 py-2 rounded-lg bg-white focus:bg-blue-50 transition" />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-blue-700">Address</label>
            <input type="text" name="address" value={userInfo.address} onChange={handleUserInfoChange} required className="w-full border-2 border-blue-200 focus:border-blue-500 px-3 py-2 rounded-lg bg-white focus:bg-blue-50 transition" />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-blue-700">City</label>
            <input type="text" name="city" value={userInfo.city} onChange={handleUserInfoChange} className="w-full border-2 border-blue-200 focus:border-blue-500 px-3 py-2 rounded-lg bg-white focus:bg-blue-50 transition" />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-blue-700">Postal Code</label>
            <input type="text" name="postalCode" value={userInfo.postalCode} onChange={handleUserInfoChange} className="w-full border-2 border-blue-200 focus:border-blue-500 px-3 py-2 rounded-lg bg-white focus:bg-blue-50 transition" />
          </div>
        </form>
      </div>

      {cart.length === 0 ? (
        <div className="text-center">
          <p className="mb-4">Your cart is empty.</p>
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back to Shop
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-white p-4 rounded shadow"
              >
                <img
                  src={item.image}
                  alt={item.name || item.productName || "Product"}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{item.name || item.productName || "Product"}</h2>
                  <p>
                    Price: Rs. {item.price.toLocaleString()} × {item.quantity} = Rs. {(
                      item.price * item.quantity
                    ).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:underline"
                  aria-label={`Remove ${item.name || item.productName || "Product"} from cart`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="text-right mb-6">
            <p className="text-2xl font-bold">
              Total Amount: Rs. {totalPrice.toLocaleString()}
            </p>
          </div>

          {orderStatus.loading && (
            <p className="text-yellow-700 font-semibold mb-4">
              Processing your order...
            </p>
          )}
          {orderStatus.message && !orderStatus.loading && (
            <p
              className={`font-semibold mb-4 ${
                orderStatus.error ? "text-red-700" : "text-green-700"
              }`}
            >
              {orderStatus.message}
            </p>
          )}

          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={handleKhaltiPayment}
              className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 font-semibold"
              aria-label="Pay with Khalti"
            >
              Pay with Khalti
            </button>

            <button
              onClick={() => saveOrder("Cash on Delivery")}
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 font-semibold"
              aria-label="Pay with Cash on Delivery"
            >
              Cash on Delivery
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Checkout;
