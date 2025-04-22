import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="max-w-xl mx-auto mt-16 p-8 bg-white shadow-xl rounded-2xl space-y-8">
      <h2 className="text-2xl font-bold text-center text-gray-800">
        Select Your Dashboard
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/home"
          className="bg-teal-500 hover:bg-[#0f766e] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-center shadow-md"
        >
          Admin
        </Link>
        <Link
          to="/mentor/home"
          className="bg-teal-500 hover:bg-[#0f766e] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-center shadow-md"
        >
          Mentor
        </Link>
        <Link
          to="/home"
          className="bg-teal-500 hover:bg-[#0f766e] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-center shadow-md"
        >
          Student
        </Link>
      </div>

      <div className="text-center">
        <button
          onClick={() => navigate("/register")}
          className="bg-blue-500 hover:bg-[#2563eb] text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
        >
          Register
        </button>
      </div>

      <div className="text-center"></div>
    </div>
  );
}
