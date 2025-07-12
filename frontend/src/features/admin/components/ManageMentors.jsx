import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../../services/axios"; // Ensure this path is correct
import {
  FaUsers,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaUserShield,
  FaUserGraduate,
} from "react-icons/fa";

// Placeholder for a more sophisticated Modal component if needed later
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const MentorCard = ({
  mentor,
  onToggleExpand,
  isExpanded,
  onOpenActionModal,
}) => {
  const getRoleClass = (role) => {
    if (role === "sub-admin") return "bg-sky-100 text-sky-700";
    if (role === "mentor") return "bg-indigo-100 text-indigo-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 transition-all duration-300 ease-in-out">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-teal-700">{mentor.name}</h2>
          <p className="text-sm text-gray-600">{mentor.email}</p>
        </div>
        <span
          className={`px-3 py-1 text-sm font-semibold rounded-full ${getRoleClass(
            mentor.role
          )} mt-2 sm:mt-0`}
        >
          {mentor.role}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
        <p>
          <strong className="text-gray-700">Department:</strong>{" "}
          {mentor.mentorData?.department || "N/A"}
        </p>
        <p>
          <strong className="text-gray-700">Designation:</strong>{" "}
          {mentor.mentorData?.designation || "N/A"}
        </p>
        <p>
          <FaUsers className="inline mr-2 text-teal-600" />
          Max Teams:{" "}
          {mentor.mentorData?.maxTeams === undefined ||
          mentor.mentorData?.maxTeams === null
            ? "N/A"
            : mentor.mentorData.maxTeams}
        </p>
        <p>
          <FaUsers className="inline mr-2 text-teal-600" />
          Assigned Teams: {mentor.mentorData?.assignedTeams?.length || 0}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={() => onToggleExpand(mentor._id)}
          className="text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-md flex items-center transition-colors"
        >
          {isExpanded ? (
            <FaChevronUp className="mr-2" />
          ) : (
            <FaChevronDown className="mr-2" />
          )}
          Details
        </button>
        <button
          onClick={() => onOpenActionModal(mentor, "edit")}
          className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center transition-colors"
        >
          <FaEdit className="mr-2" /> Edit
        </button>
        <button
          onClick={() => onOpenActionModal(mentor, "remove")}
          className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center transition-colors"
        >
          <FaTrash className="mr-2" /> Remove
        </button>
        {mentor.role === "mentor" && (
          <button
            onClick={() => onOpenActionModal(mentor, "promote")}
            className="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center transition-colors"
          >
            <FaUserShield className="mr-2" /> Promote to Sub-Admin
          </button>
        )}
        {mentor.role === "sub-admin" && (
          <button
            onClick={() => onOpenActionModal(mentor, "demote")}
            className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md flex items-center transition-colors"
          >
            <FaUserGraduate className="mr-2" /> Demote to Mentor
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-6 border-t pt-4">
          <h4 className="text-md font-semibold text-gray-700 mb-3">
            Full Details:
          </h4>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <strong>Emp No.:</strong> {mentor.mentorData?.empNo || "N/A"}
            </p>
            <p>
              <strong>Username:</strong> {mentor.username}
            </p>
            <p>
              <strong>Phone:</strong> {mentor.phone || "N/A"}
            </p>
            <p>
              <strong>First Login:</strong>{" "}
              {mentor.firstLogin ? "Yes (Password needs reset)" : "No"}
            </p>
            <p>
              <strong>Qualifications:</strong>{" "}
              {mentor.mentorData?.qualifications?.join(", ") || "N/A"}
            </p>
            <div>
              <strong>Assigned Teams:</strong>
              {mentor.mentorData?.assignedTeams?.length > 0 ? (
                <ul className="list-disc list-inside ml-4">
                  {mentor.mentorData.assignedTeams.map((team) => (
                    <li key={team._id}>
                      {team.code || team.name || "Unknown Team"}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="italic">None</span>
              )}
            </div>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(mentor.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Updated At:</strong>{" "}
              {new Date(mentor.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ManageMentors() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedMentorId, setExpandedMentorId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedMentorForAction, setSelectedMentorForAction] = useState(null);
  const [actionType, setActionType] = useState(""); // 'add', 'edit', 'remove', 'promote', 'demote'
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ text: "", type: "" }); // type: 'success' or 'error'

  // Form state for adding/editing mentor
  const [mentorForm, setMentorForm] = useState({
    name: "",
    email: "",
    username: "", // Auto-generate from email or manual
    phone: "",
    role: "mentor", // Default role
    empNo: "",
    department: "",
    designation: "",
    qualifications: "", // Comma-separated string
    maxTeams: 3, // Default
  });

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/admin/mentors");
      setMentors(response.data.mentors || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to fetch mentors."
      );
      setMentors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  const filteredMentors = mentors.filter(
    (mentor) =>
      (mentor.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (mentor.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (mentor.mentorData?.empNo?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (mentor.mentorData?.department?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (mentor.role?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const handleToggleExpand = (mentorId) => {
    setExpandedMentorId(expandedMentorId === mentorId ? null : mentorId);
  };

  const handleOpenActionModal = (mentor, type) => {
    setActionType(type);
    setSelectedMentorForAction(mentor);
    setActionMessage({ text: "", type: "" });
    if (type === "edit" && mentor) {
      setMentorForm({
        name: mentor.name || "",
        email: mentor.email || "",
        username: mentor.username || "",
        phone: mentor.phone || "",
        role: mentor.role || "mentor",
        empNo: mentor.mentorData?.empNo || "",
        department: mentor.mentorData?.department || "",
        designation: mentor.mentorData?.designation || "",
        qualifications: mentor.mentorData?.qualifications || "",
        maxTeams:
          mentor.mentorData?.maxTeams === undefined ||
          mentor.mentorData?.maxTeams === null
            ? 3
            : mentor.mentorData.maxTeams,
      });
    } else if (type === "add") {
      setMentorForm({
        // Reset form for adding
        name: "",
        email: "",
        username: "",
        phone: "",
        role: "mentor",
        empNo: "",
        department: "",
        designation: "",
        qualifications: "",
        maxTeams: 3,
      });
    }
    setIsActionModalOpen(true);
  };

  const handleCloseActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedMentorForAction(null);
    setActionType("");
    setMentorForm({
      // Reset form
      name: "",
      email: "",
      username: "",
      phone: "",
      role: "mentor",
      empNo: "",
      department: "",
      designation: "",
      qualifications: "",
      maxTeams: 3,
    });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(
      `Form change - Name: ${name}, Value: ${value}, Type: ${type}, Checked: ${checked}`
    );
    setMentorForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value, 10)
          : value,
    }));
  };

  const handleAddMentorSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionMessage({ text: "", type: "" });
    try {
      const payload = {
        name: mentorForm.name,
        email: mentorForm.email,
        username: mentorForm.username || mentorForm.email.split("@")[0],
        phone: mentorForm.phone,
        role: "mentor", // New mentors are added with 'mentor' role. Promotion is a separate step.
        // Password will be auto-generated by the backend.
        mentorData: {
          empNo: mentorForm.empNo,
          department: mentorForm.department,
          designation: mentorForm.designation,
          qualifications: mentorForm.qualifications,
          maxTeams: parseInt(mentorForm.maxTeams, 10),
        },
      };
      await axiosInstance.post("/admin/register", payload);
      setActionMessage({
        text: "Mentor added successfully. Refreshing list...",
        type: "success",
      });
      fetchMentors(); // Refresh list
      handleCloseActionModal(); // Close modal
    } catch (err) {
      setActionMessage({
        text:
          err.response?.data?.message || err.message || "Failed to add mentor.",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditMentorSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMentorForAction) return;
    setActionLoading(true);
    setActionMessage({ text: "", type: "" });
    try {
      const payload = {
        name: mentorForm.name,
        email: mentorForm.email,
        username: mentorForm.username,
        phone: mentorForm.phone,
        role: mentorForm.role, // Role can be changed here (mentor/sub-admin)
        mentorData: {
          // Send mentorData, backend will use/update it appropriately
          empNo: mentorForm.empNo,
          department: mentorForm.department,
          designation: mentorForm.designation,
          qualifications: mentorForm.qualifications,
          maxTeams: parseInt(mentorForm.maxTeams, 10),
        },
      };
      await axiosInstance.put(
        `/admin/user/${selectedMentorForAction._id}`,
        payload
      );
      setActionMessage({
        text: "Mentor updated successfully. Refreshing list...",
        type: "success",
      });
      fetchMentors(); // Refresh list
      handleCloseActionModal(); // Close modal
    } catch (err) {
      setActionMessage({
        text:
          err.response?.data?.message ||
          err.message ||
          "Failed to update mentor.",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMentor = async () => {
    if (!selectedMentorForAction) return;
    setActionLoading(true);
    setActionMessage({ text: "", type: "" });
    try {
      await axiosInstance.delete(`/admin/user/${selectedMentorForAction._id}`);
      setActionMessage({
        text: "Mentor removed successfully. Refreshing list...",
        type: "success",
      });
      fetchMentors(); // Refresh list
      handleCloseActionModal(); // Close modal
    } catch (err) {
      setActionMessage({
        text:
          err.response?.data?.message ||
          err.message ||
          "Failed to remove mentor.",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromoteDemoteMentor = async (newRole) => {
    if (!selectedMentorForAction) return;
    setActionLoading(true);
    setActionMessage({ text: "", type: "" });
    try {
      const payload = { role: newRole };
      // The backend PUT /admin/user/:id handles mentorData and adminData consistency.
      await axiosInstance.put(
        `/admin/user/${selectedMentorForAction._id}`,
        payload
      );
      setActionMessage({
        text: `Mentor role changed to ${newRole} successfully. Refreshing list...`,
        type: "success",
      });
      fetchMentors(); // Refresh list
      handleCloseActionModal(); // Close modal
    } catch (err) {
      setActionMessage({
        text:
          err.response?.data?.message ||
          err.message ||
          "Failed to change mentor role.",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-700">Loading mentors...</p>
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 p-4 bg-red-100 border border-red-400 rounded-md text-center">
        Error: {error}
      </div>
    );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Mentors</h1>
          <button
            onClick={() => handleOpenActionModal(null, "add")}
            className="mt-4 sm:mt-0 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2 rounded-md shadow-sm flex items-center transition-colors"
          >
            <FaUserPlus className="mr-2" /> Add New Mentor
          </button>
        </div>
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search mentors (name, email, emp no, dept, role)..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {filteredMentors.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          No mentors found matching your criteria, or no mentors available.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <MentorCard
              key={mentor._id}
              mentor={mentor}
              isExpanded={expandedMentorId === mentor._id}
              onToggleExpand={handleToggleExpand}
              onOpenActionModal={handleOpenActionModal}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Mentor Modal */}
      {(actionType === "add" || actionType === "edit") && (
        <Modal
          isOpen={isActionModalOpen}
          onClose={handleCloseActionModal}
          title={actionType === "add" ? "Add New Mentor" : "Edit Mentor"}
        >
          <form
            onSubmit={
              actionType === "add"
                ? handleAddMentorSubmit
                : handleEditMentorSubmit
            }
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={mentorForm.name}
                onChange={handleFormChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={mentorForm.email}
                onChange={handleFormChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username (Optional, auto-generated if empty)
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={mentorForm.username}
                onChange={handleFormChange}
                placeholder="e.g. first.last"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={mentorForm.phone}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="empNo"
                className="block text-sm font-medium text-gray-700"
              >
                Employee Number
              </label>
              <input
                type="text"
                name="empNo"
                id="empNo"
                value={mentorForm.empNo}
                onChange={handleFormChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-700"
              >
                Department
              </label>
              <input
                type="text"
                name="department"
                id="department"
                value={mentorForm.department}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="designation"
                className="block text-sm font-medium text-gray-700"
              >
                Designation
              </label>
              <input
                type="text"
                name="designation"
                id="designation"
                value={mentorForm.designation}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="qualifications"
                className="block text-sm font-medium text-gray-700"
              >
                Qualifications (comma-separated)
              </label>
              <input
                type="text"
                name="qualifications"
                id="qualifications"
                value={mentorForm.qualifications}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="maxTeams"
                className="block text-sm font-medium text-gray-700"
              >
                Max Teams
              </label>
              <input
                type="number"
                name="maxTeams"
                id="maxTeams"
                value={mentorForm.maxTeams}
                onChange={handleFormChange}
                min="0"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            {actionType === "edit" && ( // Role change is handled by promote/demote, not direct edit here for simplicity, but can be added
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Role
                </label>
                <select
                  name="role"
                  id="role"
                  value={mentorForm.role}
                  onChange={handleFormChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                >
                  <option value="mentor">Mentor</option>
                  <option value="sub-admin">Sub-Admin</option>
                </select>
              </div>
            )}

            {actionMessage.text && (
              <p
                className={`text-sm ${
                  actionMessage.type === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {actionMessage.text}
              </p>
            )}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCloseActionModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md disabled:opacity-50"
              >
                {actionLoading
                  ? "Saving..."
                  : actionType === "add"
                  ? "Add Mentor"
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Remove Mentor Modal */}
      {actionType === "remove" && selectedMentorForAction && (
        <Modal
          isOpen={isActionModalOpen}
          onClose={handleCloseActionModal}
          title="Remove Mentor"
        >
          <p className="text-gray-700 mb-4">
            Are you sure you want to remove mentor{" "}
            <strong className="font-semibold">
              {selectedMentorForAction.name}
            </strong>{" "}
            ({selectedMentorForAction.email})?
          </p>
          <p className="text-sm text-red-600 mb-4">
            This action cannot be undone.
          </p>
          {actionMessage.text && (
            <p
              className={`text-sm mb-2 ${
                actionMessage.type === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {actionMessage.text}
            </p>
          )}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCloseActionModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleRemoveMentor}
              disabled={actionLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
            >
              {actionLoading ? "Removing..." : "Remove Mentor"}
            </button>
          </div>
        </Modal>
      )}

      {/* Promote/Demote Mentor Modal */}
      {(actionType === "promote" || actionType === "demote") &&
        selectedMentorForAction && (
          <Modal
            isOpen={isActionModalOpen}
            onClose={handleCloseActionModal}
            title={
              actionType === "promote"
                ? "Promote to Sub-Admin"
                : "Demote to Mentor"
            }
          >
            <p className="text-gray-700 mb-4">
              Are you sure you want to {actionType}{" "}
              <strong className="font-semibold">
                {selectedMentorForAction.name}
              </strong>{" "}
              ({selectedMentorForAction.email})?
            </p>
            {actionMessage.text && (
              <p
                className={`text-sm mb-2 ${
                  actionMessage.type === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {actionMessage.text}
              </p>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseActionModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handlePromoteDemoteMentor(
                    actionType === "promote" ? "sub-admin" : "mentor"
                  )
                }
                disabled={actionLoading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 ${
                  actionType === "promote"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
              >
                {actionLoading
                  ? "Processing..."
                  : actionType === "promote"
                  ? "Promote"
                  : "Demote"}
              </button>
            </div>
          </Modal>
        )}
    </div>
  );
}
