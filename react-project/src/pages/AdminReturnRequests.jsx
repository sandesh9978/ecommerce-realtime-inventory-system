import React, { useEffect, useState } from "react";

export default function AdminReturnRequests() {
  const [returns, setReturns] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchReturns = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/returns/admin", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to fetch return requests");
        setReturns([]);
      } else {
        setReturns(data);
        setError("");
      }
    } catch (err) {
      setError("Server error while fetching returns");
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsProcessed = async (id) => {
    const token = localStorage.getItem("token");
    setProcessingId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/returns/${id}/process`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setReturns((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: "processed" } : r))
        );
      }
    } catch (err) {
      alert("Failed to mark as processed");
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🔁 Admin: Return Requests</h1>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading return requests...</p>
      ) : returns.length === 0 ? (
        <p>No return requests submitted yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-blue-50 text-blue-700 font-semibold">
              <tr>
                <th className="p-3 border">ID</th>
                <th className="p-3 border">User Email</th>
                <th className="p-3 border">Order ID</th>
                <th className="p-3 border">Reason</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-3">{r.id}</td>
                  <td className="p-3">{r.user_email || r.email}</td>
                  <td className="p-3">{r.order_id}</td>
                  <td className="p-3">{r.reason}</td>
                  <td className="p-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${r.status === "processed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{r.status || "pending"}</span>
                  </td>
                  <td className="p-3">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="p-3">
                    {r.status !== "processed" && (
                      <button
                        onClick={() => markAsProcessed(r.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        disabled={processingId === r.id}
                      >
                        {processingId === r.id ? "Processing..." : "Mark as Processed"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
