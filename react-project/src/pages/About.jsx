import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import siteConfig from "../config/siteConfig";

const defaultSections = [
  { type: "heading", content: "About Our Store" },
  { type: "paragraph", content: "Welcome to our comprehensive E-Commerce Store – your one-stop destination for quality products with advanced inventory management and customer-focused features. We're committed to providing a seamless shopping experience with real-time stock updates, secure payment options, and exceptional customer service." },
  { type: "paragraph", content: "Our store combines cutting-edge technology with user-friendly design to create an online shopping experience that rivals the best e-commerce platforms. From real-time inventory tracking to automated restock alerts, we ensure you always have the most up-to-date information about product availability." },
  { type: "heading", content: "Our Mission" },
  { type: "paragraph", content: "To provide customers with a transparent, efficient, and enjoyable online shopping experience while maintaining the highest standards of product quality and customer service. We believe in building trust through technology and delivering value through innovation." },
  { type: "heading", content: "Key Features" },
  { type: "list", content: [
    "🛒 Real-Time Inventory Management: Always see accurate stock levels before purchasing",
    "🔍 Advanced Search & Filters: Find products quickly with smart filtering options",
    "📱 Mobile-Responsive Design: Shop seamlessly on any device",
    "💳 Multiple Payment Options: Secure checkout with various payment methods",
    "📦 Order Tracking: Monitor your orders from purchase to delivery",
    "⭐ Customer Reviews & Ratings: Make informed decisions with authentic feedback",
    "❤️ Wishlist Management: Save favorite items for future purchase",
    "🔔 Restock Alerts: Get notified when out-of-stock items become available",
    "🔄 Easy Returns & Refunds: Hassle-free return process",
    "👨‍💼 Admin Dashboard: Comprehensive inventory and order management"
  ]},
  { type: "heading", content: "Why Choose Us?" },
  { type: "list", content: [
    "Transparency: Real-time stock updates prevent disappointment",
    "Reliability: Secure payment processing and order fulfillment",
    "Customer Focus: Dedicated support and easy return policies",
    "Innovation: Latest e-commerce features and technologies",
    "Quality: Carefully curated product selection",
    "Convenience: User-friendly interface and mobile optimization"
  ]},
  { type: "heading", content: "Our Technology" },
  { type: "paragraph", content: "Built with modern web technologies including React.js for the frontend, Node.js for the backend, and MySQL for robust data management. Our system features real-time inventory updates, automated admin notifications for low stock, customer restock alerts, and comprehensive order management." },
  { type: "heading", content: "Customer Service" },
  { type: "paragraph", content: "We're committed to providing exceptional customer service. Our support team is available to help with any questions about products, orders, or technical issues. We believe in building long-term relationships with our customers through trust, transparency, and reliable service." },
  { type: "heading", content: "Contact Information" },
  { type: "list", content: [
    "📧 Email: support@ourstore.com",
    "📞 Phone: +1 (555) 123-4567",
    "🏢 Address: 123 E-Commerce Street, Digital City, DC 12345",
    "⏰ Hours: Monday-Friday 9AM-6PM, Saturday 10AM-4PM"
  ]},
  { type: "paragraph", content: "Thank you for choosing our store. We're excited to serve you and look forward to providing you with an exceptional shopping experience!" }
];

