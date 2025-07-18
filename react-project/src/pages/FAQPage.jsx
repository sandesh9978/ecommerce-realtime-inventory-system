import React, { useState, useEffect, useCallback } from "react";
import Markdown from "./component/Markdown";

const defaultSections = [
  { type: "heading", content: "Frequently Asked Questions" },
  { type: "paragraph", content: "Find answers to common questions about shopping, orders, and our policies below. If you have more questions, feel free to contact us!" },
];

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

// Replace the hardcoded faqData with localStorage-backed state
const defaultFaqs = [
  {
    id: "answer1",
    question: "Do I need to create an account to place an order?",
    answer:
      "No, but creating an account helps you track your orders and receive special offers.",
  },
  {
    id: "answer2",
    question: "When will my order arrive?",
    answer:
      "Orders are typically delivered within 2–5 business days, depending on your location.",
  },
  {
    id: "answer3",
    question: "Can I cancel or change my order after placing it?",
    answer: "Yes, you can contact our support team before the order is dispatched.",
  },
  {
    id: "answer4",
    question: "What if the product I received is damaged?",
    answer: "You can request a return or replacement under our return policy.",
  },
];

function getFaqs() {
  try {
    const saved = localStorage.getItem("faqList");
    return saved ? JSON.parse(saved) : defaultFaqs;
  } catch {
    return defaultFaqs;
  }
}

