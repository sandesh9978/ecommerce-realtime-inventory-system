import React, { useEffect, useState } from "react";

const defaultSections = [
  { type: "heading", content: "Payment Policy" },
  { type: "paragraph", content: "We follow a Pay After Delivery policy:" },
  { type: "list", content: [
    "No advance or prepayment is required during checkout.",
    "You only pay once the product is delivered to your address and you are satisfied with the purchase.",
    "Payments can be made via cash on delivery (COD), bank transfer, or mobile wallets (coming soon)."
  ]},
  { type: "paragraph", content: "This approach ensures trust and peace of mind for every customer." },
];

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export default function PaymentPolicy() {
  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem("paymentPolicySections");
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
    localStorage.setItem("paymentPolicySections", JSON.stringify(sections));
  }, [sections]);

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
      <header className="bg-white shadow p-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <i className="fas fa-credit-card"></i> 💳 Payment Policy
          </h1>
          <nav className="mt-2 md:mt-0 space-x-4 text-blue-600 font-medium">
            <a href="/" className="hover:underline">
              Home
            </a>
            <a href="/about" className="hover:underline">
              About
            </a>
            <a href="/contact" className="hover:underline">
              Contact
            </a>
            <a href="/payment-policy" className="hover:underline font-semibold">
              Payment Policy
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 bg-white mt-6 rounded shadow flex-grow">
        {/* Editable Policy Sections */}
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

        <div className="mt-6">
          <a
            href="/"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            ← Back to Home
          </a>
        </div>

        <div className="mt-8 text-sm text-gray-600 italic">
          <p>
            Have questions about payment? See our{" "}
            <a href="/faq" className="text-blue-600 hover:underline">
              FAQs
            </a>
            .
          </p>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-400">
          © 2025 E-Commerce Storefront. Payment is made only after the customer
          receives the product.
        </div>
      </footer>
    </div>
  );
}
