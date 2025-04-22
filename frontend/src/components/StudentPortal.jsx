import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import axios from "../api/axios";

export default function StudentPortal() {
  const { user } = useAuth();
  const [linkInfo, setLinkInfo] = useState(null);

  useEffect(() => {
    const getStudent = async () => {
      if (user) {
        try {
          const { data } = await axios.get(`/student/${user.email}`);
          // console.log(data);

          if (data.teamCode) {
            setLinkInfo({ link: "/my-team", text: "My Team" });
          } else {
            setLinkInfo({ link: "/join-team", text: "Join Team" });
          }
        } catch (error) {
          console.error("Error fetching student data:", error);
        }
      }
    };

    getStudent();
  }, [user]);

  return (
    <div className="flex justify-center items-center px-4 mt-35">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">Dashboard</h2>

        {linkInfo && (
          <div className="flex flex-col gap-5">
            <Link
              to={linkInfo.link}
              className="bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-md shadow text-lg font-medium"
            >
              {linkInfo.text}
            </Link>
            {linkInfo.text === "Join Team" && (
              <Link
                to="/create-team"
                className="bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-md shadow text-lg font-medium"
              >
                Create team
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
