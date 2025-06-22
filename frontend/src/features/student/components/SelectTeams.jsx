import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useAuth } from "./AuthContext";

export default function SelectTeams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [openTeamIndex, setOpenTeamIndex] = useState(null);

  useEffect(() => {
    const getTeams = async () => {
      try {
        const { data } = await axios.get("/mentor/left-for-review", user);
        setTeams(data.teams);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    getTeams();
  }, []);

  const toggleDetails = (index) => {
    setOpenTeamIndex(openTeamIndex === index ? null : index);
  };

  const approveTeam = async (code) => {
    try {
      await axios.post(`/mentor/team/${code}/accept`, {
        withCredentials: true,
      });
      console.log("Approved team: ", code);
      // TODO: show confirmation toast/message
    } catch (error) {
      console.error("Error connecting to the server: ", error);
    }
  };

  const rejectTeam = async (code) => {
    try {
      await axios.post(`/mentor/team/${code}/reject`, {
        withCredentials: true,
      });
      console.log("Rejected team: ", code);
      // TODO: show rejection toast/message
    } catch (error) {
      console.error("Error connecting to the server: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] px-6 py-10">
      <h1 className="text-3xl font-semibold text-center mb-8">
        Team Selection
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {teams.length === 0 ? (
          <p className="text-center text-gray-600 col-span-full">
            No teams to view
          </p>
        ) : (
          teams.map((team, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition duration-300"
            >
              <div className="mb-4">
                <h2 className="text-xl font-semibold">{team.projectTitle}</h2>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Leader:</span> {team.leader}
                </p>
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => toggleDetails(index)}
                  className="text-sm text-blue-600 hover:underline focus:outline-none"
                >
                  {openTeamIndex === index ? "Hide Details" : "View Details"}
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => approveTeam(team.code)}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md shadow"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectTeam(team.code)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow"
                  >
                    Reject
                  </button>
                </div>
              </div>

              {openTeamIndex === index && (
                <div className="mt-6 space-y-3 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Members:</span>{" "}
                    {team.members.join(", ")}
                  </p>
                  <p>
                    <span className="font-medium">Technology:</span>{" "}
                    {team.technology}
                  </p>
                  <p>
                    <span className="font-medium">Description:</span>{" "}
                    {team.description}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
