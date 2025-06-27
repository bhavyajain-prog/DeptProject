import React, { useState, useEffect, useCallback } from "react";
import axios from "../../../services/axios";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaInfoCircle,
  FaCalendarAlt,
  FaFilter,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaUserShield,
  FaUserGraduate,
  FaProjectDiagram,
  FaUsers,
} from "react-icons/fa";

// Reusable Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
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

// Project Card Component
const ProjectCard = ({ project, onAction }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusClass = (isApproved) =>
    isApproved
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";

  const getProposerIcon = (role) => {
    if (role === "admin")
      return (
        <FaUserShield className="inline mr-1 text-blue-600" title="Admin" />
      );
    return (
      <FaUserGraduate
        className="inline mr-1 text-purple-600"
        title="Mentor/Student"
      />
    );
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 transition-all duration-300 ease-in-out">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-teal-700">{project.title}</h2>
          <p className="text-sm text-gray-600">Category: {project.category}</p>
        </div>
        <span
          className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(
            project.isApproved
          )} mt-2 sm:mt-0`}
        >
          {project.isApproved ? "Approved" : "Pending"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
        <p>
          {getProposerIcon(project.proposedBy?.role)}
          Proposed by: {project.proposedBy?.name || "N/A"}
        </p>
        <p>
          <FaUsers className="inline mr-2 text-teal-600" />
          Assigned Teams: {project.assignedTeams?.length || 0} /{" "}
          {project.maxTeams}
        </p>
        <p>
          <FaProjectDiagram className="inline mr-2 text-teal-600" />
          Active:{" "}
          {project.isActive ? (
            <FaCheckCircle className="text-green-500 inline" />
          ) : (
            <FaTimesCircle className="text-red-500 inline" />
          )}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
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
          onClick={() => onAction("edit", project)}
          className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaEdit className="mr-2" /> Edit
        </button>
        {!project.isApproved && (
          <>
            <button
              onClick={() => onAction("approve", project)}
              className="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaCheckCircle className="mr-2" /> Approve
            </button>
            <button
              onClick={() => onAction("reject", project)}
              className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaTimesCircle className="mr-2" /> Reject
            </button>
            <button
              onClick={() => onAction("schedule", project)}
              className="text-sm bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaCalendarAlt className="mr-2" /> Schedule Discussion
            </button>
          </>
        )}
        <button
          onClick={() => onAction("delete", project)}
          className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaTrash className="mr-2" /> Delete
        </button>
      </div>

      {isExpanded && (
        <div className="mt-6 border-t pt-4 text-sm text-gray-700 space-y-2">
          <h4 className="text-md font-semibold text-gray-800 mb-2">
            Full Details:
          </h4>
          <p>
            <strong>Description:</strong> {project.description}
          </p>
          <p>
            <strong>Project ID:</strong> {project._id}
          </p>
          {project.approvedBy && (
            <p>
              <strong>Approved by:</strong> {project.approvedBy.name}
            </p>
          )}
          <div>
            <strong>Feedback History:</strong>
            {project.feedback?.length > 0 ? (
              <ul className="list-none ml-4 mt-2 space-y-2">
                {project.feedback.map((fb, index) => (
                  <li
                    key={index}
                    className="p-2 border-l-2 border-gray-200 bg-gray-50 rounded-r-md"
                  >
                    <p>"{fb.message}"</p>
                    <p className="text-xs text-gray-500 mt-1">
                      - {fb.byUser?.name || "System"} on{" "}
                      {new Date(fb.at).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="ml-2 italic">No feedback yet.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Component
export default function ManageProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filters
  const [approvalFilter, setApprovalFilter] = useState("all"); // all, approved, pending
  const [proposerFilter, setProposerFilter] = useState("all"); // all, admin, other
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // 'add', 'edit', 'delete', 'approve', 'reject', 'schedule'
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/admin/projects");
      setProjects(response.data.projects || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch projects.");
      console.error("Fetch projects error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const categories = [
    ...new Set(projects.map((p) => p.category).filter(Boolean)),
  ];

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesApproval =
      approvalFilter === "all" ||
      (approvalFilter === "approved" ? p.isApproved : !p.isApproved);

    const matchesProposer =
      proposerFilter === "all" || p.proposedBy?.role === proposerFilter;

    const matchesCategory =
      categoryFilter === "all" || p.category === categoryFilter;

    return (
      matchesSearch && matchesApproval && matchesProposer && matchesCategory
    );
  });

  const handleOpenModal = (type, project = null) => {
    setModalType(type);
    setSelectedProject(project);
    setActionMessage("");
    if (type === "add") {
      setFormData({
        title: "",
        description: "",
        category: "",
        maxTeams: 1,
        isActive: false,
      });
    } else if (type === "edit" && project) {
      setFormData({ ...project });
    } else {
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
    setModalType("");
    setFormData({});
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionMessage("");

    const endpoint =
      modalType === "add"
        ? "/admin/projects"
        : `/admin/projects/${selectedProject._id}`;
    const method = modalType === "add" ? "post" : "put";

    try {
      await axios[method](endpoint, formData);
      setActionMessage(
        `Project ${modalType === "add" ? "added" : "updated"} successfully.`
      );
      fetchProjects();
      setTimeout(handleCloseModal, 1500);
    } catch (err) {
      setActionMessage(
        err.response?.data?.message || `Failed to ${modalType} project.`
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (type, project) => {
    if (["edit", "add"].includes(type)) {
      handleOpenModal(type, project);
      return;
    }
    handleOpenModal(type, project);
  };

  const handleConfirmAction = async () => {
    if (!selectedProject) return;
    setActionLoading(true);
    setActionMessage("");
    let endpoint = "";
    let successMessage = "";

    try {
      switch (modalType) {
        case "delete":
          endpoint = `/admin/projects/${selectedProject._id}`;
          await axios.delete(endpoint);
          successMessage = "Project deleted successfully.";
          break;
        case "approve":
          endpoint = `/admin/approve-projects/${selectedProject._id}`;
          await axios.post(endpoint, { feedback: formData.feedback });
          successMessage = "Project approved successfully.";
          break;
        case "reject":
          endpoint = `/admin/reject-projects/${selectedProject._id}`;
          if (!formData.feedback) {
            setActionMessage("Feedback is required for rejection.");
            setActionLoading(false);
            return;
          }
          await axios.post(endpoint, { feedback: formData.feedback });
          successMessage = "Project rejected successfully.";
          break;
        case "schedule":
          endpoint = `/admin/schedule-project-discussion`;
          if (!formData.discussionDate) {
            setActionMessage("Discussion date is required.");
            setActionLoading(false);
            return;
          }
          await axios.post(endpoint, {
            projectId: selectedProject._id,
            date: formData.discussionDate,
            notes: formData.notes,
          });
          successMessage = "Discussion scheduled successfully.";
          break;
        default:
          throw new Error("Invalid action type");
      }
      setActionMessage(successMessage);
      fetchProjects();
      setTimeout(handleCloseModal, 1500);
    } catch (err) {
      setActionMessage(err.response?.data?.message || `Action failed.`);
    } finally {
      setActionLoading(false);
    }
  };

  const renderModalContent = () => {
    switch (modalType) {
      case "add":
      case "edit":
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="title"
              value={formData.title || ""}
              onChange={handleFormChange}
              placeholder="Title"
              className="w-full p-2 border rounded"
              required
            />
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleFormChange}
              placeholder="Description"
              className="w-full p-2 border rounded h-24"
              required
            />
            <input
              name="category"
              value={formData.category || ""}
              onChange={handleFormChange}
              placeholder="Category"
              className="w-full p-2 border rounded"
              required
            />
            <div className="flex items-center gap-4">
              <label>Max Teams:</label>
              <input
                name="maxTeams"
                type="number"
                min="1"
                value={formData.maxTeams || 1}
                onChange={handleFormChange}
                className="p-2 border rounded w-24"
              />
            </div>
            {actionMessage && (
              <p className="text-sm text-red-600">{actionMessage}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-teal-600 text-white rounded disabled:bg-gray-400"
              >
                {actionLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : modalType === "add" ? (
                  "Add Project"
                ) : (
                  "Update Project"
                )}
              </button>
            </div>
          </form>
        );
      case "delete":
        return (
          <div>
            <p>
              Are you sure you want to delete the project "
              {selectedProject?.title}"?
            </p>
            {actionMessage && (
              <p className="text-sm text-red-600 mt-2">{actionMessage}</p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded disabled:bg-gray-400"
              >
                {actionLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        );
      case "approve":
      case "reject":
        return (
          <div>
            <p>
              Are you sure you want to {modalType} the project "
              {selectedProject?.title}"?
            </p>
            <textarea
              name="feedback"
              onChange={handleFormChange}
              placeholder={`Feedback (${
                modalType === "reject" ? "required" : "optional"
              })`}
              className="w-full p-2 border rounded mt-2 h-20"
            />
            {actionMessage && (
              <p className="text-sm text-red-600 mt-2">{actionMessage}</p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className={`px-4 py-2 text-white rounded disabled:bg-gray-400 ${
                  modalType === "approve" ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {actionLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  modalType.charAt(0).toUpperCase() + modalType.slice(1)
                )}
              </button>
            </div>
          </div>
        );
      case "schedule":
        return (
          <div>
            <p>Schedule discussion for "{selectedProject?.title}"</p>
            <div className="space-y-4 mt-4">
              <input
                name="discussionDate"
                type="datetime-local"
                onChange={handleFormChange}
                className="w-full p-2 border rounded"
              />
              <textarea
                name="notes"
                onChange={handleFormChange}
                placeholder="Discussion notes (optional)"
                className="w-full p-2 border rounded h-20"
              />
            </div>
            {actionMessage && (
              <p className="text-sm text-red-600 mt-2">{actionMessage}</p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded disabled:bg-gray-400"
              >
                {actionLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  "Schedule"
                )}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <FaSpinner className="animate-spin text-4xl text-teal-600" />
        <p className="ml-3 text-lg text-gray-700">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <FaInfoCircle className="text-4xl text-red-500 mb-4" />
        <p className="text-lg text-red-600 text-center">{error}</p>
        <button
          onClick={fetchProjects}
          className="mt-6 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded shadow transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Projects</h1>
        <button
          onClick={() => handleOpenModal("add")}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
        >
          <FaPlus className="mr-2" /> Add New Project
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border rounded-md lg:col-span-4"
          />
          {/* Approval Filter */}
          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="all">All Approval Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
          {/* Proposer Filter */}
          <select
            value={proposerFilter}
            onChange={(e) => setProposerFilter(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="all">All Proposers</option>
            <option value="admin">Admin</option>
            <option value="other">Mentor/Student</option>
          </select>
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="space-y-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onAction={handleAction}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <FaInfoCircle className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-lg text-gray-600">
            No projects found matching your criteria.
          </p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          modalType.charAt(0).toUpperCase() + modalType.slice(1) + " Project"
        }
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
}
