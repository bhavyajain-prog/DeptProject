// TODO: Validate manual allocation and visual of evaluation data
import React, { useState, useEffect, useCallback } from "react";
import axios from "../../../services/axios";
import {
  FaChevronDown,
  FaChevronUp,
  FaUsers,
  FaProjectDiagram,
  FaChalkboardTeacher,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaPlusCircle,
  FaPaperPlane,
  FaInfoCircle,
  FaEdit,
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

const TeamCard = ({ team, onToggleExpand, isExpanded, onOpenActionModal }) => {
  const getStatusClass = (status) => {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const leader = team.leader;
  const teamSize = team.members?.length || 0; // team.members already includes the leader if populated that way, or it's just other members. Assuming team.leader is separate.

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 transition-all duration-300 ease-in-out">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-teal-700">{team.code}</h2>
          <p className="text-sm text-gray-600">
            Leader: {leader?.name || "N/A"} (
            {leader?.studentData?.rollNumber || leader?.username || "N/A"})
          </p>
        </div>
        <span
          className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(
            team.status
          )} mt-2 sm:mt-0`}
        >
          {team.status}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
        <p>
          <strong className="text-gray-700">Department:</strong>{" "}
          {team.department || leader?.studentData?.department || "N/A"}
        </p>
        <p>
          <strong className="text-gray-700">Batch:</strong>{" "}
          {team.batch || leader?.studentData?.batch || "N/A"}
        </p>
        <p>
          <FaUsers className="inline mr-2 text-teal-600" />
          Team Size: {teamSize}
        </p>
        <p>
          <FaProjectDiagram className="inline mr-2 text-teal-600" />
          Final Project:{" "}
          {team.finalProject?.title ||
            (team.projectChoices?.length > 0
              ? `${team.projectChoices.length} choices (click details)`
              : "Not chosen")}
        </p>
        <p>
          <FaChalkboardTeacher className="inline mr-2 text-teal-600" />
          Mentor:{" "}
          {team.mentor?.assigned?.name ||
            (team.mentor?.preferences?.length > 0
              ? `${team.mentor.preferences.length} preferences`
              : "None")}
          {team.mentor?.assigned
            ? ""
            : team.mentor?.currentPreference === -1
            ? " (Needs Allocation)"
            : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={() => onToggleExpand(team._id)}
          className="text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-md flex items-center transition-colors"
        >
          {isExpanded ? (
            <FaChevronUp className="mr-2" />
          ) : (
            <FaChevronDown className="mr-2" />
          )}
          Details
        </button>
        {(team.status === "pending" || team.status === "rejected") && (
          <>
            <button
              onClick={() => onOpenActionModal(team, "approveReject")}
              className="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center transition-colors"
            >
              <FaCheckCircle className="mr-2" /> Approve/Reject
            </button>
          </>
        )}
        {team.status === "approved" &&
          !team.mentor?.assigned &&
          team.mentor?.currentPreference === -1 && (
            <button
              onClick={() => onOpenActionModal(team, "allocateMentor")}
              className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center transition-colors"
            >
              <FaPlusCircle className="mr-2" /> Allocate Mentor
            </button>
          )}
      </div>

      {isExpanded && (
        <div className="mt-6 border-t pt-4">
          <h4 className="text-md font-semibold text-gray-700 mb-3">
            Full Details:
          </h4>
          <div className="text-sm text-gray-700 space-y-2">
            {" "}
            {/* Increased base font size for this section */}
            <div>
              <strong>Leader:</strong>
              <div className="ml-4 p-2 border-l-2 border-teal-100">
                <p>
                  <strong>Name:</strong> {leader?.name || "N/A"}
                </p>
                <p>
                  <strong>Roll No:</strong>{" "}
                  {leader?.studentData?.rollNumber || leader?.username || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {leader?.email || "N/A"}
                </p>
              </div>
            </div>
            <div>
              <strong>
                Members (
                {team.members?.filter((m) => m.student?._id !== leader?._id)
                  .length || 0}{" "}
                other):
              </strong>
              {team.members?.filter((m) => m.student?._id !== leader?._id)
                .length > 0 ? (
                <ul className="list-none ml-4 space-y-2">
                  {team.members
                    .filter((m) => m.student?._id !== leader?._id)
                    .map((member) => (
                      <li
                        key={member.student?._id || member._id}
                        className="p-2 border-l-2 border-gray-200"
                      >
                        <p>
                          <strong>Name:</strong> {member.student?.name || "N/A"}
                        </p>
                        <p>
                          <strong>Roll No:</strong>{" "}
                          {member.student?.studentData?.rollNumber ||
                            member.student?.username ||
                            "N/A"}
                        </p>
                        <p>
                          <strong>Email:</strong>{" "}
                          {member.student?.email || "N/A"}
                        </p>
                      </li>
                    ))}
                </ul>
              ) : (
                <span className="ml-2 italic">No other members.</span>
              )}
            </div>
            {!team.finalProject ? (
              <div>
                <strong>Project Choices:</strong>
                {team.projectChoices?.length > 0 ? (
                  <ul className="list-none ml-4 space-y-3">
                    {team.projectChoices.map((p, index) => (
                      <li
                        key={p._id || index}
                        className="p-3 border rounded-md shadow-sm bg-slate-50"
                      >
                        <p className="font-semibold text-teal-700">
                          Choice {index + 1}: {p.title || "N/A"}
                        </p>
                        <p>
                          <strong>Category:</strong> {p.category || "N/A"}
                        </p>
                        <p className="mt-1">
                          <strong>Description:</strong> {p.description || "N/A"}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="italic">None</span>
                )}
              </div>
            ) : (
              <div className="mt-3">
                <p className="font-semibold text-lg text-green-700">
                  Final Allocated Project:
                </p>
                <div className="ml-4 p-3 border rounded-md shadow-sm bg-green-50">
                  <p className="font-semibold">
                    {team.finalProject.title || "N/A"}
                  </p>
                  <p>
                    <strong>Category:</strong>{" "}
                    {team.finalProject.category || "N/A"}
                  </p>
                  <p className="mt-1">
                    <strong>Description:</strong>{" "}
                    {team.finalProject.description || "N/A"}
                  </p>
                </div>
              </div>
            )}
            <div>
              {team.mentor?.currentPreference === -1 &&
              !team.mentor?.assigned ? (
                <div>
                  <strong className="text-red-600">Mentor Status:</strong>
                  <p className="text-red-600 font-medium ml-4">
                    Needs manual allocation by administrator
                  </p>
                </div>
              ) : team.mentor?.assigned ? (
                <div>
                  <strong>Assigned Mentor:</strong>
                  <div className="ml-4 p-2 border-l-2 border-green-200 bg-green-50">
                    <p className="font-medium text-green-700">
                      {team.mentor.assigned.name ||
                        team.mentor.assigned.username ||
                        "N/A"}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <strong>Mentor Preferences:</strong>
                  {team.mentor?.preferences?.length > 0 ? (
                    <ul className="list-disc list-inside ml-4">
                      {team.mentor.preferences.map((pref, index) => (
                        <li key={pref._id || index}>
                          {pref.name || pref.username || pref._id || "N/A"}
                          {index === team.mentor?.currentPreference && (
                            <span className="text-xs text-blue-500 ml-1">
                              (Current)
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="italic">None specified</span>
                  )}
                </div>
              )}
            </div>
            {team.evaluation && (
              <div className="mt-3">
                <p className="font-semibold text-md">Evaluation Data:</p>
                <div className="ml-4 space-y-1 text-gray-600">
                  {team.evaluation.weeklyProgress?.length > 0 && (
                    <p>
                      Average Weekly Progress:{" "}
                      {team.averageWeeklyProgress?.toFixed(2) || "N/A"}
                    </p>
                  )}
                  {team.evaluation.finalEvaluation?.score && (
                    <p>Final Score: {team.evaluation.finalEvaluation.score}</p>
                  )}
                  {(!team.evaluation.weeklyProgress ||
                    team.evaluation.weeklyProgress.length === 0) &&
                    !team.evaluation.finalEvaluation?.score && (
                      <p className="italic">No evaluation data recorded yet.</p>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ManageTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Added for search

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [mentorFilter, setMentorFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedTeamForAction, setSelectedTeamForAction] = useState(null);
  const [actionType, setActionType] = useState(""); // 'approveReject' or 'allocateMentor'
  const [feedbackText, setFeedbackText] = useState("");
  const [remainingMentors, setRemainingMentors] = useState([]);
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(""); // For success/error messages from actions

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/admin/teams");
      setTeams(response.data.teams || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch teams.");
      console.error("Fetch teams error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const fetchRemainingMentors = useCallback(async () => {
    if (actionType !== "allocateMentor") return;
    setActionLoading(true);
    try {
      const response = await axios.get("/admin/remaining-mentors");
      setRemainingMentors(response.data.mentors || []);
    } catch (err) {
      setActionMessage("Failed to fetch available mentors.");
      console.error("Fetch remaining mentors error:", err);
    } finally {
      setActionLoading(false);
    }
  }, [actionType]);

  // Get unique departments for filter dropdown
  const departments = [
    ...new Set(
      teams
        .map((team) => team.department || team.leader?.studentData?.department)
        .filter(Boolean)
    ),
  ];

  // Filtered teams based on search term and filters
  const displayTeams = teams.filter((team) => {
    // Search filter
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      team.code.toLowerCase().includes(searchTermLower) ||
      (team.leader?.name &&
        team.leader.name.toLowerCase().includes(searchTermLower)) ||
      (team.leader?.studentData?.rollNumber &&
        team.leader.studentData.rollNumber
          .toLowerCase()
          .includes(searchTermLower)) ||
      team.projectChoices?.some((p) =>
        p.title.toLowerCase().includes(searchTermLower)
      ) ||
      (team.finalProject?.title &&
        team.finalProject.title.toLowerCase().includes(searchTermLower));

    // Status filter
    const matchesStatus =
      statusFilter === "all" || team.status === statusFilter;

    // Mentor filter
    let matchesMentor = true;
    if (mentorFilter === "assigned") {
      matchesMentor = !!team.mentor?.assigned;
    } else if (mentorFilter === "not-assigned") {
      matchesMentor = !team.mentor?.assigned;
    } else if (mentorFilter === "needs-allocation") {
      matchesMentor =
        !team.mentor?.assigned && team.mentor?.currentPreference === -1;
    } else if (mentorFilter === "in-progress") {
      matchesMentor =
        !team.mentor?.assigned && team.mentor?.currentPreference !== -1;
    }

    // Project filter
    let matchesProject = true;
    if (projectFilter === "allocated") {
      matchesProject = !!team.finalProject;
    } else if (projectFilter === "not-allocated") {
      matchesProject = !team.finalProject;
    } else if (projectFilter === "has-choices") {
      matchesProject = !team.finalProject && team.projectChoices?.length > 0;
    } else if (projectFilter === "no-choices") {
      matchesProject =
        !team.finalProject &&
        (!team.projectChoices || team.projectChoices.length === 0);
    }

    // Department filter
    const teamDepartment =
      team.department || team.leader?.studentData?.department;
    const matchesDepartment =
      departmentFilter === "all" || teamDepartment === departmentFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesMentor &&
      matchesProject &&
      matchesDepartment
    );
  });

  const handleToggleExpand = (teamId) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  const handleOpenActionModal = (team, type) => {
    setSelectedTeamForAction(team);
    setActionType(type);
    setIsActionModalOpen(true);
    setFeedbackText("");
    setSelectedMentorId("");
    setActionMessage("");
    if (type === "allocateMentor") {
      fetchRemainingMentors();
    }
  };

  const handleCloseActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedTeamForAction(null);
    setActionType("");
    setFeedbackText("");
    setSelectedMentorId("");
    setRemainingMentors([]);
    setActionMessage("");
  };

  const handleApproveRejectSubmit = async (isApproved) => {
    if (!selectedTeamForAction) return;
    if (!isApproved && !feedbackText.trim()) {
      setActionMessage("Feedback is required for rejection.");
      return;
    }
    setActionLoading(true);
    setActionMessage("");
    try {
      const endpoint = isApproved
        ? `/admin/approve/${selectedTeamForAction.code}`
        : `/admin/reject/${selectedTeamForAction.code}`;
      await axios.post(endpoint, { feedback: feedbackText });
      setActionMessage(
        `Team ${selectedTeamForAction.code} ${
          isApproved ? "approved" : "rejected"
        } successfully.`
      );
      fetchTeams(); // Refresh team list
      setTimeout(() => {
        // Keep modal open for a bit to show message
        handleCloseActionModal();
      }, 2000);
    } catch (err) {
      setActionMessage(
        err.response?.data?.message ||
          `Failed to ${isApproved ? "approve" : "reject"} team.`
      );
      console.error("Approve/Reject error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAllocateMentorSubmit = async () => {
    if (!selectedTeamForAction || !selectedMentorId) {
      setActionMessage("Please select a mentor.");
      return;
    }
    setActionLoading(true);
    setActionMessage("");
    try {
      await axios.post(
        `/admin/allocate/${selectedTeamForAction.code}/${selectedMentorId}`
      );
      setActionMessage(
        `Mentor allocated to team ${selectedTeamForAction.code} successfully.`
      );
      fetchTeams(); // Refresh team list
      setTimeout(() => {
        // Keep modal open for a bit to show message
        handleCloseActionModal();
      }, 2000);
    } catch (err) {
      setActionMessage(
        err.response?.data?.message || "Failed to allocate mentor."
      );
      console.error("Allocate mentor error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <FaSpinner className="animate-spin text-4xl text-teal-600" />
        <p className="ml-3 text-lg text-gray-700">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Teams</h1>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Search teams by code, leader, project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <div className="text-sm text-gray-600 whitespace-nowrap">
            {displayTeams.length} team{displayTeams.length !== 1 ? "s" : ""}{" "}
            found
          </div>
        </div>

        {/* Filter Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Mentor Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mentor Status
            </label>
            <select
              value={mentorFilter}
              onChange={(e) => setMentorFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">All Mentors</option>
              <option value="assigned">Assigned</option>
              <option value="not-assigned">Not Assigned</option>
              <option value="needs-allocation">Needs Allocation</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>

          {/* Project Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Status
            </label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">All Projects</option>
              <option value="allocated">Allocated</option>
              <option value="not-allocated">Not Allocated</option>
              <option value="has-choices">Has Choices</option>
              <option value="no-choices">No Choices</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(searchTerm ||
          statusFilter !== "all" ||
          mentorFilter !== "all" ||
          projectFilter !== "all" ||
          departmentFilter !== "all") && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setMentorFilter("all");
                setProjectFilter("all");
                setDepartmentFilter("all");
              }}
              className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {actionMessage && (
        <div
          className={`p-4 mb-4 rounded-lg text-sm ${
            actionMessage.includes("Failed") ||
            actionMessage.includes("required")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {actionMessage}
        </div>
      )}

      {displayTeams.length > 0 ? (
        <div className="space-y-6">
          {displayTeams.map((team) => (
            <TeamCard
              key={team._id}
              team={team}
              isExpanded={expandedTeamId === team._id}
              onToggleExpand={handleToggleExpand}
              onOpenActionModal={handleOpenActionModal}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <FaInfoCircle className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-lg text-gray-600">
            No teams found matching your criteria.
          </p>
        </div>
      )}

      <Modal
        isOpen={isActionModalOpen && actionType === "approveReject"}
        onClose={handleCloseActionModal}
        title={`Approve/Reject Team: ${selectedTeamForAction?.code}`}
      >
        <div className="space-y-4">
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Provide feedback (optional for approval, required for rejection)"
            className="w-full p-2 border border-gray-300 rounded-md h-24 focus:ring-teal-500 focus:border-teal-500"
          />
          {actionMessage && (
            <p
              className={`text-sm ${
                actionMessage.includes("Failed") ||
                actionMessage.includes("required")
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {actionMessage}
            </p>
          )}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => handleApproveRejectSubmit(true)}
              disabled={actionLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center disabled:bg-gray-300"
            >
              {actionLoading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaCheckCircle className="mr-2" />
              )}{" "}
              Approve
            </button>
            <button
              onClick={() => handleApproveRejectSubmit(false)}
              disabled={actionLoading}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center disabled:bg-gray-300"
            >
              {actionLoading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaTimesCircle className="mr-2" />
              )}{" "}
              Reject
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isActionModalOpen && actionType === "allocateMentor"}
        onClose={handleCloseActionModal}
        title={`Allocate Mentor to Team: ${selectedTeamForAction?.code}`}
      >
        <div className="space-y-4">
          {actionLoading && !remainingMentors.length && (
            <p className="text-sm text-gray-600 flex items-center">
              <FaSpinner className="animate-spin mr-2" />
              Loading available mentors...
            </p>
          )}

          {remainingMentors.length > 0 ? (
            <select
              value={selectedMentorId}
              onChange={(e) => setSelectedMentorId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select a Mentor</option>
              {remainingMentors.map((mentor) => (
                <option key={mentor._id} value={mentor._id}>
                  {mentor.name} ({mentor.email}) - Teams:{" "}
                  {mentor.mentorData?.assignedTeams?.length || 0}/
                  {mentor.mentorData?.maxTeams || "N/A"}
                </option>
              ))}
            </select>
          ) : (
            !actionLoading && (
              <p className="text-sm text-yellow-600">
                No available mentors found or failed to load.
              </p>
            )
          )}

          {actionMessage && (
            <p
              className={`text-sm ${
                actionMessage.includes("Failed") ||
                actionMessage.includes("Please")
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {actionMessage}
            </p>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleAllocateMentorSubmit}
              disabled={
                actionLoading ||
                !selectedMentorId ||
                remainingMentors.length === 0
              }
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center disabled:bg-gray-300"
            >
              {actionLoading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaPaperPlane className="mr-2" />
              )}{" "}
              Allocate
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
