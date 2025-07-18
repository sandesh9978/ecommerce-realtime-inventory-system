import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminReviewManager() {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }

    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Failed to load reviews");
      setReviews(data);
    } catch (err) {
      setError("Error fetching reviews");
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Delete failed");
      alert("✅ Review deleted");
      fetchReviews();
    } catch {
      alert("Error deleting review");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">🛠️ Admin: Review Manager</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Product</th>
              <th className="border px-4 py-2">User</th>
              <th className="border px-4 py-2">Rating</th>
              <th className="border px-4 py-2">Comment</th>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id}>
                <td className="border px-4 py-2">{r.productName}</td>
                <td className="border px-4 py-2">{r.username}</td>
                <td className="border px-4 py-2">{"⭐".repeat(r.rating)}</td>
                <td className="border px-4 py-2">{r.comment}</td>
                <td className="border px-4 py-2">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => deleteReview(r.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.length === 0 && <p className="mt-4 text-gray-500">No reviews found.</p>}
      </div>
    </div>
  );
}
