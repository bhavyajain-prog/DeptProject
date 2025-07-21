import { useState } from "react";
import axios from "../../../services/axios";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaSpinner, FaCheckCircle, FaInfoCircle } from "react-icons/fa";

export default function JoinTeam() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const joinTeam = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError("Please enter a team code");
      return;
    }

    if (code.length !== 6) {
      setError("Team code must be exactly 6 characters long");
      return;
    }

    if (!/^[A-Z0-9]{6}$/.test(code)) {
      setError("Team code must contain only letters and numbers");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await axios.post(
        "/common/join-team",
        { code: code.trim().toUpperCase() },
        { withCredentials: true }
      );

      setSuccess(true);
      setTimeout(() => {
        navigate("/my-team");
      }, 1500);
    } catch (err) {
      console.error("Failed to join team:", err);
      setError(
        err.response?.data?.message || 
        "Failed to join team. Please check the team code and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase();
    // Only allow alphanumeric characters
    const filteredValue = value.replace(/[^A-Z0-9]/g, '');
    setCode(filteredValue);
    if (error) setError(""); // Clear error when user starts typing
  };

  if (success) {
    return (
      <div className="bg-gray-50 py-12">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg text-center">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Successfully Joined!
          </h2>
          <p className="text-gray-600 mb-6">
            Welcome to the team! Redirecting you to your team page...
          </p>
          <div className="flex justify-center">
            <FaSpinner className="animate-spin text-2xl text-teal-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Join a Team
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Enter the team code shared by your team leader to join their team.
          </p>
        </header>

        <form onSubmit={joinTeam} className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
          {/* Team Code Input */}
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-gray-800">
              Team Code
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter 6-character team code (e.g., ABC123)"
                value={code}
                onChange={handleCodeChange}
                maxLength={6}
                className={`w-full p-4 text-lg font-mono border rounded-lg focus:ring-2 focus:ring-teal-400 transition-colors ${
                  error 
                    ? "border-red-300 focus:border-red-400" 
                    : "border-gray-300 focus:border-teal-400"
                }`}
                disabled={loading}
                autoFocus
              />
              <FaUsers className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
              Team codes are exactly 6 characters long and contain only letters and numbers.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <FaInfoCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Joining Team...
              </>
            ) : (
              <>
                <FaUsers className="mr-2" />
                Join Team
              </>
            )}
          </button>

          {/* Additional Info */}
          <div className="mt-8 p-6 bg-teal-50 rounded-lg border border-teal-100">
            <h3 className="text-lg font-semibold text-teal-800 mb-3 flex items-center">
              <FaInfoCircle className="mr-2" />
              How to Join a Team
            </h3>
            <ul className="text-sm text-teal-700 space-y-2">
              <li>• Ask your team leader for the team code</li>
              <li>• Team codes are exactly 6 characters (letters and numbers only)</li>
              <li>• Once you join, you&apos;ll have access to your team&apos;s projects and activities</li>
              <li>• You can only be part of one team at a time</li>
            </ul>
          </div>
        </form>

        {/* Navigation Helper */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Don&apos;t have a team code?{" "}
            <button
              onClick={() => navigate("/create-team")}
              className="text-teal-600 hover:text-teal-700 font-semibold underline"
            >
              Create your own team
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
