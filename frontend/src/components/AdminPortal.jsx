import React from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";

export default function AdminPortal() {
  const flushAll = async () => {
    try {
      await axios.delete("/admin/flush-all");
      alert("Data cleared successfully!");
    } catch (err) {
      alert("Error deleting the data!");
      console.log(err);
    }
  };
  return (
    <div className="bg-[#f1f2f7] flex items-center justify-center">
      {/* Admin Portal Content */}
      <div className="text-center mt-30">
        <h2 className="text-[2rem] font-semibold mb-8">Admin Portal</h2>
        <div className="space-y-8">
          <Link
            className="block bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-6 rounded shadow"
            to="/admin/upload"
          >
            Upload Data
          </Link>
          <Link
            className="block bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-6 rounded shadow"
            to="/admin/teams"
          >
            Approve Teams
          </Link>
          <Link
            className="block bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-6 rounded shadow"
            to="/admin/manage/mentors"
          >
            Manage Mentors
          </Link>
          <Link
            className="block bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-6 rounded shadow"
            to="/admin/manage/students"
          >
            Manage Students
          </Link>
          <Link
            className="block bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-6 rounded shadow"
            to="/admin/manage/teams"
          >
            Manage Teams
          </Link>
          <button
            onClick={flushAll}
            className="bg-red-500 hover:bg-[#dc2626] text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
          >
            Flush Data
          </button>
        </div>
      </div>
    </div>
  );
}
