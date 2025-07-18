import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const defaultSections = [
  { type: "heading", content: "Your Shopping Cart" },
  { type: "paragraph", content: "Review your selected items below. You can update quantities, remove items, or proceed to checkout. Enjoy a seamless shopping experience!" },
];

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

function CartPage() {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem("cartSections");
    return saved ? JSON.parse(saved) : defaultSections;
  });
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [addType, setAddType] = useState("paragraph");
  const [addValue, setAddValue] = useState("");
  const user = getUser();
  const isAdmin = user && user.role === "admin";

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("cartSections", JSON.stringify(sections));
  }, [sections]);

  // Save cart changes to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Increase quantity of item by 1
  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Decrease quantity by 1 (minimum 1)
  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove item completely from cart
  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.info("Item removed from cart");
  };

  // Clear all items from cart
  const clearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      setCart([]);
      localStorage.removeItem("cart");
      toast.info("Cart cleared");
    }
  };

  // Calculate total price
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Proceed to payment or checkout page
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    navigate("/checkout");
  };

  // Section editing logic
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
    setAddType("paragraph");
    setAddValue("");
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Editable Intro Sections */}
      <div className="mb-6">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-4 group relative">
            {editIndex === idx ? (
              <form onSubmit={e => { e.preventDefault(); handleEditSave(idx); }}>
                {section.type === "heading" ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    className="w-full p-2 border rounded text-xl font-semibold mb-2"
                  />
                ) : (
                  <textarea
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                    rows={3}
                  />
                )}
                <div className="flex gap-2 mt-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                  <button type="button" onClick={() => setEditIndex(null)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
                </div>
              </form>
            ) : (
              <>
                {section.type === "heading" && <h1 className="text-2xl font-bold mb-4">{section.content}</h1>}
                {section.type === "paragraph" && <p className="mb-4">{section.content}</p>}
                {isAdmin && (
                  <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button onClick={() => handleEdit(idx)} className="text-orange-600">Edit</button>
                    <button onClick={() => handleDelete(idx)} className="text-red-600">Delete</button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {isAdmin && (
          <div className="mt-8 p-4 border-t">
            <h3 className="text-lg font-semibold mb-2">Add New Section</h3>
            <select value={addType} onChange={e => setAddType(e.target.value)} className="p-2 border rounded mb-2">
              <option value="paragraph">Paragraph</option>
              <option value="heading">Heading</option>
            </select>
            <textarea
              value={addValue}
              onChange={e => setAddValue(e.target.value)}
              className="w-full p-2 border rounded mb-2"
              rows={addType === "heading" ? 1 : 3}
              placeholder={addType === "heading" ? "Heading" : "Paragraph"}
            />
            <button onClick={handleAddSection} className="bg-green-600 text-white px-4 py-2 rounded mt-2">Add Section</button>
          </div>
        )}
      </div>

      {/* Cart Items and Checkout */}
      {cart.length === 0 ? (
        <div className="text-center">
          <p className="mb-4">Your cart is empty.</p>
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Cart Items ({cart.length})</h2>
            <button
              onClick={clearCart}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-white p-4 rounded shadow"
              >
                <img
                  src={item.image}
                  alt={item.name || item.productName || "Product"}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="font-semibold text-lg">{item.name || item.productName || "Product"}</h2>
                    <span className="font-bold text-blue-700 text-xl">NPR {item.price.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="bg-gray-300 px-2 rounded hover:bg-gray-400"
                      aria-label={`Decrease quantity of ${item.name || item.productName || "Product"}`}
                    >
                      −
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => increaseQty(item.id)}
                      className="bg-gray-300 px-2 rounded hover:bg-gray-400"
                      aria-label={`Increase quantity of ${item.name || item.productName || "Product"}`}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-green-700 text-lg mb-2">
                    Total: Rs. {(item.price * item.quantity).toLocaleString()}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="mt-2 text-red-600 hover:underline"
                    aria-label={`Remove ${item.name || item.productName || "Product"} from cart`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-right">
            <p className="text-xl font-bold mb-4">
              Total Price: Rs. {totalPrice.toLocaleString()}
            </p>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`px-6 py-3 rounded text-white ${
                cart.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;

// import React, { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { getCartApi, addToCartApi, removeFromCartApi, clearCartApi, checkoutCartApi } from "./api/api";

// const defaultSections = [
//   { type: "heading", content: "Your Shopping Cart" },
//   { type: "paragraph", content: "Review your selected items below. You can update quantities, remove items, or proceed to checkout. Enjoy a seamless shopping experience!" },
// ];

// const getUser = () => {
//   try {
//     return JSON.parse(localStorage.getItem("user"));
//   } catch {
//     return null;
//   }
// };

// function CartPage() {
//   const [cart, setCart] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem("cart")) || [];
//     } catch {
//       return [];
//     }
//   });
//   const [sections, setSections] = useState(() => {
//     const saved = localStorage.getItem("cartSections");
//     return saved ? JSON.parse(saved) : defaultSections;
//   });
//   const [editIndex, setEditIndex] = useState(null);
//   const [editValue, setEditValue] = useState("");
//   const [addType, setAddType] = useState("paragraph");
//   const [addValue, setAddValue] = useState("");
//   const user = getUser();
//   const isAdmin = user && user.role === "admin";
//   const navigate = useNavigate();

//   // Sync cart to localStorage whenever it changes
//   useEffect(() => {
//     localStorage.setItem("cart", JSON.stringify(cart));
//   }, [cart]);

//   // Increase quantity of item by 1
//   const increaseQty = (id) => {
//     setCart((prevCart) => {
//       return prevCart.map((item) =>
//         item.id === id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
//       );
//     });
//   };

//   // Decrease quantity by 1 (minimum 1)
//   const decreaseQty = (id) => {
//     setCart((prevCart) => {
//       return prevCart.map((item) =>
//         item.id === id && item.quantity > 1
//           ? { ...item, quantity: item.quantity - 1 }
//           : item
//       );
//     });
//   };

//   // Remove item completely from cart
//   const removeItem = (id) => {
//     setCart((prevCart) => prevCart.filter((item) => item.id !== id));
//   };

//   // Clear all items from cart
//   const clearCartHandler = () => {
//     if (window.confirm("Are you sure you want to clear your cart?")) {
//       setCart([]);
//     }
//   };

//   // Calculate total price
//   const totalPrice = cart.reduce(
//     (acc, item) => acc + item.price * item.quantity,
//     0
//   );

//   // Proceed to payment or checkout page
//   const handleCheckout = () => {
//     if (cart.length === 0) {
//       alert("Your cart is empty.");
//       return;
//     }
//     // Here you could add order logic or redirect
//     setCart([]);
//     localStorage.removeItem("cart");
//     alert("Checkout successful!");
//     navigate("/orders");
//   };

//   // Section editing logic
//   const handleEdit = (idx) => {
//     setEditIndex(idx);
//     setEditValue(sections[idx].content);
//   };

//   const handleEditSave = (idx) => {
//     const updated = [...sections];
//     updated[idx].content = editValue;
//     setSections(updated);
//     setEditIndex(null);
//     setEditValue("");
//   };

//   const handleDelete = (idx) => {
//     if (window.confirm("Delete this section?")) {
//       setSections(sections.filter((_, i) => i !== idx));
//     }
//   };

//   const handleAddSection = () => {
//     let newSection;
//     if (addType === "heading") {
//       newSection = { type: "heading", content: addValue };
//     } else {
//       newSection = { type: "paragraph", content: addValue };
//     }
//     setSections([...sections, newSection]);
//     setAddType("paragraph");
//     setAddValue("");
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       {/* Editable Intro Sections */}
//       <div className="mb-6">
//         {sections.map((section, idx) => (
//           <div key={idx} className="mb-4 group relative">
//             {editIndex === idx ? (
//               <form onSubmit={e => { e.preventDefault(); handleEditSave(idx); }}>
//                 {section.type === "heading" ? (
//                   <input
//                     type="text"
//                     value={editValue}
//                     onChange={e => setEditValue(e.target.value)}
//                     className="w-full p-2 border rounded text-xl font-semibold mb-2"
//                   />
//                 ) : (
//                   <textarea
//                     value={editValue}
//                     onChange={e => setEditValue(e.target.value)}
//                     className="w-full p-2 border rounded mb-2"
//                     rows={3}
//                   />
//                 )}
//                 <div className="flex gap-2 mt-2">
//                   <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
//                   <button type="button" onClick={() => setEditIndex(null)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
//                 </div>
//               </form>
//             ) : (
//               <>
//                 {section.type === "heading" && <h1 className="text-2xl font-bold mb-4">{section.content}</h1>}
//                 {section.type === "paragraph" && <p className="mb-4">{section.content}</p>}
//                 {isAdmin && (
//                   <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
//                     <button onClick={() => handleEdit(idx)} className="text-orange-600">Edit</button>
//                     <button onClick={() => handleDelete(idx)} className="text-red-600">Delete</button>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         ))}
//         {isAdmin && (
//           <div className="mt-8 p-4 border-t">
//             <h3 className="text-lg font-semibold mb-2">Add New Section</h3>
//             <select value={addType} onChange={e => setAddType(e.target.value)} className="p-2 border rounded mb-2">
//               <option value="paragraph">Paragraph</option>
//               <option value="heading">Heading</option>
//             </select>
//             <textarea
//               value={addValue}
//               onChange={e => setAddValue(e.target.value)}
//               className="w-full p-2 border rounded mb-2"
//               rows={addType === "heading" ? 1 : 3}
//               placeholder={addType === "heading" ? "Heading" : "Paragraph"}
//             />
//             <button onClick={handleAddSection} className="bg-green-600 text-white px-4 py-2 rounded mt-2">Add Section</button>
//           </div>
//         )}
//       </div>

//       {/* Cart Items and Checkout */}
//       {cart.length === 0 ? (
//         <div className="text-center">
//           <p className="mb-4">Your cart is empty.</p>
//           <Link
//             to="/"
//             className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//           >
//             Go Shopping
//           </Link>
//         </div>
//       ) : (
//         <>
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-semibold">Cart Items ({cart.length})</h2>
//             <button
//               onClick={clearCartHandler}
//               className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
//             >
//               Clear All
//             </button>
//           </div>
//           <div className="space-y-4">
//             {cart.map((item) => (
//               <div
//                 key={item.id}
//                 className="flex items-center gap-4 bg-white p-4 rounded shadow"
//               >
//                 <img
//                   src={item.image}
//                   alt={item.name}
//                   className="w-24 h-24 object-cover rounded"
//                 />
//                 <div className="flex-1">
//                   <h2 className="font-semibold text-lg">{item.name}</h2>
//                   <p className="text-blue-600 font-bold">
//                     Rs. {item.price.toLocaleString()}
//                   </p>

//                   <div className="mt-2 flex items-center gap-2">
//                     <button
//                       onClick={() => decreaseQty(item.id)}
//                       className="bg-gray-300 px-2 rounded hover:bg-gray-400"
//                       aria-label={`Decrease quantity of ${item.name}`}
//                     >
//                       −
//                     </button>
//                     <span className="w-8 text-center">{item.quantity}</span>
//                     <button
//                       onClick={() => increaseQty(item.id)}
//                       className="bg-gray-300 px-2 rounded hover:bg-gray-400"
//                       aria-label={`Increase quantity of ${item.name}`}
//                     >
//                       +
//                     </button>
//                   </div>
//                 </div>
//                 <div>
//                   <p className="font-semibold">
//                     Total: Rs. {(item.price * item.quantity).toLocaleString()}
//                   </p>
//                   <button
//                     onClick={() => removeItem(item.id)}
//                     className="mt-2 text-red-600 hover:underline"
//                     aria-label={`Remove ${item.name} from cart`}
//                   >
//                     Remove
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="mt-8 text-right">
//             <p className="text-xl font-bold mb-4">
//               Total Price: Rs. {totalPrice.toLocaleString()}
//             </p>
//             <button
//               onClick={handleCheckout}
//               disabled={cart.length === 0}
//               className={`px-6 py-3 rounded text-white ${
//                 cart.length === 0
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-green-600 hover:bg-green-700"
//               }`}
//             >
//               Proceed to Checkout
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// export default CartPage;
