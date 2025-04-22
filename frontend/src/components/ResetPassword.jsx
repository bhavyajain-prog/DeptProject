import React, { useState } from "react";
import axios from "../api/axios";

export default function ResetPassword() {
  const [newPass, setNewPass] = useState("");
  const [cPass, setCPass] = useState("");
  const resetPass = async () => {
    if (newPass !== cPass) {
      alert("Passwords do not match!");
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    await axios
      .post("/auth/reset-password", { token, newPassword: newPass })
      .then((res) => {
        alert(res.data.message);
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
  };
  return (
    <div className="flex items-center justify-center px-4 mt-30">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-200"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-200"
              value={cPass}
              onChange={(e) => setCPass(e.target.value)}
            />
          </div>

          <button
            onClick={resetPass}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded-md shadow"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
