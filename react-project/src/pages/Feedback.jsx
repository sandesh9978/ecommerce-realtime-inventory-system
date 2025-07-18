import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Markdown from "./component/Markdown";

const API_URL = "http://localhost:5000/api/feedback";

const defaultSections = [
  { type: "heading", content: "Leave Your Feedback" },
  { type: "paragraph", content: "We value your feedback! Please share your thoughts, suggestions, or issues below. Your input helps us improve our service." },
];

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

function Feedback() {
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    rating: 5,
    comments: "",
  });
  const [feedbacks, setFeedbacks] = useState([]);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Admin-editable sections
  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem("feedbackSections");
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

  // Track which feedback's review form is open, keyed by feedback ID
  const [activeReviewFormId, setActiveReviewFormId] = useState(null);
  // Review input state keyed by feedback ID
  const [reviewInputs, setReviewInputs] = useState({});

  // Load feedbacks from backend
  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    localStorage.setItem("feedbackSections", JSON.stringify(sections));
  }, [sections]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch feedbacks");
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.data.map(fb => ({ ...fb, reviews: fb.reviews || [] })));
      } else {
        setError(data.message || "Failed to load feedbacks.");
      }
    } catch (err) {
      setError("Network error while loading feedbacks.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ id: null, name: "", email: "", rating: 5, comments: "" });
  };

  // Submit new or edited feedback
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, comments } = formData;
    if (!name.trim() || !email.trim() || !comments.trim()) {
      setNotification({ message: "Please fill in all required fields.", type: "warning" });
      return;
    }
    setLoading(true);
    try {
      if (formData.id === null) {
        // New feedback
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, createdAt: new Date().toISOString() }),
        });
        const data = await res.json();
        if (data.success) {
          setNotification({ message: "Feedback submitted successfully!", type: "success" });
          fetchFeedbacks();
        } else {
          setNotification({ message: data.message || "Failed to submit feedback.", type: "error" });
        }
      } else {
        // Edit feedback
        const res = await fetch(`${API_URL}/${formData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setNotification({ message: "Feedback updated successfully!", type: "success" });
          fetchFeedbacks();
        } else {
          setNotification({ message: data.message || "Failed to update feedback.", type: "error" });
        }
      }
      resetForm();
    } catch (err) {
      setNotification({ message: "Network/server error. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feedback) => {
    setFormData(feedback);
    setNotification({ message: "", type: "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setNotification({ message: "Feedback deleted successfully.", type: "success" });
        fetchFeedbacks();
        if (formData.id === id) resetForm();
      } else {
        setNotification({ message: data.message || "Failed to delete feedback.", type: "error" });
      }
    } catch (err) {
      setNotification({ message: "Network/server error. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    resetForm();
    setNotification({ message: "", type: "" });
  };

  // Handle review input change for a particular feedback
  const handleReviewInputChange = (feedbackId, e) => {
    const value = e.target.value;
    setReviewInputs(prev => ({ ...prev, [feedbackId]: value }));
  };

  // Submit a review/comment for a feedback
  const handleSubmitReview = async (feedbackId) => {
    const reviewText = reviewInputs[feedbackId]?.trim();
    if (!reviewText) {
      setNotification({ message: "Review cannot be empty.", type: "warning" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${feedbackId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: reviewText, createdAt: new Date().toISOString() }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ message: "Review added successfully!", type: "success" });
        setReviewInputs(prev => ({ ...prev, [feedbackId]: "" }));
        setActiveReviewFormId(null);
        fetchFeedbacks();
      } else {
        setNotification({ message: data.message || "Failed to add review.", type: "error" });
      }
    } catch (err) {
      setNotification({ message: "Network/server error. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Section editing logic (unchanged)
  const handleSectionEdit = (idx) => {
    setEditIndex(idx);
    if (sections[idx].type === "list") {
      setEditList([...sections[idx].content]);
    } else {
      setEditValue(sections[idx].content);
    }
  };

  const handleSectionEditSave = (idx) => {
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

  const handleSectionDelete = (idx) => {
    if (window.confirm("Delete this section?")) {
      setSections(sections.filter((_, i) => i !== idx));
    }
  };

  const handleSectionAdd = () => {
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

  if (!user) {
    return <p>Please log in to leave feedback.</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow-md">
      {/* Navigation Links */}
      <nav className="mb-6 flex flex-wrap gap-4 text-blue-600 font-medium justify-center">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/products" className="hover:underline">Products</Link>
        <Link to="/about" className="hover:underline">About</Link>
        <Link to="/cart" className="hover:underline">Cart</Link>
        <Link to="/wishlist" className="hover:underline">Wishlist</Link>
        <Link to="/return-refund" className="hover:underline">Return & Refund</Link>
        <Link to="/payment-policy" className="hover:underline">Payment Policy</Link>
        <Link to="/faq" className="hover:underline">FAQ</Link>
      </nav>
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
                    <button onClick={() => handleSectionEditSave(idx)} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                    <button onClick={() => setEditIndex(null)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); handleSectionEditSave(idx); }}>
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
                    <button onClick={() => handleSectionEdit(idx)} className="text-orange-600">Edit</button>
                    <button onClick={() => handleSectionDelete(idx)} className="text-red-600">Delete</button>
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
            <button onClick={handleSectionAdd} className="bg-green-600 text-white px-4 py-2 rounded mt-2">Add Section</button>
          </div>
        )}
      </div>

      <h1 className="text-3xl font-semibold mb-6 text-center">📣 Leave Your Feedback</h1>

      {notification.message && (
        <div
          className={`mb-4 px-4 py-2 rounded ${
            notification.type === "success"
              ? "bg-green-100 text-green-700"
              : notification.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
          role="alert"
        >
          {notification.message}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-2 rounded bg-red-100 text-red-700" role="alert">
          {error}
        </div>
      )}

      {/* Feedback form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <input
          name="name"
          type="text"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Your Name"
          required
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />

        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Your Email"
          required
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />

        <select
          name="rating"
          value={formData.rating}
          onChange={handleInputChange}
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} Star{r > 1 ? "s" : ""}
            </option>
          ))}
        </select>

        <textarea
          name="comments"
          value={formData.comments}
          onChange={handleInputChange}
          placeholder="Your comments"
          required
          rows={4}
          className="w-full border border-gray-300 p-3 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />

        <div className="flex justify-between items-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formData.id === null ? "Submit Feedback" : "Update Feedback"}
          </button>

          {formData.id !== null && (
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={loading}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Feedback list */}
      <div className="space-y-6">
        {loading ? (
          <p>Loading feedback...</p>
        ) : feedbacks.length === 0 ? (
          <p className="text-gray-500 text-center">No feedback yet. Be the first to leave your thoughts!</p>
        ) : (
          <ul className="space-y-6">
            {feedbacks.map((fb) => (
              <li key={fb.id} className="border border-gray-200 rounded p-4 shadow-sm relative group">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-semibold text-blue-700">{fb.name}</span>
                    <span className="ml-2 text-gray-500 text-xs">{fb.email}</span>
                  </div>
                  {fb.createdAt && (
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date(fb.createdAt).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <div className="mb-2">
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mr-2">
                    Rating: {Array.from({ length: 5 }, (_, i) => i < fb.rating ? '⭐' : '⭐').join('')}
                  </span>
                </div>
                <p className="mb-2">{fb.comments}</p>
                {((user && user.email === fb.email) || (user && user.role === 'admin')) && (
                  <div className="flex flex-col gap-2 ml-6">
                    <button
                      onClick={() => handleEdit(fb)}
                      className="text-blue-600 hover:underline text-sm"
                      aria-label={`Edit feedback from ${fb.name}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(fb.id)}
                      className="text-red-600 hover:underline text-sm"
                      aria-label={`Delete feedback from ${fb.name}`}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() =>
                        setActiveReviewFormId((prev) => (prev === fb.id ? null : fb.id))
                      }
                      className="text-green-600 hover:underline text-sm"
                      aria-expanded={activeReviewFormId === fb.id}
                      aria-controls={`review-form-${fb.id}`}
                    >
                      {activeReviewFormId === fb.id ? "Cancel Review" : "Add Review"}
                    </button>
                  </div>
                )}
                {/* Reviews List */}
                {fb.reviews && fb.reviews.length > 0 && (
                  <div className="mt-4 pl-4 border-l border-gray-300">
                    <h3 className="font-semibold mb-2 text-gray-700">Reviews:</h3>
                    <ul className="space-y-3">
                      {fb.reviews.map((rev, idx) => (
                        <li key={idx} className="bg-gray-50 p-3 rounded">
                          <p className="text-gray-800 whitespace-pre-line">{rev.comment}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {rev.createdAt ? new Date(rev.createdAt).toLocaleString() : ""}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Review Form */}
                {activeReviewFormId === fb.id && (
                  <div
                    id={`review-form-${fb.id}`}
                    className="mt-4 border-t pt-4"
                  >
                    <textarea
                      rows={3}
                      value={reviewInputs[fb.id] || ""}
                      onChange={(e) => handleReviewInputChange(fb.id, e)}
                      placeholder="Write your review here..."
                      className="w-full border border-gray-300 p-3 rounded resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={loading}
                    />
                    <button
                      onClick={() => handleSubmitReview(fb.id)}
                      disabled={loading}
                      className="mt-2 bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Review
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Feedback;
