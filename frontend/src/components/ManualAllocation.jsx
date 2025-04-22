import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useAuth } from "./AuthContext";

export default function ManualAllocation() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [selectedMentors, setSelectedMentors] = useState({}); // { teamCode: mentorID }

  useEffect(() => {
    const fetchTeamsAndMentors = async () => {
      try {
        const mentorRes = await axios.get("/mentor/left");
        const teamRes = await axios.get("/team/left-over-teams");
        setMentors(mentorRes.data.mentors);
        setTeams(teamRes.data.teams);
      } catch (error) {
        console.error("Error fetching teams or mentors", error);
      }
    };

    if (user?.role === "admin") fetchTeamsAndMentors();
  }, [user]);
  useEffect(() => {
    console.log(mentors);
    console.log(teams);
  }, [mentors, teams]);

  const handleMentorChange = (teamCode, mentorID) => {
    setSelectedMentors((prev) => ({ ...prev, [teamCode]: mentorID }));
  };

  const handleAllocate = async (teamCode) => {
    const mentorID = selectedMentors[teamCode];
    if (!mentorID) return alert("Please select a mentor.");

    try {
      const res = await axios.post(`/admin/allocate/${teamCode}/${mentorID}`, {
        user,
      });
      alert(res.data.message);
      // Remove allocated team from UI
      setTeams((prev) => prev.filter((t) => t.code !== teamCode));
    } catch (err) {
      alert(err.response?.data?.message || "Allocation failed.");
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-[#f5f6fa]">
      <h1 className="text-3xl font-bold text-center mb-10">
        Manual Allocation of Leftover Teams
      </h1>

      {teams.length === 0 ? (
        <p className="text-center text-gray-600">No leftover teams found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {teams.map((team, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl shadow-md flex flex-col gap-4"
            >
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Team Code: {team.code}
                </h2>
                <ul className="text-sm text-gray-700 list-disc ml-4">
                  <li key={0}>
                    {team.leader.name} {" (L)"} ({team.leader.email})
                  </li>
                  {team.members.map((member, i) => (
                    <li key={i + 1}>
                      {member.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Select Mentor</label>
                <select
                  className="p-2 border rounded-lg"
                  value={selectedMentors[team.code] || ""}
                  onChange={(e) =>
                    handleMentorChange(team.code, e.target.value)
                  }
                >
                  <option value="">-- Select Mentor --</option>
                  {mentors.map((mentor) => (
                    <option key={mentor._id} value={mentor._id}>
                      {mentor.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAllocate(team.code)}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Allocate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
