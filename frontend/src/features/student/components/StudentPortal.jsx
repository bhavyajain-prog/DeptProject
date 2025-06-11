import React from "react";
import { Link } from "react-router-dom";

export default function StudentPortal() {
  // No backend logic, just static links
  return (
    <div className="flex justify-center items-center px-4 mt-35">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">Dashboard</h2>
        <div className="flex flex-col gap-5">
          <Link
            to="/my-team"
            className="bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-md shadow text-lg font-medium"
          >
            My Team
          </Link>
          <Link
            to="/join-team"
            className="bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-md shadow text-lg font-medium"
          >
            Join Team
          </Link>
          <Link
            to="/create-team"
            className="bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-md shadow text-lg font-medium"
          >
            Create team
          </Link>
        </div>
      </div>
    </div>
  );
}
