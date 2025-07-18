import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Markdown from "./component/Markdown";

const defaultSections = [
  { type: "heading", content: "Return & Refund Policy" },
  { type: "paragraph", content: "We strive to deliver only quality products, but if you're not satisfied, here’s how we handle returns and refunds:" },
  { type: "list", content: [
    "Returns are accepted within 7 days of delivery.",
    "Products must be unused, in original packaging, and include all accessories.",
    "To initiate a return, please contact our support team with your order number.",
    "Once we receive and verify the returned product, a full refund will be processed promptly."
  ]},
  { type: "paragraph", content: "No risks, no stress — your satisfaction is our priority." },
];

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export default function ReturnRefundPolicy() {
  const [form, setForm] = useState({ name: "", email: "", orderId: "", reason: "" });
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Section state for admin-editable content
  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem("returnRefundSections");
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

  useEffect(() => {
    localStorage.setItem("returnRefundSections", JSON.stringify(sections));
  }, [sections]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      const existing = JSON.parse(localStorage.getItem("returnRequests") || "[]");
      const updated = [...existing, { ...form, submittedAt: new Date().toISOString() }];
      localStorage.setItem("returnRequests", JSON.stringify(updated));
      setSuccess(true);
      setForm({ name: "", email: "", orderId: "", reason: "" });
      setSubmitting(false);
    }, 1000);
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
    <div className="bg-gray-100 text-gray-800 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow p-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold">📱 Mobile Price List</h1>
          <nav className="mt-2 md:mt-0 space-x-4 text-blue-600 font-medium">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/about" className="hover:underline">About</Link>
            <Link to="/contact" className="hover:underline">Contact</Link>
            <Link to="/wishlist" className="hover:underline">Wishlist</Link>
            <Link to="/admin" className="hover:underline">Admin</Link>
            <Link to="/products" className="hover:underline">Products</Link>
            <Link to="/return-refund" className="hover:underline font-semibold">Return & Refund</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded shadow flex-grow">
        {/* Editable Policy Sections */}
        <div className="mb-8">
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
                      {section.content.map((item, i) => (
                        <li key={i} className="prose prose-blue">
                          <Markdown>{item}</Markdown>
                        </li>
                      ))}
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

        {/* Return Request Form */}
        <section className="mt-10">
          <h3 className="text-2xl font-semibold mb-4">📦 Submit a Return Request</h3>
          <form className="space-y-4 bg-gray-50 p-6 rounded shadow" onSubmit={handleSubmit}>
            <div>
              <label className="block font-medium mb-1">Full Name</label>
              <input type="text" name="name" required className="w-full border p-2 rounded" value={form.name} onChange={handleChange} />
            </div>
            <div>
              <label className="block font-medium mb-1">Email Address</label>
              <input type="email" name="email" required className="w-full border p-2 rounded" value={form.email} onChange={handleChange} />
            </div>
            <div>
              <label className="block font-medium mb-1">Order ID</label>
              <input type="text" name="orderId" required className="w-full border p-2 rounded" value={form.orderId} onChange={handleChange} />
            </div>
            <div>
              <label className="block font-medium mb-1">Reason for Return</label>
              <textarea name="reason" rows="4" required className="w-full border p-2 rounded" value={form.reason} onChange={handleChange}></textarea>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" disabled={submitting}>{submitting ? "Submitting..." : "Submit Request"}</button>
          </form>

          {/* Success Message */}
          {success && (
            <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
              ✅ Your return request has been submitted successfully!
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-400 space-x-4">
          <Link to="/return-refund" className="hover:underline">Return & Refund Policy</Link> |
          © 2025 E-Commerce Storefront. Payment is made only after the customer receives the product.
        </div>
      </footer>
    </div>
  );
} 