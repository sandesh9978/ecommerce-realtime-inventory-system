import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Markdown from "./component/Markdown";

const defaultSections = [
  { type: "heading", content: "Contact Us" },
  { type: "paragraph", content: "We'd love to hear from you! Reach out to us for any questions, support, or feedback." },
];

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export default function Contact() {
  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem("contactSections");
    return saved ? JSON.parse(saved) : defaultSections;
  });
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [addType, setAddType] = useState("paragraph");
  const [addValue, setAddValue] = useState("");
  const user = getUser();
  const isAdmin = user && user.role === "admin";

  useEffect(() => {
    localStorage.setItem("contactSections", JSON.stringify(sections));
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
      {/* Header */}
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Contact Us</h1>
          <nav className="mt-2 sm:mt-0" aria-label="Primary navigation">
            <Link to="/" className="text-blue-600 hover:underline mx-2">Home</Link>
            <Link to="/about" className="text-blue-600 hover:underline mx-2">About</Link>
            <Link to="/contact" className="text-blue-800 font-semibold underline mx-2" aria-current="page">Contact</Link>
            <Link to="/wishlist" className="text-blue-600 hover:underline mx-2">Wishlist</Link>
            <Link to="/admin" className="text-blue-600 hover:underline mx-2">Admin</Link>
            <Link to="/products" className="text-blue-600 hover:underline mx-2">Products</Link>
          </nav>
        </div>
      </header>

      {/* Editable Intro Sections */}
      <main className="container mx-auto px-4 py-8 flex-grow">
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

        {/* Main Contact/Location Info (unchanged) */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
          <p>Email: <a href="mailto:support@ecommercestore.com" className="text-blue-600 underline">support@ecommercestore.com</a></p>
          <p>Phone: <a href="tel:+977123456789" className="text-blue-600 underline">+977-123456789</a></p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Our Location</h2>
          <div className="overflow-hidden rounded-lg shadow-md aspect-w-16 aspect-h-9">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d6514.949443356026!2d85.31434381732934!3d27.73120515157286!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb191ed757779f%3A0xa3fb7fed922d73e8!2sSamakhusi%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1748014393430!5m2!1sen!2snp"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Our Location on Google Maps"
              className="w-full h-full border-0"
            ></iframe>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white text-center py-4 border-t mt-8">
        <nav className="mb-2 space-x-4 text-sm" aria-label="Footer navigation">
          <Link to="/how-to-order" className="text-blue-600 hover:underline">How to Order</Link>
          <Link to="/payment-policy" className="text-blue-600 hover:underline">Payment Policy</Link>
          <Link to="/faq" className="text-blue-600 hover:underline">FAQs</Link>
          <Link to="/return-refund" className="text-blue-600 hover:underline">Return & Refund</Link>
        </nav>
        <p className="text-gray-600 text-sm">
          &copy; 2025 E-Commerce Storefront. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
