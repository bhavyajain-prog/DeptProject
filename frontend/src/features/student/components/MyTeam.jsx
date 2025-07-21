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

  // If user is not a student or has no team
  if (user?.role !== "student" || !team) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg text-center">
          <FaExclamationTriangle className="text-6xl text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Team Found
          </h2>
          <p className="text-gray-600 mb-6">
            You are not currently part of any team.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/create-team")}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Create a Team
            </button>
            <button
              onClick={() => navigate("/join-team")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Join a Team
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (team.members?.length <= 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg text-center">
          <FaUserGraduate className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Team Members Yet
          </h2>
          <p className="text-gray-600 mb-6">
            You are the only member of this team. Invite others to join!
          </p>

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
            <div className="text-center">
              <span className="text-sm text-teal-700 font-medium">
                Share this team code:
              </span>
              <div className="mt-2 bg-white px-4 py-3 rounded-lg border border-teal-300 shadow-sm">
                <span className="text-2xl font-mono font-bold text-teal-600 tracking-wider">
                  {team.code}
                </span>
              </div>
              <p className="text-xs text-teal-600 mt-2">
                Others can use this code to join your team
              </p>
            </div>
          </div>

          <button
            onClick={handleLeaveTeam}
            disabled={leaving}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
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
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Team</h1>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
              <span className="text-sm text-gray-600">Team Code:</span>
              <span className="ml-2 font-mono font-bold text-teal-600">
                {team.code}
              </span>
            </div>
            <button
              onClick={handleLeaveTeam}
              disabled={leaving}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
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
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Members Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team Leader */}
            {team.leader && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaCrown className="text-yellow-500" />
                  Team Leader
                </h2>
                <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      team.leader.name
                    )}&background=${getColorFromString(team.leader.name)
                      .slice(4, -1)
                      .replace(/,/g, "%2C")}&color=ffffff&size=64`}
                    alt={team.leader.name}
                    className="w-16 h-16 rounded-full border-2 border-yellow-300"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {team.leader.name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaIdBadge className="text-gray-400" />
                        {team.leader.studentData?.rollNumber}
                      </div>
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-gray-400" />
                        {team.leader.email}
                      </div>
                      <div className="text-xs text-gray-500">
                        {team.leader.studentData?.department} • Batch{" "}
                        {team.leader.studentData?.batch}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Members */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaUsers className="text-teal-500" />
                Team Members
                <span className="text-sm font-normal text-gray-500">
                  ({team.members?.length || 0} member
                  {team.members?.length > 1 && "s"})
                </span>
              </h2>

              {team.members && team.members.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {team.members.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          member.student.name
                        )}&background=${getColorFromString(member.student.name)
                          .slice(4, -1)
                          .replace(/,/g, "%2C")}&color=ffffff&size=56`}
                        alt={member.student.name}
                        className="w-14 h-14 rounded-full border-2 border-gray-300"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {member.student.name}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <FaIdBadge className="text-gray-400" />
                            {member.student.studentData?.rollNumber}
                          </div>
                          <div className="flex items-center gap-2">
                            <FaEnvelope className="text-gray-400" />
                            {member.student.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaUserGraduate className="text-4xl mx-auto mb-3 text-gray-300" />
                  <p>No other team members yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Admin approval section */}
            {team.status === "pending" && (
              <div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaExclamationTriangle className="text-yellow-500" />
                    Admin Approval
                  </h2>
                  <p className="text-sm text-gray-600">
                    Your team is currently awaiting approval from the admin.
                    Please check back later or contact the admin for more
                    information.
                  </p>
                </div>
              </div>
            )}
            {/* Mentor Section */}
            {team.status === "approved" && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaChalkboardTeacher className="text-blue-500" />
                  Mentor
                </h2>

                {team.mentor?.assigned ? (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FaCheckCircle className="text-green-500" />
                      <span className="font-semibold text-green-800">
                        Assigned
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {team.mentor.assigned.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {team.mentor.assigned.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {team.mentor.assigned.mentorData?.department} •{" "}
                      {team.mentor.assigned.mentorData?.designation}
                    </p>
                  </div>
                ) : team.mentor?.preferences &&
                  team.mentor.preferences.length > 0 ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FaClock className="text-yellow-500" />
                      <span className="font-semibold text-yellow-800">
                        Pending Assignment
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 mb-3">
                        Mentor Preferences:
                      </p>
                      {team.mentor.preferences.map((mentor, index) => (
                        <div
                          key={index}
                          className="p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {mentor.name}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {mentor.mentorData?.department} •{" "}
                                {mentor.mentorData?.designation}
                              </p>
                            </div>
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                              #{index + 1}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <FaTimes className="text-3xl mx-auto mb-2 text-red-400" />
                    <p className="text-sm">No mentor assigned yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Project Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaProjectDiagram className="text-purple-500" />
                Project
              </h2>

              {team.finalProject ? (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCheckCircle className="text-green-500" />
                    <span className="font-semibold text-green-800">
                      Final Project
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {team.finalProject.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {team.finalProject.description}
                  </p>
                  <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                    {team.finalProject.category}
                  </span>
                </div>
              ) : team.projectChoices && team.projectChoices.length > 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FaClock className="text-yellow-500" />
                    <span className="font-semibold text-yellow-800">
                      Project Choices
                    </span>
                  </div>
                  <div className="space-y-2">
                    {team.projectChoices.map((project, index) => (
                      <div
                        key={index}
                        className="p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {project.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {project.description}
                            </p>
                            <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                              {project.category}
                            </span>
                          </div>
                          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded ml-2">
                            #{index + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <FaProjectDiagram className="text-3xl mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No project assigned yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
