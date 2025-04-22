import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./AuthContext";

export default function ViewTeams({ mode = "admin" }) {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [actionType, setActionType] = useState(""); // 'approve' or 'reject'
  const [currentTeam, setCurrentTeam] = useState("");

  useEffect(() => {
    axios
      .get("/team/left-for-review", {
        headers: {
          "x-user": JSON.stringify(user), // stringified because headers only support strings
        },
      })
      .then((res) => setTeams(res.data.teams))
      .catch((err) => {
        if (err.response?.status === 400) {
          alert(err.response.data.message);
        } else {
          console.error(err);
        }
      });
  }, []);

  const handleFeedbackSubmit = () => {
    const payload = {
      user,
      code: currentTeam,
      feedback: feedbackText,
    };

    axios
      .put(`/team/${actionType}`, payload)
      .then((res) => {
        setShowModal(false);
        setFeedbackText("");
        setActionType("");
        setCurrentTeam("");
        // Optionally refetch teams
        setTeams((prev) => prev.filter((t) => t.code !== currentTeam));
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const filteredTeams = teams.filter((team) => {
    const fullText = `${team.leader.name} ${
      team.leader.rollNumber
    } ${team.members.map((m) => m.name).join(" ")} ${team.projectChoices
      .map((p) => p.name)
      .join(" ")}`.toLowerCase();
    return fullText.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Team Approval Panel
        </h1>

        <input
          type="text"
          placeholder="Search by name, roll number or project..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mb-6 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
        />

        {filteredTeams.length === 0 ? (
          <p className="text-center text-gray-500">No matching teams found.</p>
        ) : (
          <div className="space-y-4">
            {filteredTeams.map((team) => (
              <div key={team._id} className="bg-gray-50 rounded-xl shadow-sm">
                <div
                  onClick={() =>
                    setExpandedTeam(expandedTeam === team._id ? null : team._id)
                  }
                  className="cursor-pointer flex justify-between items-center px-4 py-3 hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      {team.leader.name}{" "}
                      <span className="font-normal text-gray-600">
                        ({team.leader.rollNumber}) ({`${team.batch}`})
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Projects:{" "}
                      {team.projectChoices.map((p, idx) => (
                        <span key={idx} className="text-gray-700 font-medium">
                          {p.name}
                          {idx !== team.projectChoices.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </p>
                  </div>
                  <div className="text-teal-500 text-sm font-medium">
                    Click to {expandedTeam === team._id ? "collapse" : "expand"}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedTeam === team._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden border-t px-4 py-4 bg-white"
                    >
                      <h3 className="text-md font-semibold text-gray-700 mb-2">
                        Team Members
                      </h3>
                      <ul className="mb-4 list-disc list-inside text-gray-700">
                        {team.members.map((member) => (
                          <li key={member._id}>
                            {member.name} ({member.rollNumber})
                          </li>
                        ))}
                      </ul>

                      <h3 className="text-md font-semibold text-gray-700 mb-2">
                        Project Details
                      </h3>
                      <div className="space-y-2 mb-4">
                        {team.projectChoices.map((project) => (
                          <div
                            key={project._id}
                            className="border rounded-lg p-3 bg-gray-50 shadow-sm"
                          >
                            <p>
                              <span className="font-semibold">Title:</span>{" "}
                              {project.name}
                            </p>
                            <p>
                              <span className="font-semibold">Tech Stack:</span>{" "}
                              {project.techStack}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Description:
                              </span>{" "}
                              {project.description}
                            </p>
                          </div>
                        ))}
                      </div>
                      {mode==="admin" && <>
                        <h3 className="text-md font-semibold text-gray-700 mb-2">
                          Mentor Preferences
                        </h3>
                        <ul className="mb-4 list-disc list-inside text-gray-700">
                          {team.mentorChoices.map((mentor) => (
                            <li key={mentor._id}>
                              {mentor.name} ({mentor.email}) -{" "}
                              {mentor.designation}
                            </li>
                          ))}
                        </ul>
                      </>}

                      <div className="flex gap-4">
                        <button
                          onClick={() => {
                            setCurrentTeam(team.code);
                            setActionType("approve");
                            setShowModal(true);
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setCurrentTeam(team.code);
                            setActionType("reject");
                            setShowModal(true);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow"
                        >
                          Reject
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">
              {actionType === "approve" ? "Approve Team" : "Reject Team"}
            </h2>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Enter your feedback here..."
              className="w-full h-32 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 mb-4"
              required
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleFeedbackSubmit}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
