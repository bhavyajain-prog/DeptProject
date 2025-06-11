import React from "react";
import { Link } from "react-router-dom";

export default function DevPortal() {
  // List all available pages for navigation
  const pages = [
    { path: "/admin/home", label: "Admin Portal" },
    { path: "/admin/upload", label: "Admin Upload" },
    { path: "/admin/manage/teams", label: "Manual Allocation" },
    { path: "/login", label: "Login" },
    { path: "/register", label: "Register" },
    { path: "/forgot-password", label: "Forgot Password" },
    { path: "/reset-password", label: "Reset Password" },
    { path: "/home", label: "Student Portal" },
    { path: "/mentor/home", label: "Mentor Portal" },
    { path: "/create-team", label: "Create Team" },
    { path: "/join-team", label: "Join Team" },
    { path: "/my-team", label: "My Team" },
    { path: "/teams/select", label: "Select Teams" },
    { path: "/teams/view", label: "View Teams" },
    { path: "/notfound", label: "Not Found" },
  ];

  return (
    <div className="max-w-xl mx-auto mt-16 p-8 bg-white shadow-xl rounded-2xl space-y-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
        Dev Portal: All Pages
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pages.map((page) => (
          <Link
            key={page.path}
            to={page.path}
            className="bg-teal-500 hover:bg-[#0f766e] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-center shadow-md"
          >
            {page.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
