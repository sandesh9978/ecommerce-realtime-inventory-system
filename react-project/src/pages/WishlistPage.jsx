import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Markdown from "./component/Markdown";
import { getWishlistApi, addToWishlistApi, removeFromWishlistApi, clearWishlistApi } from "./api/api";

const defaultSections = [
  { type: "heading", content: "Your Wishlist" },
  { type: "paragraph", content: "Save your favorite products here for quick access. Move items to your cart when you're ready to buy!" },
];

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

function WishlistPage() {
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch {
      return [];
    }
  });
  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem("wishlistSections");
    return saved ? JSON.parse(saved) : defaultSections;
  });
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editList, setEditList] = useState([]);
  const [addType, setAddType] = useState("paragraph");
  const [addValue, setAddValue] = useState("");
  const [addList, setAddList] = useState([""]);
  const user = getUser();
  const isAdmin = user && user.role === "admin";

  // Sync wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Remove item from wishlist
  const removeFromWishlist = (id) => {
    setWishlist((prevWishlist) => prevWishlist.filter((item) => item.id !== id));
  };

  // Clear all items from wishlist
  const clearWishlistHandler = () => {
    if (window.confirm("Are you sure you want to clear your wishlist?")) {
      setWishlist([]);
      alert("Wishlist cleared");
    }
  };

  // Move item to cart (add to cart in localStorage, then remove from wishlist)
  const moveToCart = (item) => {
    // Add to cart in localStorage
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex((cartItem) => cartItem.id === item.id);
    if (existingIndex !== -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    // Remove from wishlist
    removeFromWishlist(item.id);
    alert(`✅ Moved "${item.model || item.name}" to cart.`);
  };

  // Section editing logic
  const handleEdit = (idx) => {
    setEditIndex(idx);
    if (sections[idx].type === "list") {
      setEditList([...sections[idx].content]);
    } else {
      setEditValue(sections[idx].content);
    }
  };

  const handleEditSave = (idx) => {
    const updated = [...sections];
    if (sections[idx].type === "list") {
      updated[idx].content = editList.filter(item => item.trim() !== "");
    } else {
      updated[idx].content = editValue;
    }
    setSections(updated);
    setEditIndex(null);
    setEditValue("");
    setEditList([]);
  };

  const handleDelete = (idx) => {
    if (window.confirm("Delete this section?")) {
      setSections(sections.filter((_, i) => i !== idx));
    }
  };

  const handleAddSection = () => {
    let newSection;
    if (addType === "list") {
      newSection = { type: "list", content: addList.filter(item => item.trim() !== "") };
    } else if (addType === "heading") {
      newSection = { type: "heading", content: addValue };
    } else {
      newSection = { type: "paragraph", content: addValue };
    }
    setSections([...sections, newSection]);
    setAddType("paragraph");
    setAddValue("");
    setAddList([""]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">❤️ Your Wishlist</h1>
        <div className="flex items-center space-x-4">
          {wishlist.length > 0 && (
            <button
              onClick={clearWishlistHandler}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Clear All
            </button>
          )}
          <nav className="space-x-4 text-blue-600 font-medium">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <Link to="/cart" className="hover:underline">
              Cart
            </Link>
            <Link to="/wishlist" className="hover:underline font-semibold">
              Wishlist
            </Link>
          </nav>
        </div>
      </header>

      {/* Editable Intro Sections */}
      <div className="mb-6">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-4 group relative">
            {editIndex === idx ? (
              section.type === "list" ? (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Edit List</h3>
                  {editList.map((item, i) => (
                    <div key={i} className="flex gap-2 mb-1">
                      <input
                        type="text"
                        value={item}
                        onChange={e => setEditList(editList.map((v, j) => j === i ? e.target.value : v))}
                        className="w-full p-2 border rounded"
                      />
                      <button type="button" onClick={() => setEditList(editList.filter((_, j) => j !== i))} className="text-red-600">Delete</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setEditList([...editList, ""])} className="text-blue-600 mb-2">+ Add Item</button>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleEditSave(idx)} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                    <button onClick={() => setEditIndex(null)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
                  </div>
                </div>
              ) : (
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
              )
            ) : (
              <>
                {section.type === "heading" && <h2 className="text-2xl font-semibold mb-4">{section.content}</h2>}
                {section.type === "paragraph" && (
                  <div className="mb-4 prose prose-blue">
                    <Markdown>{section.content}</Markdown>
                  </div>
                )}
                {section.type === "list" && (
                  <ul className="list-disc list-inside mb-4 space-y-2">
                    {section.content.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                )}
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
              <option value="list">List</option>
            </select>
            {addType === "list" ? (
              <div>
                {addList.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-1">
                    <input
                      type="text"
                      value={item}
                      onChange={e => setAddList(addList.map((v, j) => j === i ? e.target.value : v))}
                      className="w-full p-2 border rounded"
                    />
                    <button type="button" onClick={() => setAddList(addList.filter((_, j) => j !== i))} className="text-red-600">Delete</button>
                  </div>
                ))}
                <button type="button" onClick={() => setAddList([...addList, ""])} className="text-blue-600 mb-2">+ Add Item</button>
              </div>
            ) : (
              <textarea
                value={addValue}
                onChange={e => setAddValue(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                rows={addType === "heading" ? 1 : 3}
                placeholder={addType === "heading" ? "Heading" : "Paragraph"}
              />
            )}
            <button onClick={handleAddSection} className="bg-green-600 text-white px-4 py-2 rounded mt-2">Add Section</button>
          </div>
        )}
      </div>

      {/* Wishlist Items */}
      {wishlist.length === 0 ? (
        <p>No items in your wishlist.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {wishlist.map((item) => (
            <div key={item.id} className="border p-4 rounded shadow">
              <img
                src={item.image || "/images/placeholder.jpg"}
                alt={item.model || item.name}
                className="w-full h-48 object-cover mb-2 rounded"
              />
              <h2 className="text-lg font-semibold">{item.model || item.name}</h2>
              <p className="text-blue-600 font-medium">Rs. {item.price}</p>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => moveToCart(item)}
                  className="flex-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Move to Cart
                </button>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="flex-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
