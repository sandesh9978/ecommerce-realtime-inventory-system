import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Markdown from "./component/Markdown";

const defaultSections = [
  { type: "heading", content: "How to Order" },
  { type: "paragraph", content: "Ordering from our store is simple and hassle-free. Follow the steps below to complete your purchase!" },
];

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export default function HowToOrder() {
  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem("howToOrderSections");
    return saved ? JSON.parse(saved) : defaultSections;
  });
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [addType, setAddType] = useState("paragraph");
  const [addValue, setAddValue] = useState("");
  const user = getUser();
  const isAdmin = user && user.role === "admin";

  useEffect(() => {
    localStorage.setItem("howToOrderSections", JSON.stringify(sections));
  }, [sections]);

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
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <span role="img" aria-label="package">📦</span> How to Order
          </h1>
          <nav className="mt-2 sm:mt-0" aria-label="Primary navigation">
            <Link to="/" className="text-blue-600 hover:underline mx-2">Home</Link>
            <Link to="/about" className="text-blue-600 hover:underline mx-2">About</Link>
            <Link to="/contact" className="text-blue-600 hover:underline mx-2">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Editable Intro Sections */}
      <main className="container mx-auto px-4 py-8 flex-grow max-w-3xl">
        <div className="mb-8">
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
                  {section.type === "heading" && <h2 className="text-2xl font-semibold mb-4">{section.content}</h2>}
                  {section.type === "paragraph" && (
                    <div className="mb-4 prose prose-blue">
                      <Markdown>{section.content}</Markdown>
                    </div>
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

        {/* Order Steps/List (unchanged) */}
        <p className="mb-4 text-lg">Ordering from our store is simple and hassle-free:</p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Browse products through categories or search.</li>
          <li>Click on a product to view its details.</li>
          <li>Add the desired item(s) to your cart.</li>
          <li>Proceed to checkout and fill in your shipping information.</li>
          <li>Confirm your order – no upfront payment is required.</li>
          <li>Our team will process and ship your order.</li>
          <li>Pay only after you receive and inspect your product.</li>
        </ul>
        <p className="mt-6 text-blue-600 font-semibold">We believe in a transparent and customer-first experience!</p>
      </main>

      <footer className="bg-white text-center py-4 border-t mt-8">
        <p className="text-sm text-gray-600">© 2025 E-Commerce Storefront. All rights reserved.</p>
      </footer>
    </div>
  );
}
