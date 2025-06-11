import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../../services/axios";
import { useAuth } from "../../../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    try {
      const res = await axios.post(
        "/auth/login",
        { username, password, rememberMe },
        { withCredentials: true }
      );
      console.log("Login response:", res.data); // Log the response for debugging
      
      if (res.data.user) {
        setUser(res.data.user);

        // Redirect based on role immediately
        switch (res.data.user.role) {
          case "student":
            navigate("/home");
            break;
          case "mentor":
            navigate("/mentor/home");
            break;
          case "sub-admin": // Added sub-admin role
          case "admin":
            navigate("/admin/home");
            break;
          case "dev":
            navigate("/dev");
            break;
          default:
            navigate("/login"); // Fallback, though ideally should not happen
        }
      } else {
        // Handle cases where user is not returned but no error is thrown (e.g. invalid credentials but backend sends 200 OK)
        setError(
          res.data.message || "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      // console.error("Login failed", err); // Optional: for debugging
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Login failed. An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center px-4 mt-30">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Sign In
        </h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={username} // Bind value to username state
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password} // Bind value to password state
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <div className="flex items-center justify-between text-sm text-gray-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-teal-500 border-gray-300 rounded focus:ring-teal-200"
              />
              Remember Me
            </label>
            <Link
              to="/forgot-password"
              className="text-teal-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
