import React, { useState } from "react";
import axios from "../../../services/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await axios.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "Password reset email sent successfully!");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f1f2f7] py-8 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:bg-gray-400"
          >
            {loading ? "Sending..." : "Submit"}
          </button>
        </form>

        {message && (
          <p className="text-green-600 font-medium text-center mt-4 bg-green-100 p-3 rounded-md">
            {message}
          </p>
        )}
        {error && (
          <p className="text-red-600 font-medium text-center mt-4 bg-red-100 p-3 rounded-md">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
