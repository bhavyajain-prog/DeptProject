import React, { useState } from "react";
import axios from "../api/axios";

export default function AdminUpload() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [file3, setFile3] = useState(null);

  const handleFileChange = (event, setFile) => {
    setFile(event.target.files[0]);
  };

  const uploadFile = async (file, endpoint) => {
    if (!file) {
      alert("Please select a file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", endpoint);

    try {
      const response = await axios.post("/admin/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      alert(response.data.message || "File uploaded successfully.");
    } catch (error) {
      alert(
        "Error uploading file: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <div style={{ backgroundColor: "#f1f2f7" }} className="py-10">
      <div className="w-[90%] md:w-1/2 bg-white p-6 rounded-lg mx-auto mt-5 shadow-md text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Admin Uploads
        </h2>

        <div className="flex flex-col items-center gap-2 mb-8">
          <label className="text-lg font-bold text-gray-700">Student</label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setFile1)}
            className="p-2 border border-teal-300 rounded w-full max-w-sm bg-gray-50 text-sm text-gray-700 hover:border-teal-500"
          />
          <button
            onClick={() => uploadFile(file1, "student")}
            className="mt-2 px-4 py-2 bg-teal-400 hover:bg-teal-500 text-white text-sm rounded transition duration-300"
          >
            Upload Student Data
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 mb-8">
          <label className="text-lg font-bold text-gray-700">Mentor</label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setFile2)}
            className="p-2 border border-teal-300 rounded w-full max-w-sm bg-gray-50 text-sm text-gray-700 hover:border-teal-500"
          />
          <button
            onClick={() => uploadFile(file2, "mentor")}
            className="mt-2 px-4 py-2 bg-teal-400 hover:bg-teal-500 text-white text-sm rounded transition duration-300"
          >
            Upload Mentor Data
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 mb-2">
          <label className="text-lg font-bold text-gray-700">
            Project Bank
          </label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setFile3)}
            className="p-2 border border-teal-300 rounded w-full max-w-sm bg-gray-50 text-sm text-gray-700 hover:border-teal-500"
          />
          <button
            onClick={() => uploadFile(file3, "project")}
            className="mt-2 px-4 py-2 bg-teal-400 hover:bg-teal-500 text-white text-sm rounded transition duration-300"
          >
            Upload Project Bank
          </button>
        </div>
      </div>
    </div>
  );
}
