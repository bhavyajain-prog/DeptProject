import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

function getColorFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 70%)`; // Or return a hex string
}
function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export default function MyTeam() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [code, setCode] = useState("");
  const [mentors, setMentors] = useState([]);
  const [admin, setAdmin] = useState(true);
  const [confirmed, setConfirmed] = useState(null);
  const [choice, setChoice] = useState(null);
  const [leaving, setLeaving] = useState(false);

  const handleLeaveTeam = async () => {
    if (!window.confirm("Are you sure you want to leave the team?")) return;

    try {
      setLeaving(true);
      await axios.post("/team/leave", { user });
      alert("You have left the team.");
      window.location.reload(); // or navigate to another page
    } catch (err) {
      console.error("Failed to leave team:", err);
      alert("Something went wrong while trying to leave the team.");
    } finally {
      setLeaving(false);
      navigate("/home");
    }
  };

  useEffect(() => {
    const getTeamData = async () => {
      try {
        const res = await axios.get("/team/my-team", {
          headers: { email: user.email },
        });

        setAdmin(res.data.admin);
        setTeamMembers(res.data.members);
        setCode(res.data.code);
        setConfirmed(res.data.confirmed);
        setChoice(res.data.choice);
        console.log(res.data.choice);

        let processedMentors = [];

        if (res.data.choice === -1) {
          processedMentors = res.data.mentors.map((mentor) => ({
            name: mentor.name,
            status: "Rejected",
          }));
        } else {
          processedMentors = res.data.mentors.map((mentor, i) => {
            let status = "Pending";
            if (i < res.data.choice) {
              status = "Rejected";
            } else if (i === res.data.choice) {
              status = res.data.confirmed ? "Confirmed" : "Pending";
            }
            return { name: mentor.name, status };
          });
        }

        setMentors(processedMentors);

        console.log(processedMentors);
      } catch (err) {
        console.error("Error fetching team data:", err);
      }
    };

    if (user?.email) getTeamData();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#f5f6fa] px-6 py-10">
      <h1 className="text-3xl font-semibold text-center mb-8">My Team</h1>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
        <p className="text-lg font-mono text-gray-700 bg-white px-4 py-2 rounded-lg shadow">
          Team Code: <span className="font-semibold">{code}</span>
        </p>
        <button
          onClick={handleLeaveTeam}
          disabled={leaving}
          className={`px-4 py-2 rounded-lg shadow text-white text-sm font-semibold transition ${
            leaving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {leaving ? "Leaving..." : "Leave Team"}
        </button>
      </div>

      <div className="flex flex-col gap-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-6 flex justify-between items-center hover:shadow-lg transition duration-300"
            >
              <div>
                <h2 className="text-xl font-semibold mb-2">{member.name}</h2>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Roll No:</span>{" "}
                  {member.rollNumber}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {member.email}
                </p>
              </div>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  member.name.replace(" (L)", "")
                )}&background=${hslToHex(
                  getColorFromString(member.name),
                  60,
                  70
                ).slice(1)}&color=ffffff`}
                alt={member.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-gray-300 shadow"
              />
            </div>
          ))}
        </div>

        {/* Team status and mentor preferences */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <p className="text-base font-medium text-gray-700 mb-4">
            Approved by Coordinator:{" "}
            <span className="font-semibold">{!admin ? "Yes" : "No"}</span>
          </p>

          {!admin && !confirmed && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Mentor Preferences</h2>
              {mentors.length === 0 ? (
                <p className="text-gray-600 italic">No mentors available.</p>
              ) : (
                <ul className="space-y-3">
                  {mentors.map((mentor, i) => (
                    <li
                      key={i}
                      className={`px-4 py-2 rounded-lg shadow-sm border ${
                        mentor.status === "Confirmed"
                          ? "bg-green-100 border-green-400"
                          : mentor.status === "Rejected"
                          ? "bg-red-100 border-red-400"
                          : "bg-yellow-100 border-yellow-400"
                      }`}
                    >
                      <span className="font-medium">{mentor.name}</span>:{" "}
                      <span className="italic">{mentor.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {choice === -1 && (
            <p className="text-sm mt-4 text-red-600 font-medium">
              Contact admin to get a mentor allocated to you!
            </p>
          )}
          {confirmed && (
            <p className="text-sm mt-4 text-green-700 font-medium">
              Your mentor: {confirmed.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