const defaultStoreSections = [
  { type: "heading", content: "About Our Store" },
  { type: "paragraph", content: "Our store was founded in 2024 with a mission to provide quality products and excellent service..." },
];

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const About = () => {
  const location = useLocation();
  const [tab, setTab] = useState("project");
  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem("aboutSections");
    return saved ? JSON.parse(saved) : defaultSections;
  });
  const [storeSections, setStoreSections] = useState(() => {
    const saved = localStorage.getItem("aboutStoreSections");
    return saved ? JSON.parse(saved) : defaultStoreSections;
  });
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editList, setEditList] = useState([]);
  const [addType, setAddType] = useState("paragraph");
  const [addValue, setAddValue] = useState("");
  const [addList, setAddList] = useState([""]);
  const [storeEditIndex, setStoreEditIndex] = useState(null);
  const [storeEditValue, setStoreEditValue] = useState("");
  const [storeEditList, setStoreEditList] = useState([]);
  const [storeAddType, setStoreAddType] = useState("paragraph");
  const [storeAddValue, setStoreAddValue] = useState("");
  const [storeAddList, setStoreAddList] = useState([""]);
  const user = getUser();
  const isAdmin = user && user.role === "admin";

  // Persist sections
  React.useEffect(() => {
    localStorage.setItem("aboutSections", JSON.stringify(sections));
  }, [sections]);
  React.useEffect(() => {
    localStorage.setItem("aboutStoreSections", JSON.stringify(storeSections));
  }, [storeSections]);

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

  // Store tab handlers
  const handleStoreEdit = (idx) => {
    setStoreEditIndex(idx);
    if (storeSections[idx].type === "list") {
      setStoreEditList([...storeSections[idx].content]);
    } else {
      setStoreEditValue(storeSections[idx].content);
    }
  };
  const handleStoreEditSave = (idx) => {
    const updated = [...storeSections];
    if (storeSections[idx].type === "list") {
      updated[idx].content = storeEditList.filter(item => item.trim() !== "");
    } else {
      updated[idx].content = storeEditValue;
    }
    setStoreSections(updated);
    setStoreEditIndex(null);
    setStoreEditValue("");
    setStoreEditList([]);
  };
  const handleStoreDelete = (idx) => {
    if (window.confirm("Delete this section?")) {
      setStoreSections(storeSections.filter((_, i) => i !== idx));
    }
  };
  const handleStoreAddSection = () => {
    let newSection;
    if (storeAddType === "list") {
      newSection = { type: "list", content: storeAddList.filter(item => item.trim() !== "") };
    } else if (storeAddType === "heading") {
      newSection = { type: "heading", content: storeAddValue };
    } else {
      newSection = { type: "paragraph", content: storeAddValue };
    }
    setStoreSections([...storeSections, newSection]);
    setStoreAddType("paragraph");
    setStoreAddValue("");
    setStoreAddList([""]);
  };

  return (
    <div className="bg-gray-100 text-gray-800 font-sans min-h-screen">
      <header className="bg-white shadow p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center">📖 About Our Store</h1>
          <nav
            className="mt-4 text-center space-x-4 text-blue-600 font-medium"
            role="navigation"
            aria-label="Primary"
          >
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            <Link to="/wishlist" className="nav-link">Wishlist</Link>
            <Link to="/admin" className="nav-link">Admin</Link>
            <Link to="/product" className="nav-link">Products</Link>
            <Link to="/how-to-order" className="nav-link">How to Order</Link>
            |
            <Link to="/payment-policy" className="nav-link">Payment Policy</Link>
            |
            <Link to="/faq" className="nav-link">FAQs</Link>
            |
            <Link to="/return-refund" className="nav-link">Returns</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto bg-white mt-6 p-6 rounded shadow leading-relaxed">
        <div className="flex space-x-4 mb-6">
          <button
            className={tab === "project" ? "font-bold underline" : ""}
            onClick={() => setTab("project")}
          >
            About Project
          </button>
          <button
            className={tab === "store" ? "font-bold underline" : ""}
            onClick={() => setTab("store")}
          >
            About Store
          </button>
        </div>
        {tab === "project" && (
          <>
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
                    {section.type === "paragraph" && <p className="mb-4">{section.content}</p>}
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
              <div className="mt-12 p-6 border-t-4 border-blue-500 bg-blue-50 rounded-lg shadow-lg max-w-2xl mx-auto">
                <h3 className="text-xl font-bold mb-4 text-blue-800 flex items-center">
                  <span className="mr-2 text-2xl">➕</span> Add New Section
                </h3>
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <select value={addType} onChange={e => setAddType(e.target.value)} className="p-2 border rounded bg-white">
                    <option value="paragraph">Paragraph</option>
                    <option value="heading">Heading</option>
                    <option value="list">List</option>
                  </select>
                  {addType === "list" ? (
                    <div className="flex-1">
                      {addList.map((item, i) => (
                        <div key={i} className="flex gap-2 mb-1">
                          <input
                            type="text"
                            value={item}
                            onChange={e => setAddList(addList.map((v, j) => j === i ? e.target.value : v))}
                            className="w-full p-2 border rounded"
                            placeholder={`List item ${i + 1}`}
                          />
                          <button type="button" onClick={() => setAddList(addList.filter((_, j) => j !== i))} className="text-red-600 font-bold">✕</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setAddList([...addList, ""])} className="text-blue-600 font-semibold mt-2">+ Add List Item</button>
                    </div>
                  ) : (
                    <textarea
                      value={addValue}
                      onChange={e => setAddValue(e.target.value)}
                      className="w-full p-2 border rounded"
                      rows={addType === "heading" ? 1 : 3}
                      placeholder={addType === "heading" ? "Heading" : "Paragraph"}
                    />
                  )}
                </div>
                <button onClick={handleAddSection} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-lg font-semibold shadow transition-all">
                  <span className="mr-2">➕</span> Add Section
                </button>
              </div>
            )}
          </>
        )}
        {tab === "store" && (
          <>
            {storeSections.map((section, idx) => (
              <div key={idx} className="mb-4 group relative">
                {storeEditIndex === idx ? (
                  section.type === "list" ? (
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Edit List</h3>
                      {storeEditList.map((item, i) => (
                        <div key={i} className="flex gap-2 mb-1">
                          <input
                            type="text"
                            value={item}
                            onChange={e => setStoreEditList(storeEditList.map((v, j) => j === i ? e.target.value : v))}
                            className="w-full p-2 border rounded"
                          />
                          <button type="button" onClick={() => setStoreEditList(storeEditList.filter((_, j) => j !== i))} className="text-red-600">Delete</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setStoreEditList([...storeEditList, ""])} className="text-blue-600 mb-2">+ Add Item</button>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleStoreEditSave(idx)} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                        <button onClick={() => setStoreEditIndex(null)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={e => { e.preventDefault(); handleStoreEditSave(idx); }}>
                      {section.type === "heading" ? (
                        <input
                          type="text"
                          value={storeEditValue}
                          onChange={e => setStoreEditValue(e.target.value)}
                          className="w-full p-2 border rounded text-xl font-semibold mb-2"
                        />
                      ) : (
                        <textarea
                          value={storeEditValue}
                          onChange={e => setStoreEditValue(e.target.value)}
                          className="w-full p-2 border rounded mb-2"
                          rows={3}
                        />
                      )}
                      <div className="flex gap-2 mt-2">
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                        <button type="button" onClick={() => setStoreEditIndex(null)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
                      </div>
                    </form>
                  )
                ) : (
                  <>
                    {section.type === "heading" && <h2 className="text-2xl font-semibold mb-4">{section.content}</h2>}
                    {section.type === "paragraph" && <p className="mb-4">{section.content}</p>}
                    {section.type === "list" && (
                      <ul className="list-disc list-inside mb-4 space-y-2">
                        {section.content.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    )}
                    {isAdmin && (
                      <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button onClick={() => handleStoreEdit(idx)} className="text-orange-600">Edit</button>
                        <button onClick={() => handleStoreDelete(idx)} className="text-red-600">Delete</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            {isAdmin && (
              <div className="mt-12 p-6 border-t-4 border-blue-500 bg-blue-50 rounded-lg shadow-lg max-w-2xl mx-auto">
                <h3 className="text-xl font-bold mb-4 text-blue-800 flex items-center">
                  <span className="mr-2 text-2xl">➕</span> Add New Section
                </h3>
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <select value={storeAddType} onChange={e => setStoreAddType(e.target.value)} className="p-2 border rounded bg-white">
                    <option value="paragraph">Paragraph</option>
                    <option value="heading">Heading</option>
                    <option value="list">List</option>
                  </select>
                  {storeAddType === "list" ? (
                    <div className="flex-1">
                      {storeAddList.map((item, i) => (
                        <div key={i} className="flex gap-2 mb-1">
                          <input
                            type="text"
                            value={item}
                            onChange={e => setStoreAddList(storeAddList.map((v, j) => j === i ? e.target.value : v))}
                            className="w-full p-2 border rounded"
                            placeholder={`List item ${i + 1}`}
                          />
                          <button type="button" onClick={() => setStoreAddList(storeAddList.filter((_, j) => j !== i))} className="text-red-600 font-bold">✕</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setStoreAddList([...storeAddList, ""])} className="text-blue-600 font-semibold mt-2">+ Add List Item</button>
                    </div>
                  ) : (
                    <textarea
                      value={storeAddValue}
                      onChange={e => setStoreAddValue(e.target.value)}
                      className="w-full p-2 border rounded"
                      rows={storeAddType === "heading" ? 1 : 3}
                      placeholder={storeAddType === "heading" ? "Heading" : "Paragraph"}
                    />
                  )}
                </div>
                <button onClick={handleStoreAddSection} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-lg font-semibold shadow transition-all">
                  <span className="mr-2">➕</span> Add Section
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="w-full bg-white shadow mt-12 py-6 border-t">
        <div className="max-w-6xl mx-auto text-center text-gray-600">
          <p>Contact us: <a href={`mailto:${siteConfig.contactEmail}`} className="text-blue-600 hover:underline">{siteConfig.contactEmail}</a></p>
          <p className="mt-2">{siteConfig.copyright}</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