export default function FAQ() {
  const [openItems, setOpenItems] = useState(() => {
    // Load saved state from localStorage
    const saved = localStorage.getItem("faqState");
    return saved ? JSON.parse(saved) : {};
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Editable intro sections
  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem("faqSections");
    return saved ? JSON.parse(saved) : defaultSections;
  });
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [addType, setAddType] = useState("paragraph");
  const [addValue, setAddValue] = useState("");
  const user = getUser();
  const isAdmin = user && user.role === "admin";

  // FAQ state
  const [faqs, setFaqs] = useState(getFaqs);
  const [faqEditId, setFaqEditId] = useState(null);
  const [faqEditQ, setFaqEditQ] = useState("");
  const [faqEditA, setFaqEditA] = useState("");
  const [faqAddQ, setFaqAddQ] = useState("");
  const [faqAddA, setFaqAddA] = useState("");

  useEffect(() => {
    localStorage.setItem("faqSections", JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem("faqList", JSON.stringify(faqs));
  }, [faqs]);

  // Save openItems state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("faqState", JSON.stringify(openItems));
  }, [openItems]);

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

  const toggleItem = useCallback(
    (id) => {
      setOpenItems((prev) => {
        const isOpen = !!prev[id];
        return { ...prev, [id]: !isOpen };
      });
    },
    [setOpenItems]
  );

  const expandAll = () => {
    const allOpen = {};
    faqs.forEach(({ id }) => {
      allOpen[id] = true;
    });
    setOpenItems(allOpen);
  };

  const collapseAll = () => {
    setOpenItems({});
  };

  const filteredFaqs = faqs.filter(({ question, answer }) => {
    const q = searchQuery.toLowerCase();
    return (
      question.toLowerCase().includes(q) || answer.toLowerCase().includes(q)
    );
  });

  // FAQ admin handlers
  const handleFaqEdit = (faq) => {
    setFaqEditId(faq.id);
    setFaqEditQ(faq.question);
    setFaqEditA(faq.answer);
  };

  const handleFaqEditSave = (id) => {
    setFaqs(faqs.map(faq => faq.id === id ? { ...faq, question: faqEditQ, answer: faqEditA } : faq));
    setFaqEditId(null);
    setFaqEditQ("");
    setFaqEditA("");
  };

  const handleFaqEditCancel = () => {
    setFaqEditId(null);
    setFaqEditQ("");
    setFaqEditA("");
  };

  const handleFaqDelete = (id) => {
    if (window.confirm("Delete this FAQ?")) {
      setFaqs(faqs.filter(faq => faq.id !== id));
    }
  };

  const handleFaqAdd = (e) => {
    e.preventDefault();
    if (!faqAddQ.trim() || !faqAddA.trim()) return;
    const newFaq = {
      id: `faq_${Date.now()}`,
      question: faqAddQ,
      answer: faqAddA,
    };
    setFaqs([...faqs, newFaq]);
    setFaqAddQ("");
    setFaqAddA("");
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <span>❓</span> Frequently Asked Questions
          </h1>
          <nav className="mt-2 sm:mt-0" aria-label="Primary navigation">
            <a href="/" className="text-blue-600 hover:underline mx-2">
              Home
            </a>
            <a href="/about" className="text-blue-600 hover:underline mx-2">
              About
            </a>
            <a
              href="/contact"
              className="text-blue-600 hover:underline mx-2"
              aria-current="page"
            >
              Contact
            </a>
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

        <div className="mb-6 flex items-center gap-4">
          <input
            type="search"
            placeholder="Search FAQs..."
            aria-label="Search FAQs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={expandAll}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
          >
            Collapse All
          </button>
        </div>

        <section id="faq-list" className="space-y-6">
          {filteredFaqs.length === 0 && (
            <p className="text-center text-gray-500">No FAQs found.</p>
          )}
          {filteredFaqs.map(({ id, question, answer }) => {
            const isOpen = !!openItems[id];
            const isEditing = faqEditId === id;
            return (
              <article key={id}>
                {isEditing ? (
                  <form
                    className="mb-2 p-4 border rounded bg-gray-100"
                    onSubmit={e => { e.preventDefault(); handleFaqEditSave(id); }}
                  >
                    <input
                      type="text"
                      value={faqEditQ}
                      onChange={e => setFaqEditQ(e.target.value)}
                      className="w-full p-2 border rounded mb-2 font-semibold"
                      placeholder="Question"
                      required
                    />
                    <textarea
                      value={faqEditA}
                      onChange={e => setFaqEditA(e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                      rows={4}
                      placeholder="Answer (Markdown supported)"
                      required
                    />
                    <div className="flex gap-2 mt-2">
                      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                      <button type="button" onClick={handleFaqEditCancel} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h2
                      tabIndex={0}
                      role="button"
                      aria-expanded={isOpen}
                      aria-controls={id}
                      id={`question-${id}`}
                      onClick={() => toggleItem(id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleItem(id);
                        }
                      }}
                      className="faq-question text-xl font-semibold mb-2 flex justify-between items-center cursor-pointer select-none"
                    >
                      {question}
                      <svg
                        className={`w-5 h-5 text-blue-600 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </h2>
                    <div
                      id={id}
                      aria-labelledby={`question-${id}`}
                      className={`faq-answer max-h-0 overflow-hidden transition-max-height duration-300 border-l-4 border-blue-600 pl-4 ${
                        isOpen ? "max-h-96 py-2" : "py-0"
                      }`}
                    >
                      <Markdown>{answer}</Markdown>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleFaqEdit({ id, question, answer })} className="text-orange-600">Edit</button>
                        <button onClick={() => handleFaqDelete(id)} className="text-red-600">Delete</button>
                      </div>
                    )}
                  </>
                )}
              </article>
            );
          })}
        </section>
        {isAdmin && (
          <form onSubmit={handleFaqAdd} className="mt-8 p-4 border-t">
            <h3 className="text-lg font-semibold mb-2">Add New FAQ</h3>
            <input
              type="text"
              value={faqAddQ}
              onChange={e => setFaqAddQ(e.target.value)}
              className="w-full p-2 border rounded mb-2 font-semibold"
              placeholder="Question"
              required
            />
            <textarea
              value={faqAddA}
              onChange={e => setFaqAddA(e.target.value)}
              className="w-full p-2 border rounded mb-2"
              rows={4}
              placeholder="Answer (Markdown supported)"
              required
            />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded mt-2">Add FAQ</button>
          </form>
        )}
      </main>

      <footer className="bg-white text-center py-4 border-t mt-8">
        <p className="text-sm text-gray-600">
          © 2025 E-Commerce Storefront. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
