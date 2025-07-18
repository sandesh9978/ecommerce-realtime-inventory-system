import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const phone = localStorage.getItem("pendingPhone");

  if (!phone) {
    // No phone in localStorage, redirect back to register
    navigate("/register");
    return null;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "OTP verification failed");
        setLoading(false);
        return;
      }

      // Save auth info after successful verification
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("pendingPhone");

      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError("Server error during OTP verification");
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleVerify}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Verify OTP</h2>

        <p className="mb-4 text-center">Enter the OTP sent to <b>{phone}</b></p>

        {error && <p className="text-red-500 mb-3 text-center">{error}</p>}

        <input
          type="text"
          className="w-full p-2 border rounded mb-4 text-center tracking-widest text-xl"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          pattern="\d{6}"
          title="Enter 6 digit OTP"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
}

export default VerifyOtpPage;
