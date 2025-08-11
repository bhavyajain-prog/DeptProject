import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaEdit,
  FaFileAlt,
  FaFilter,
  FaPlus,
  FaTrash,
  FaUser,
  FaTimes,
} from "react-icons/fa";

// Project Abstract Manager (Form 1)
const ProjectAbstractManager = () => {
  // state
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTrack, setFilterTrack] = useState("all");

  // mock data for demo (local state only)
  const mockProjects = [
    {
      _id: "1",
      projectTrack: "R&D",
      tools: [
        {
          name: "React",
          version: "18.0",
          type: "Frontend Framework",
          purpose: "UI Development",
        },
        {
          name: "Node.js",
          version: "16.0",
          type: "Runtime",
          purpose: "Backend Development",
        },
      ],
      modules: [
        {
          name: "Authentication",
          functionality: "User login and registration",
        },
        { name: "Dashboard", functionality: "Main application interface" },
      ],
      submittedAt: new Date("2024-01-15"),
      submittedBy: { _id: "user1", name: "John Doe" },
      status: "submitted",
      mentorApproval: false,
      adminApproval: false,
    },
    {
      _id: "2",
      projectTrack: "Startup",
      tools: [
        {
          name: "Python",
          version: "3.9",
          type: "Language",
          purpose: "Data Processing",
        },
      ],
      modules: [
        {
          name: "Data Analytics",
          functionality: "Process and analyze user data",
        },
      ],
      submittedAt: new Date("2024-01-10"),
      submittedBy: { _id: "user2", name: "Jane Smith" },
      status: "mentor_approved",
      mentorApproval: true,
      adminApproval: false,
    },
  ];

  useEffect(() => {
    setProjects(mockProjects);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialFormState = {
    projectTrack: "",
    tools: [{ name: "", version: "", type: "", purpose: "" }],
    modules: [{ name: "", functionality: "" }],
    status: "draft",
  };

  const [formData, setFormData] = useState(initialFormState);

  const projectTracks = [
    "R&D",
    "Consultancy",
    "Startup",
    "Project Pool",
    "Hardware",
  ];
  const statusOptions = [
    "draft",
    "submitted",
    "mentor_approved",
    "admin_approved",
    "rejected",
  ];

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800 border-gray-200",
      submitted: "bg-blue-100 text-blue-800 border-blue-200",
      mentor_approved: "bg-yellow-100 text-yellow-800 border-yellow-200",
      admin_approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || colors.draft;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "admin_approved":
        return <FaCheck className="w-4 h-4" />;
      case "rejected":
        return <FaTimes className="w-4 h-4" />;
      case "submitted":
      case "mentor_approved":
        return <FaClock className="w-4 h-4" />;
      default:
        return <FaFileAlt className="w-4 h-4" />;
    }
  };

  // handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToolChange = (index, field, value) => {
    const newTools = [...formData.tools];
    newTools[index][field] = value;
    setFormData((prev) => ({ ...prev, tools: newTools }));
  };

  const handleModuleChange = (index, field, value) => {
    const newModules = [...formData.modules];
    newModules[index][field] = value;
    setFormData((prev) => ({ ...prev, modules: newModules }));
  };

  const addTool = () => {
    setFormData((prev) => ({
      ...prev,
      tools: [...prev.tools, { name: "", version: "", type: "", purpose: "" }],
    }));
  };

  const removeTool = (index) => {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.filter((_, i) => i !== index),
    }));
  };

  const addModule = () => {
    setFormData((prev) => ({
      ...prev,
      modules: [...prev.modules, { name: "", functionality: "" }],
    }));
  };

  const removeModule = (index) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    // basic validation
    if (!formData.projectTrack) {
      alert("Please select a project track");
      return;
    }

    const hasValidTool = formData.tools.some((tool) => tool.name.trim());
    const hasValidModule = formData.modules.some((module) =>
      module.name.trim()
    );

    if (!hasValidTool) {
      alert("Please add at least one tool with a name");
      return;
    }

    if (!hasValidModule) {
      alert("Please add at least one module with a name");
      return;
    }

    if (editingProject) {
      setProjects((prev) =>
        prev.map((p) =>
          p._id === editingProject._id
            ? { ...p, ...formData, submittedAt: new Date() }
            : p
        )
      );
    } else {
      const newProject = {
        ...formData,
        _id: Date.now().toString(),
        submittedAt: new Date(),
        submittedBy: { _id: "currentUser", name: "Current User" },
        mentorApproval: false,
        adminApproval: false,
      };
      setProjects((prev) => [...prev, newProject]);
    }

    setFormData(initialFormState);
    setShowForm(false);
    setEditingProject(null);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      projectTrack: project.projectTrack,
      tools: project.tools,
      modules: project.modules,
      status: project.status,
    });
    setShowForm(true);
  };

  const handleDelete = (projectId) => {
    setProjects((prev) => prev.filter((p) => p._id !== projectId));
  };

  const filteredProjects = projects.filter((project) => {
    const statusMatch =
      filterStatus === "all" || project.status === filterStatus;
    const trackMatch =
      filterTrack === "all" || project.projectTrack === filterTrack;
    return statusMatch && trackMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Project Abstract Management
          </h1>
          <p className="text-gray-700">
            Manage and track project abstracts across different tracks and
            stages
          </p>
        </div>

        {!showForm ? (
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <button
                onClick={() => setShowForm(true)}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaPlus className="w-4 h-4" />
                New Project Abstract
              </button>

              {/* Filters */}
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <FaFilter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">All Status</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.replace("_", " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  value={filterTrack}
                  onChange={(e) => setFilterTrack(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Tracks</option>
                  {projectTracks.map((track) => (
                    <option key={track} value={track}>
                      {track}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-medium">
                      {project.projectTrack}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <FaEdit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(project._id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <FaTrash className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border mb-4 ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {getStatusIcon(project.status)}
                    {project.status.replace("_", " ").toUpperCase()}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">
                        Tools ({project.tools.length})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {project.tools.slice(0, 3).map((tool, idx) => (
                          <span
                            key={idx}
                            className="bg-teal-50 text-teal-700 px-2 py-1 rounded text-xs"
                          >
                            {tool.name}
                          </span>
                        ))}
                        {project.tools.length > 3 && (
                          <span className="text-gray-500 text-xs">
                            + {project.tools.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">
                        Modules ({project.modules.length})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {project.modules.slice(0, 2).map((module, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-50 text-slate-700 px-2 py-1 rounded text-xs"
                          >
                            {module.name}
                          </span>
                        ))}
                        {project.modules.length > 2 && (
                          <span className="text-gray-500 text-xs">
                            + {project.modules.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <FaUser className="w-3 h-3" />
                        {project.submittedBy.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt className="w-3 h-3" />
                        {project.submittedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <FaFileAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  No projects found
                </h3>
                <p className="text-gray-500">
                  Create your first project abstract to get started.
                </p>
              </div>
            )}
          </div>
        ) : (
          // Form
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingProject
                  ? "Edit Project Abstract"
                  : "Create New Project Abstract"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingProject(null);
                  setFormData(initialFormState);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Project Track */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Track *
                </label>
                <select
                  name="projectTrack"
                  value={formData.projectTrack}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select project track</option>
                  {projectTracks.map((track) => (
                    <option key={track} value={track}>
                      {track}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tools Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Tools
                  </label>
                  <button
                    type="button"
                    onClick={addTool}
                    className="bg-teal-100 hover:bg-teal-200 text-teal-800 px-3 py-1 rounded text-sm flex items-center gap-1"
                  >
                    <FaPlus className="w-3 h-3" />
                    Add Tool
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.tools.map((tool, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border border-gray-200 rounded-lg"
                    >
                      <input
                        type="text"
                        placeholder="Tool name *"
                        value={tool.name}
                        onChange={(e) =>
                          handleToolChange(index, "name", e.target.value)
                        }
                        required
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <input
                        type="text"
                        placeholder="Version"
                        value={tool.version}
                        onChange={(e) =>
                          handleToolChange(index, "version", e.target.value)
                        }
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <input
                        type="text"
                        placeholder="Type"
                        value={tool.type}
                        onChange={(e) =>
                          handleToolChange(index, "type", e.target.value)
                        }
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Purpose"
                          value={tool.purpose}
                          onChange={(e) =>
                            handleToolChange(index, "purpose", e.target.value)
                          }
                          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        {formData.tools.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTool(index)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modules Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Modules
                  </label>
                  <button
                    type="button"
                    onClick={addModule}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1 rounded text-sm flex items-center gap-1"
                  >
                    <FaPlus className="w-3 h-3" />
                    Add Module
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.modules.map((module, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border border-gray-200 rounded-lg"
                    >
                      <input
                        type="text"
                        placeholder="Module name *"
                        value={module.name}
                        onChange={(e) =>
                          handleModuleChange(index, "name", e.target.value)
                        }
                        required
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Functionality"
                          value={module.functionality}
                          onChange={(e) =>
                            handleModuleChange(
                              index,
                              "functionality",
                              e.target.value
                            )
                          }
                          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        {formData.modules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeModule(index)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  {editingProject ? "Update Abstract" : "Create Abstract"}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingProject(null);
                    setFormData(initialFormState);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectAbstractManager;
// Form 1 code
