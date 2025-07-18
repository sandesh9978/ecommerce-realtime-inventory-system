import React, { useEffect, useState } from 'react';

const UserReturnRequests = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Please log in to view your return requests.");
      setLoading(false);
      return;
    }
    fetch("http://localhost:5000/api/returns/user", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setError(data.message || "Failed to fetch return requests");
          // Try to load from localStorage
          const cached = localStorage.getItem("userReturnRequests");
          if (cached) {
            setReturns(JSON.parse(cached));
          } else {
            setReturns([]);
          }
        } else {
          setReturns(Array.isArray(data) ? data : []);
          setError("");
          // Save to localStorage
          localStorage.setItem("userReturnRequests", JSON.stringify(Array.isArray(data) ? data : []));
        }
      })
      .catch(() => {
        setError("Server error while fetching return requests.");
        // Try to load from localStorage
        const cached = localStorage.getItem("userReturnRequests");
        if (cached) {
          setReturns(JSON.parse(cached));
        } else {
          setReturns([]);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">↩️ My Return Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : returns.length === 0 ? (
        <p className="text-gray-600">No return requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Order ID</th>
                <th className="p-2 border">Reason</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((r) => (
                <tr key={r.id}>
                  <td className="p-2 border">{r.order_id}</td>
                  <td className="p-2 border">{r.reason}</td>
                  <td className="p-2 border">{r.status}</td>
                  <td className="p-2 border">{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserReturnRequests;
