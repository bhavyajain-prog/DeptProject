import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import axios from "../../../services/axios";
import { FaCopy, FaSpinner, FaCheckCircle, FaInfoCircle } from "react-icons/fa";

// Custom styles for react-select
const selectStyles = {
  control: (provided) => ({
    ...provided,
    borderColor: "#d1d5db",
    "&:hover": {
      borderColor: "#5eead4", // teal-300
    },
    boxShadow: "none",
    borderRadius: '0.5rem',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#14b8a6" // teal-500
      : state.isFocused
      ? "#f0fdfa" // teal-50
      : "white",
    color: state.isSelected ? "white" : "#1f2937",
  }),
};

export default function CreateTeam() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedMentors, setSelectedMentors] = useState([null, null, null]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamCreated, setTeamCreated] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectRes, mentorRes] = await Promise.all([
        axios.get("/common/project-bank"),
        axios.get("/common/mentors"),
      ]);
      setProjects(projectRes.data || []);
      setMentors(
        mentorRes.data.map((m) => ({
          value: m._id,
          label: `${m.name} (${m.email})`,
        })) || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load required data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProjectSelect = (projectId) => {
    setSelectedProjects((prev) => {
      if (prev.includes(projectId)) {
        return prev.filter((id) => id !== projectId);
      } else {
        if (prev.length < 2) {
          return [...prev, projectId];
        }
        return prev; // Max 2 projects
      }
    });
  };

  const handleMentorSelect = (selectedOption, index) => {
    const newSelectedMentors = [...selectedMentors];
    newSelectedMentors[index] = selectedOption;
    setSelectedMentors(newSelectedMentors);
  };

  const getAvailableMentors = (currentIndex) => {
    const selectedMentorIds = selectedMentors
      .map((m, i) => (m && i !== currentIndex ? m.value : null))
      .filter(Boolean);
    return mentors.filter((m) => !selectedMentorIds.includes(m.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedProjects.length === 0) {
      alert("Please select at least one project.");
      return;
    }
    if (selectedMentors.some((m) => m === null)) {
      alert("Please select three mentors.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      projectChoices: selectedProjects,
      mentorChoices: selectedMentors.map((m) => m.value),
    };

    try {
      const response = await axios.post("/common/create-team", payload);
      setTeamCreated(response.data.team);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create team.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(teamCreated.team.teamCode);
    alert("Team code copied to clipboard!");
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <FaSpinner className="animate-spin text-4xl text-teal-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center items-center text-center p-4">
        <FaInfoCircle className="text-4xl text-red-500 mb-4" />
        <p className="text-lg text-red-600">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 bg-teal-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (teamCreated) {
    return (
      <div className="bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg text-center">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Team Created Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your team is ready. Share this code with your members to let them
            join.
          </p>
          <div className="mb-6">
            <p className="text-lg font-semibold text-gray-700">Your Team Code:</p>
            <div className="mt-2 flex items-center justify-center gap-2 bg-teal-50 p-4 rounded-lg border-2 border-dashed border-teal-200">
              <span className="text-3xl font-mono font-bold text-teal-600 tracking-widest">
                {teamCreated.team.teamCode}
              </span>
              <button
                onClick={copyToClipboard}
                className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-100 rounded-full transition"
              >
                <FaCopy className="text-xl" />
              </button>
            </div>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 transition-transform transform hover:-translate-y-1 shadow-md"
          >
            Go to My Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Create Your Project Team
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Choose your projects and preferred mentors to get started.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-lg space-y-10"
        >
          {/* Project Selection */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
              1. Select Projects (1 or 2)
            </h2>
            <input
              type="text"
              placeholder="Search projects by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400"
            />
            <div className="max-h-80 overflow-y-auto p-3 bg-gray-50 rounded-lg border space-y-3">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <div
                    key={project._id}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${selectedProjects.includes(project._id)
                        ? "bg-teal-100 border-2 border-teal-400 shadow-md"
                        : "bg-white border border-gray-200 hover:bg-teal-50"
                      }`}
                    onClick={() => handleProjectSelect(project._id)}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        readOnly
                        checked={selectedProjects.includes(project._id)}
                        className="h-5 w-5 text-teal-500 border-gray-300 rounded focus:ring-teal-400 mr-4"
                      />
                      <div>
                        <h4 className="font-bold text-gray-800">
                          {project.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {project.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Category: {project.category}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No projects found.
                </p>
              )}
            </div>
          </div>

          {/* Mentor Selection */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
              2. Select Mentors (3 choices)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[0, 1, 2].map((index) => (
                <div key={index}>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Choice {index + 1}
                  </label>
                  <Select
                    value={selectedMentors[index]}
                    options={getAvailableMentors(index)}
                    onChange={(option) => handleMentorSelect(option, index)}
                    styles={selectStyles}
                    placeholder="Select a mentor..."
                    isClearable
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submission */}
          <div className="pt-6 border-t text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto bg-teal-500 text-white font-bold py-3 px-12 rounded-lg hover:bg-teal-600 transition-transform transform hover:-translate-y-1 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <FaSpinner className="animate-spin inline-block" />
              ) : (
                "Create Team & Get Code"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
