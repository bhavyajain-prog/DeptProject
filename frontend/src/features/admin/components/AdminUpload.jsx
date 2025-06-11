import React, { useState, useRef } from "react"; // Added useRef
import axios from "../../../services/axios";
import { FaUpload, FaSpinner } from "react-icons/fa"; // Added FaSpinner

// Reusable FileInput component for better styling
const FileInput = ({ id, onChange, accept, fileSelected }) => (
  <label
    htmlFor={id}
    className={`w-full max-w-md flex flex-col items-center px-4 py-6 bg-white text-teal-600 rounded-lg shadow-md tracking-wide uppercase border border-teal-300 cursor-pointer hover:bg-teal-500 hover:text-white transition-all duration-150 ease-linear ${
      fileSelected ? "bg-teal-500" : ""
    }`}
  >
    <FaUpload className="w-8 h-8 mb-2" />
    <span className="mt-2 text-base leading-normal">
      {fileSelected ? fileSelected.name : "Select a file"}
    </span>
    <input
      id={id}
      type="file"
      className="hidden"
      accept={accept}
      onChange={onChange}
    />
  </label>
);

export default function AdminUpload() {
  const [studentFile, setStudentFile] = useState(null);
  const [mentorFile, setMentorFile] = useState(null);
  const [projectFile, setProjectFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false); // New state for loading overlay
  const [uploadingType, setUploadingType] = useState(""); // To show which type is uploading

  // Refs for file inputs to allow programmatic clearing
  const studentFileRef = useRef(null);
  const mentorFileRef = useRef(null);
  const projectFileRef = useRef(null);

  const handleFileChange = (setter, type) => (event) => {
    const file = event.target.files[0];
    if (file) {
      setter(file);
    }
    setMessage("");
    setError("");
  };

  const handleUpload = async (file, type, successMessage, fileRef) => {
    if (!file) {
      setError(`Please select a ${type} file to upload.`);
      setMessage("");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    setUploadingType(type);
    setMessage("");
    setError("");

    try {
      const response = await axios.post(`/admin/upload/${type}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage(response.data.message || successMessage);
      if (type === "students") setStudentFile(null);
      else if (type === "mentors") setMentorFile(null);
      else if (type === "projects") setProjectFile(null);

      if (fileRef.current) {
        fileRef.current.value = null; // Clear the file input
      }
    } catch (err) {
      console.error(`Error uploading ${type} data:`, err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          `Failed to upload ${type} data. Please try again.`
      );
    } finally {
      setIsUploading(false);
      setUploadingType("");
    }
  };

  const UploadSection = ({
    title,
    file,
    onFileChange,
    onUpload,
    fileType,
    fileRef,
    currentFileState,
  }) => (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full">
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 text-center">
        {title}
      </h3>
      <div className="flex flex-col items-center gap-4">
        <FileInput
          id={`${fileType}-file-input`}
          onChange={onFileChange}
          accept=".xlsx, .csv"
          fileSelected={currentFileState}
        />
        <button
          onClick={onUpload}
          disabled={!currentFileState || isUploading} // Disable if no file or already uploading
          className="mt-2 w-full max-w-md px-6 py-3 bg-teal-500 text-white text-base font-medium rounded-md hover:bg-teal-600 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isUploading && uploadingType === fileType ? (
            <>
              <FaSpinner className="animate-spin mr-2" /> Uploading...
            </>
          ) : (
            <>
              <FaUpload className="mr-2" /> Upload{" "}
              {fileType.charAt(0).toUpperCase() + fileType.slice(1)}
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-slate-100 to-sky-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Loading Overlay - covers the whole page content area */}
      {isUploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
          <FaSpinner className="animate-spin text-white text-6xl mb-4" />
          <p className="text-white text-2xl">
            Uploading {uploadingType} data...
          </p>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
            Admin Data Upload
          </h1>
          <p className="mt-4 sm:mt-5 text-lg text-gray-600 max-w-2xl mx-auto">
            Upload student, mentor, and project bank data using .xlsx or .csv
            files.
          </p>
        </header>

        {message && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 border border-green-300 rounded-lg shadow-sm text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 border border-red-300 rounded-lg shadow-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-10">
          <UploadSection
            title="Upload Student Data"
            fileType="students"
            currentFileState={studentFile}
            onFileChange={handleFileChange(setStudentFile, "students")}
            onUpload={() =>
              handleUpload(
                studentFile,
                "students",
                "Student data uploaded successfully!",
                studentFileRef
              )
            }
            fileRef={studentFileRef}
          />
          <UploadSection
            title="Upload Mentor Data"
            fileType="mentors"
            currentFileState={mentorFile}
            onFileChange={handleFileChange(setMentorFile, "mentors")}
            onUpload={() =>
              handleUpload(
                mentorFile,
                "mentors",
                "Mentor data uploaded successfully!",
                mentorFileRef
              )
            }
            fileRef={mentorFileRef}
          />
          <UploadSection
            title="Upload Project Bank Data"
            fileType="projects"
            currentFileState={projectFile}
            onFileChange={handleFileChange(setProjectFile, "projects")}
            onUpload={() =>
              handleUpload(
                projectFile,
                "projects",
                "Project bank uploaded successfully!",
                projectFileRef
              )
            }
            fileRef={projectFileRef}
          />
        </div>
      </div>
    </div>
  );
}
