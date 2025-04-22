import React, { useState } from "react";
import axios from "../api/axios";

export default function ForgotPassword() {
  const [response, setResponse] = useState(false);
  const forgotPass = async () => {
    const email = document.querySelector("input[type=email]").value;
    await axios
      .post("/auth/forgot-password", { email })
      .then((res) => {
        alert(res.data.message);
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
    setResponse(true);
  };

  return (
    <div className="bg-[#f1f2f7] py-8">
      <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Forgot Password
        </h2>

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
        />

        <button
          onClick={forgotPass}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          Submit
        </button>

        {response && (
          <p className="text-green-600 font-medium text-center mt-4">
            Mail sent successfully!
          </p>
        )}
      </div>
    </div>
  );
}
