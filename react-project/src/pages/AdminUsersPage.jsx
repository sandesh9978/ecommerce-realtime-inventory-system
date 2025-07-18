import React, { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ email: "", fullName: "", role: "user" });
  const [resetUser, setResetUser] = useState(null);
  const [resetPassword, setResetPassword] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [viewUserDetails, setViewUserDetails] = useState(null);
  const [viewUserLoading, setViewUserLoading] = useState(false);
  const [viewUserError, setViewUserError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
        setError("");
      } else {
        setError(data.message || "Failed to fetch users");
      }
    } catch (err) {
      setError("Server error while fetching users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Edit user handlers
  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({ email: user.email, fullName: user.fullName || "", role: user.role });
  };
  const closeEdit = () => {
    setEditUser(null);
    setEditForm({ email: "", fullName: "", role: "user" });
  };
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const submitEdit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${editUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        closeEdit();
        fetchUsers();
      } else {
        alert("Failed to update user");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Ban/Unban handlers
  const banUser = async (user) => {
    if (!window.confirm(`Ban user ${user.email}?`)) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/admin/users/${user.id}/ban`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } finally {
      setActionLoading(false);
    }
  };
  const unbanUser = async (user) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/admin/users/${user.id}/unban`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } finally {
      setActionLoading(false);
    }
  };

  // Reset password handlers
  const openReset = (user) => {
    setResetUser(user);
    setResetPassword("");
  };
  const closeReset = () => {
    setResetUser(null);
    setResetPassword("");
  };
  const submitReset = async (e) => {
    e.preventDefault();
    if (!resetPassword) return alert("Enter new password");
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${resetUser.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newPassword: resetPassword }),
      });
      if (res.ok) {
        closeReset();
        alert("Password reset successfully");
      } else {
        alert("Failed to reset password");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch full user details when viewUser is set
  useEffect(() => {
    if (viewUser) {
      setViewUserLoading(true);
      setViewUserError("");
      setViewUserDetails(null);
      const token = localStorage.getItem("token");
      fetch(`http://localhost:5000/api/admin/users/${viewUser.id}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          const data = await res.json();
          if (res.ok) {
            setViewUserDetails(data);
          } else {
            setViewUserError(data.message || "Failed to fetch user details");
          }
        })
        .catch(() => setViewUserError("Server error while fetching user details."))
        .finally(() => setViewUserLoading(false));
    }
  }, [viewUser]);

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans text-gray-800">
      <h1 className="text-2xl font-bold mb-6">👥 Admin: User Management</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-blue-50 text-blue-700 font-semibold">
              <tr>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Role</th>
                <th className="p-3 border">Signup Date</th>
                <th className="p-3 border">Banned</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.fullName || "-"}</td>
                  <td className="p-3 capitalize">{user.role}</td>
                  <td className="p-3">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-center">{user.banned ? "Yes" : "No"}</td>
                  <td className="p-3 space-x-2">
                    <button className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700" onClick={() => setViewUser(user)} disabled={actionLoading}>View</button>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" onClick={() => openEdit(user)} disabled={actionLoading}>Edit</button>
                    {user.banned ? (
                      <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700" onClick={() => unbanUser(user)} disabled={actionLoading}>Unban</button>
                    ) : (
                      <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700" onClick={() => banUser(user)} disabled={actionLoading}>Ban</button>
                    )}
                    <button className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700" onClick={() => openReset(user)} disabled={actionLoading}>Reset Password</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View User Modal */}
      {viewUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">User Details</h2>
            {viewUserLoading && <div>Loading user details...</div>}
            {viewUserError && <div className="text-red-600 mb-2">{viewUserError}</div>}
            {viewUserDetails && (
              <>
                <div className="mb-2"><strong>Email:</strong> {viewUserDetails.user.email}</div>
                <div className="mb-2"><strong>Name:</strong> {viewUserDetails.user.fullName || "-"}</div>
                <div className="mb-2"><strong>Role:</strong> {viewUserDetails.user.role}</div>
                <div className="mb-2"><strong>Signup Date:</strong> {new Date(viewUserDetails.user.created_at).toLocaleString()}</div>
                <div className="mb-2"><strong>Banned:</strong> {viewUserDetails.user.banned ? "Yes" : "No"}</div>
                <hr className="my-3" />
                <div className="mb-2">
                  <strong>Recent Orders:</strong>
                  {viewUserDetails.orders.length === 0 ? (
                    <div className="text-gray-500">No orders found.</div>
                  ) : (
                    <ul className="list-disc ml-5">
                      {viewUserDetails.orders.slice(0, 5).map((order) => (
                        <li key={order.id}>
                          #{order.id} - {order.status} - ${order.total_amount} - {new Date(order.created_at).toLocaleDateString()}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="mb-2">
                  <strong>Recent Activity:</strong>
                  {viewUserDetails.activity.length === 0 ? (
                    <div className="text-gray-500">No activity found.</div>
                  ) : (
                    <ul className="list-disc ml-5">
                      {viewUserDetails.activity.slice(0, 5).map((act) => (
                        <li key={act.id}>
                          {act.action} - {act.details} ({new Date(act.created_at).toLocaleString()})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="mb-2">
                  <strong>Wishlist:</strong>
                  {viewUserDetails.wishlist.length === 0 ? (
                    <div className="text-gray-500">No wishlist items.</div>
                  ) : (
                    <ul className="list-disc ml-5">
                      {viewUserDetails.wishlist.slice(0, 5).map((item, idx) => (
                        <li key={idx}>
                          {item.name} - ${item.price}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="mb-2">
                  <strong>Restock Alerts:</strong>
                  {viewUserDetails.restockAlerts.length === 0 ? (
                    <div className="text-gray-500">No restock alerts.</div>
                  ) : (
                    <ul className="list-disc ml-5">
                      {viewUserDetails.restockAlerts.slice(0, 5).map((alert, idx) => (
                        <li key={idx}>
                          {alert.product_name} - {alert.product_price ? `$${alert.product_price}` : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
            <div className="flex gap-2 justify-end mt-4">
              <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setViewUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white rounded shadow p-6 w-full max-w-md" onSubmit={submitEdit}>
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <label className="block mb-2">Email
              <input type="email" name="email" value={editForm.email} onChange={handleEditChange} className="border rounded px-3 py-2 w-full" required />
            </label>
            <label className="block mb-2">Full Name
              <input type="text" name="fullName" value={editForm.fullName} onChange={handleEditChange} className="border rounded px-3 py-2 w-full" />
            </label>
            <label className="block mb-4">Role
              <select name="role" value={editForm.role} onChange={handleEditChange} className="border rounded px-3 py-2 w-full">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <div className="flex gap-2 justify-end">
              <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={closeEdit} disabled={actionLoading}>Cancel</button>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={actionLoading}>Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white rounded shadow p-6 w-full max-w-md" onSubmit={submitReset}>
            <h2 className="text-xl font-bold mb-4">Reset Password</h2>
            <label className="block mb-4">New Password
              <input type="password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} className="border rounded px-3 py-2 w-full" required />
            </label>
            <div className="flex gap-2 justify-end">
              <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={closeReset} disabled={actionLoading}>Cancel</button>
              <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded" disabled={actionLoading}>Reset</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 