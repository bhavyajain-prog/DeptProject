import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function NotFound() {
  const { user } = useAuth();

  const getDashboardRoute = () => {
    if (!user || !user.role) return "/";
    switch (user.role) {
      case "admin":
        return "/admin/home";
      case "mentor":
        return "/mentor/home";
      case "student":
        return "/home";
      default:
        return "/";
    }
  };

  const message = user ? "Home" : "Login";
  const link = getDashboardRoute();

  return (
    <div className="bg-gray-100 px-4 pt-16 pb-20 min-h-[calc(100vh-64px)]">
      <div className="max-w-screen-xl mx-auto">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-red-600 mb-4">
            404 - Page not found
          </h2>
          <p className="text-gray-700 mb-6">This page does not exist!</p>
          <Link
            to={link}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow transition duration-300"
          >
            Go Back to {message}
          </Link>
        </div>
      </div>
    </div>
  );
}
