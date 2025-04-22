import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import axios from "../api/axios";
import { useAuth } from "./AuthContext";
// TODO: Field validation and change batch to dropdown for reduced false value inputs
// TODO: Later make it fetch details of curr user and hence setting up automatic filling of data
export default function CreateTeam() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [formData, setFormData] = useState({
    leader: {
      name: "",
      email: "",
      phone: "",
      rollNumber: "",
    },
    batch: "",
    project1: {
      title: "",
      description: "",
      technology: "",
    },
    project2: {
      title: "",
      description: "",
      technology: "",
    },
    mentorChoices: [null, null, null],
  });
  const [mentorOptions, setMentorOptions] = useState([]);
  const [remainingMentors, setRemainingMentors] = useState([]);

  useEffect(() => {
    const fetchCodeAndMentors = async () => {
      try {
        const codeResponse = await axios.get("/team/code");
        setCode(codeResponse.data.code);

        const mentorResponse = await axios.get("/mentor/choices");
        const mentors = mentorResponse.data.map((mentor) => ({
          label: mentor.name,
          value: mentor._id,
        }));
        setMentorOptions(mentors);
        setRemainingMentors(mentors);
      } catch (err) {
        console.log("Error fetching data:", err);
      }
    };

    fetchCodeAndMentors();
  }, []);

  const handleChange = (e, field, index = null) => {
    if (field === "mentorChoices") {
      const updatedMentors = [...formData.mentorChoices];
      updatedMentors[index] = e;
      setFormData({ ...formData, mentorChoices: updatedMentors });

      const selectedIds = updatedMentors.filter(Boolean).map((m) => m.value);

      const filtered = mentorOptions.filter(
        (mentor) => !selectedIds.includes(mentor.value)
      );
      setRemainingMentors(filtered);
    } else if (field === "project1" || field === "project2") {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [field]: {
          ...prevData[field],
          [name]: value,
        },
      }));
    } else if (field === "batch") {
      setFormData((prevData) => ({
        ...prevData,
        batch: e.target.value,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        leader: {
          ...prevData.leader,
          [field]: e.target.value,
        },
      }));
    }
  };

  const createTeam = async (e) => {
    e.preventDefault();

    // Validate mentor choices
    if (formData.mentorChoices.some((choice) => !choice)) {
      alert("Please select all mentor choices.");
      return;
    }

    // Construct the request payload
    const teamData = {
      code,
      leader: {
        name: formData.leader.name,
        email: formData.leader.email,
        phone: formData.leader.phone,
        rollNumber: formData.leader.rollNumber,
      },
      batch: formData.batch,
      projectChoices: [
        {
          name: formData.project1.title,
          description: formData.project1.description,
          techStack: formData.project1.technology,
        },
        {
          name: formData.project2.title,
          description: formData.project2.description,
          techStack: formData.project2.technology,
        },
      ],
      mentorChoices: formData.mentorChoices.map((choice) => choice.value),
      user,
    };

    try {
      const response = await axios.post("/team/create", teamData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        alert("Team created successfully!");
      }
      navigate("/home");
    } catch (error) {
      console.error("Error creating team:", error);
      alert("Failed to create team. Please try again.");
    }
  };

  return (
    <div className="bg-[#f1f2f7] py-8">
      <div className="w-[90%] md:w-1/2 bg-white p-6 rounded-lg mx-auto mt-10 shadow-md text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Project Details
        </h2>
        <form onSubmit={createTeam} className="space-y-6 text-left">
          <div className="space-y-2">
            <label htmlFor="code" className="block text-gray-700 font-medium">
              Team Code:
            </label>
            <input
              type="text"
              id="code"
              value={code}
              required
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-teal-300 bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">
              Leader Details
            </h3>
            <label htmlFor="leader-name">Leader Name:</label>
            <input
              type="text"
              id="leader-name"
              placeholder="Enter Leader Name"
              value={formData.leader.name}
              onChange={(e) => handleChange(e, "name")}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
            <label htmlFor="leader-email">Leader Email:</label>
            <input
              type="email"
              id="leader-email"
              placeholder="Enter Leader Email"
              value={formData.leader.email}
              onChange={(e) => handleChange(e, "email")}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
            <label htmlFor="leader-phone">Leader Phone:</label>
            <input
              type="text"
              id="leader-phone"
              placeholder="Enter Leader Phone"
              value={formData.leader.phone}
              onChange={(e) => handleChange(e, "phone")}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
            <label htmlFor="leader-rollNumber">Leader Roll Number:</label>
            <input
              type="text"
              id="leader-rollNumber"
              placeholder="Enter Roll Number"
              value={formData.leader.rollNumber}
              onChange={(e) => handleChange(e, "rollNumber")}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
            <label htmlFor="batch">Batch:</label>
            <input
              type="text"
              id="batch"
              placeholder="Enter Batch"
              value={formData.batch}
              onChange={(e) => handleChange(e, "batch")}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">
              Project 1 Details
            </h3>
            <label>Title:</label>
            <input
              type="text"
              name="title"
              placeholder="Enter Project 1 Title"
              value={formData.project1.title}
              onChange={(e) => handleChange(e, "project1")}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
            <label>Description:</label>
            <textarea
              name="description"
              placeholder="Enter Project 1 Description"
              value={formData.project1.description}
              onChange={(e) => handleChange(e, "project1")}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
            <label>Technology:</label>
            <input
              type="text"
              name="technology"
              placeholder="Enter Project 1 Technology"
              value={formData.project1.technology}
              onChange={(e) => handleChange(e, "project1")}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">
              Project 2 Details
            </h3>
            <label>Title:</label>
            <input
              type="text"
              name="title"
              placeholder="Enter Project 2 Title"
              value={formData.project2.title}
              onChange={(e) => handleChange(e, "project2")}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
            <label>Description:</label>
            <textarea
              name="description"
              placeholder="Enter Project 2 Description"
              value={formData.project2.description}
              onChange={(e) => handleChange(e, "project2")}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
            <label>Technology:</label>
            <input
              type="text"
              name="technology"
              placeholder="Enter Project 2 Technology"
              value={formData.project2.technology}
              onChange={(e) => handleChange(e, "project2")}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">
              Mentor Selection
            </h3>
            {[0, 1, 2].map((index) => (
              <div key={index} className="mb-2">
                <label className="block mb-1">Choice {index + 1}</label>
                <Select
                  value={formData.mentorChoices[index]}
                  options={remainingMentors}
                  onChange={(e) => handleChange(e, "mentorChoices", index)}
                />
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded shadow"
            >
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
