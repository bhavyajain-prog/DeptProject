import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaCrown,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaProjectDiagram,
  FaIdBadge,
  FaEnvelope,
  FaSignOutAlt,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaComments,
  FaCopy,
} from "react-icons/fa";
import axios from "../../../services/axios";
import Loading from "../../../components/Loading";

// Helper function to generate avatar colors
function getColorFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 70%)`;
}

export default function MyTeam() {
  const navigate = useNavigate();
  const { user, refreshUser, loading } = useAuth();
  const [leaving, setLeaving] = useState(false);
  const [copied, setCopied] = useState(false);

  if (loading || !user || (user.role === "student" && !user.studentData)) {
    return <Loading />;
  }

  // Extract team data from user context
  const team = user?.studentData?.currentTeam;

  const handleLeaveTeam = async () => {
    if (!window.confirm("Are you sure you want to leave the team?")) return;

    try {
      setLeaving(true);
      // You'll need to implement this endpoint in the backend
      await axios.post("/common/leave-team", {}, { withCredentials: true });
      await refreshUser(); // Refresh user data
      navigate("/home");
    } catch (err) {
      console.error("Failed to leave team:", err);
      alert("Failed to leave team. Please try again.");
    } finally {
      setLeaving(false);
    }
  };

  const copyTeamCode = () => {
    navigator.clipboard.writeText(team.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If user is not a student or has no team
  if (user?.role !== "student" || !team) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-teal-50 min-h-screen py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 text-center">
            <div className="bg-yellow-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <FaExclamationTriangle className="text-3xl text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Team Found
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              You are not currently part of any team. Join an existing team or
              create a new one to get started.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => navigate("/create-team")}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Create a Team
              </button>
              <button
                onClick={() => navigate("/join-team")}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Join a Team
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (team.members?.length <= 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-teal-50 min-h-screen py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 text-center">
            <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <FaUserGraduate className="text-3xl text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Team Members Yet
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              You are the only member of this team. Share the team code below to
              invite others!
            </p>

            <div className="bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 rounded-2xl p-6 mb-8">
              <div className="text-center">
                <span className="text-sm text-teal-700 font-medium block mb-3">
                  Share this team code:
                </span>
                <div className="bg-white px-6 py-4 rounded-xl border border-teal-300 shadow-sm mb-4">
                  <span className="text-3xl font-mono font-bold text-teal-600 tracking-wider">
                    {team.code}
                  </span>
                </div>
                <button
                  onClick={copyTeamCode}
                  className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  {copied ? (
                    <>
                      <FaCheckCircle />
                      Copied!
                    </>
                  ) : (
                    <>
                      <FaCopy />
                      Copy Code
                    </>
                  )}
                </button>
                <p className="text-xs text-teal-600 mt-3">
                  Others can use this code to join your team
                </p>
              </div>
            </div>

            <button
              onClick={handleLeaveTeam}
              disabled={leaving}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              {leaving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Leaving Team...
                </>
              ) : (
                <>
                  <FaSignOutAlt />
                  Leave Team
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-teal-50 min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <header className="text-center mb-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-4">
              My Team
            </h1>
            <div className="flex justify-center items-center gap-6 flex-wrap">
              <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-sm border border-white/30">
                <span className="text-sm text-gray-600 block">Team Code:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-teal-600 text-lg">
                    {team.code}
                  </span>
                  <button
                    onClick={copyTeamCode}
                    className="text-teal-500 hover:text-teal-700 transition-colors"
                  >
                    {copied ? <FaCheckCircle /> : <FaCopy />}
                  </button>
                </div>
              </div>
              <button
                onClick={handleLeaveTeam}
                disabled={leaving}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              >
                {leaving ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Leaving...
                  </>
                ) : (
                  <>
                    <FaSignOutAlt />
                    Leave Team
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Team Members Section - Takes 3 columns */}
          <div className="xl:col-span-3 space-y-8">
            {/* Team Leader */}
            {team.leader && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="bg-yellow-100 rounded-full p-2">
                    <FaCrown className="text-yellow-600 text-xl" />
                  </div>
                  Team Leader
                </h2>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200/50 shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          team.leader.name
                        )}&background=${getColorFromString(team.leader.name)
                          .slice(4, -1)
                          .replace(/,/g, "%2C")}&color=ffffff&size=80`}
                        alt={team.leader.name}
                        className="w-20 h-20 rounded-2xl border-3 border-white shadow-lg"
                      />
                      <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 shadow-lg">
                        <FaCrown className="text-white text-sm" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {team.leader.name}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 text-gray-700">
                          <FaIdBadge className="text-gray-500" />
                          <span className="font-medium">
                            {team.leader.studentData?.rollNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                          <FaEnvelope className="text-gray-500" />
                          <span className="text-sm">{team.leader.email}</span>
                        </div>
                      </div>
                      <div className="mt-3 inline-block bg-white/60 px-4 py-2 rounded-lg text-sm text-gray-600">
                        {team.leader.studentData?.department} • Batch{" "}
                        {team.leader.studentData?.batch}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Members */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="bg-teal-100 rounded-full p-2">
                  <FaUsers className="text-teal-600 text-xl" />
                </div>
                Team Members
                <span className="text-lg font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {team.members?.length || 0} member
                  {team.members?.length > 1 ? "s" : ""}
                </span>
              </h2>

              {team.members && team.members.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {team.members.map((member, index) => (
                    <div
                      key={index}
                      className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                    >
                      <div className="flex flex-col items-center text-center">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            member.student.name
                          )}&background=${getColorFromString(
                            member.student.name
                          )
                            .slice(4, -1)
                            .replace(/,/g, "%2C")}&color=ffffff&size=64`}
                          alt={member.student.name}
                          className="w-16 h-16 rounded-2xl border-2 border-white shadow-md mb-4"
                        />
                        <h3 className="font-bold text-gray-900 mb-3 text-lg">
                          {member.student.name}
                        </h3>
                        <div className="space-y-2 w-full">
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                            <FaIdBadge className="text-gray-400" />
                            {member.student.studentData?.rollNumber}
                          </div>
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                            <FaEnvelope className="text-gray-400" />
                            <span className="truncate">
                              {member.student.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <FaUserGraduate className="text-3xl text-gray-300" />
                  </div>
                  <p className="text-lg">No other team members yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Side Panel - Takes 1 column */}
          <div className="xl:col-span-1 space-y-6">
            {/* Admin approval section */}
            {team.status === "pending" && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <div className="bg-yellow-100 rounded-full p-2">
                    <FaExclamationTriangle className="text-yellow-600" />
                  </div>
                  Admin Approval
                </h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Your team is currently awaiting approval from the admin.
                    Please check back later or contact the admin for more
                    information.
                  </p>
                </div>
              </div>
            )}

            {/* Mentor Section */}
            {team.status === "approved" && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <FaChalkboardTeacher className="text-blue-600" />
                  </div>
                  Mentor
                </h3>

                {team.mentor?.assigned ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FaCheckCircle className="text-green-500" />
                      <span className="font-semibold text-green-800">
                        Assigned
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {team.mentor.assigned.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {team.mentor.assigned.email}
                    </p>
                    <div className="bg-white/60 px-3 py-1 rounded-lg text-xs text-gray-500">
                      {team.mentor.assigned.mentorData?.department} •{" "}
                      {team.mentor.assigned.mentorData?.designation}
                    </div>
                  </div>
                ) : team.mentor?.preferences &&
                  team.mentor.preferences.length > 0 ? (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <FaClock className="text-yellow-500" />
                      <span className="font-semibold text-yellow-800">
                        Pending Assignment
                      </span>
                    </div>

                    {/* Show rejected mentors if any */}
                    {team.mentor.currentPreference > 0 && (
                      <div className="mb-6">
                        <p className="text-sm text-gray-600 font-medium mb-3">
                          Rejected Mentors:
                        </p>
                        <div className="space-y-2">
                          {team.mentor.preferences
                            .slice(0, team.mentor.currentPreference)
                            .map((mentor, index) => (
                              <div
                                key={index}
                                className="bg-red-50 border border-red-200 rounded-xl p-3"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-gray-900 text-sm">
                                    {mentor.name}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <span className="bg-red-200 text-red-800 px-2 py-1 rounded-lg text-xs font-medium">
                                      #{index + 1}
                                    </span>
                                    <FaTimes className="text-red-500 text-sm" />
                                  </div>
                                </div>
                                <div className="bg-white/60 px-2 py-1 rounded text-xs text-gray-500">
                                  {mentor.mentorData?.department} •{" "}
                                  {mentor.mentorData?.designation}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 font-medium">
                        {team.mentor.currentPreference > 0
                          ? "Remaining Preferences:"
                          : "Mentor Preferences:"}
                      </p>
                      {team.mentor.preferences
                        .slice(team.mentor.currentPreference)
                        .map((mentor, index) => {
                          const actualIndex =
                            team.mentor.currentPreference + index;
                          const isCurrentPreference =
                            actualIndex === team.mentor.currentPreference;

                          return (
                            <div
                              key={actualIndex}
                              className={`${
                                isCurrentPreference
                                  ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200"
                                  : "bg-yellow-50 border-yellow-200"
                              } border rounded-xl p-3`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900 text-sm">
                                  {mentor.name}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`${
                                      isCurrentPreference
                                        ? "bg-blue-200 text-blue-800"
                                        : "bg-yellow-200 text-yellow-800"
                                    } px-2 py-1 rounded-lg text-xs font-medium`}
                                  >
                                    #{actualIndex + 1}
                                  </span>
                                  {isCurrentPreference && (
                                    <div className="bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                                      Current
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="bg-white/60 px-2 py-1 rounded text-xs text-gray-500">
                                {mentor.mentorData?.department} •{" "}
                                {mentor.mentorData?.designation}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FaTimes className="text-2xl mx-auto mb-2 text-red-400" />
                    <p className="text-sm">No mentor assigned yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Project Section */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="bg-purple-100 rounded-full p-2">
                  <FaProjectDiagram className="text-purple-600" />
                </div>
                Project
              </h3>

              {team.finalProject ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FaCheckCircle className="text-green-500" />
                    <span className="font-semibold text-green-800">
                      Final Project
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {team.finalProject.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                    {team.finalProject.description}
                  </p>
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-lg font-medium">
                    {team.finalProject.category}
                  </span>
                </div>
              ) : team.projectChoices && team.projectChoices.length > 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FaClock className="text-yellow-500" />
                    <span className="font-semibold text-yellow-800">
                      Project Choices
                    </span>
                  </div>
                  <div className="space-y-3">
                    {team.projectChoices.map((project, index) => (
                      <div
                        key={index}
                        className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm flex-1">
                            {project.title}
                          </h4>
                          <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-lg text-xs font-medium ml-2">
                            #{index + 1}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                          {project.description}
                        </p>
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-lg font-medium">
                          {project.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaProjectDiagram className="text-2xl mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No project assigned yet</p>
                </div>
              )}
            </div>

            {/* Team Feedback */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <FaComments className="text-blue-600" />
                </div>
                Team Feedback
              </h3>

              {team.feedback && team.feedback.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {team.feedback.map((feedback, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              {feedback.byUser?.name || "System"}
                            </span>
                            <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">
                              {feedback.byUser?.role || "admin"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(feedback.at).toLocaleDateString()} at{" "}
                            {new Date(feedback.at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-gray-800 text-sm leading-relaxed">
                          {feedback.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaComments className="text-2xl mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No feedback received yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Feedback from mentors and admins will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
