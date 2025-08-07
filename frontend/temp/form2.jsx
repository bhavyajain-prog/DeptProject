import { useState } from "react";

function Form2() {
  const [members, setMembers] = useState([
    {
      name: "",
      module: "",
      activities: [
        { activity: "", softDeadline: "", hardDeadline: "", details: "" },
      ],
    },
  ]);

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const handleActivityChange = (mIndex, aIndex, field, value) => {
    const updated = [...members];
    updated[mIndex].activities[aIndex][field] = value;
    setMembers(updated);
  };

  const addMember = () => {
    setMembers([
      ...members,
      {
        name: "",
        module: "",
        activities: [
          { activity: "", softDeadline: "", hardDeadline: "", details: "" },
        ],
      },
    ]);
  };

  const addActivity = (index) => {
    const updated = [...members];
    updated[index].activities.push({
      activity: "",
      softDeadline: "",
      hardDeadline: "",
      details: "",
    });
    setMembers(updated);
  };

  const deleteMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const deleteActivity = (mIndex, aIndex) => {
    const updated = [...members];
    updated[mIndex].activities.splice(aIndex, 1);
    setMembers(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Form submitted! Check console for data.");
    console.log(members);
  };

  const printForm = () => {
    const formContent = document.getElementById("form-content");
    if (!formContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
    <html>
      <head>
        <title>Print Form</title>
        <style>
          body {
            font-family: sans-serif;
            padding: 20px;
            background-color: white;
            color: black;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1rem;
            border: 1px solid #ccc;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f1f1f1;
            font-weight: bold;
          }
          h1, h2 {
            text-align: center;
          }
          input {
            border: none;
            outline: none;
            width: 100%;
          }
        </style>
      </head>
      <body>
        ${formContent.innerHTML}
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="bg-gradient-to-br from-slate-100 to-sky-100 min-h-screen py-12 px-4">
      <div
        className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow"
        id="form-content"
      >
        <h1 className="text-3xl font-bold text-center mb-10">
          Form 2 - Role Specification of Team Members
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {members.map((member, mIndex) => (
            <div key={mIndex} className="border p-4 rounded mb-6">
              <div className="mb-2">
                <input
                  className="w-full p-2 border rounded mb-2"
                  placeholder="Member Name"
                  value={member.name}
                  onChange={(e) =>
                    handleMemberChange(mIndex, "name", e.target.value)
                  }
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Handling Module"
                  value={member.module}
                  onChange={(e) =>
                    handleMemberChange(mIndex, "module", e.target.value)
                  }
                />
              </div>
              <table className="w-full text-sm border border-gray-400">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-2 py-1 border border-gray-400">
                      Activity
                    </th>
                    <th className="px-2 py-1 border border-gray-400">
                      Soft Deadline
                    </th>
                    <th className="px-2 py-1 border border-gray-400">
                      Hard Deadline
                    </th>
                    <th className="px-2 py-1 border border-gray-400">
                      Details
                    </th>
                    <th className="px-2 py-1 border border-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {member.activities.map((activity, aIndex) => (
                    <tr key={aIndex}>
                      <td className="border border-gray-400">
                        <input
                          className="w-full p-1"
                          value={activity.activity}
                          onChange={(e) =>
                            handleActivityChange(
                              mIndex,
                              aIndex,
                              "activity",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="border border-gray-400">
                        <input
                          type="date"
                          className="w-full p-1"
                          value={activity.softDeadline}
                          onChange={(e) =>
                            handleActivityChange(
                              mIndex,
                              aIndex,
                              "softDeadline",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="border border-gray-400">
                        <input
                          type="date"
                          className="w-full p-1"
                          value={activity.hardDeadline}
                          onChange={(e) =>
                            handleActivityChange(
                              mIndex,
                              aIndex,
                              "hardDeadline",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="border border-gray-400">
                        <input
                          className="w-full p-1"
                          value={activity.details}
                          onChange={(e) =>
                            handleActivityChange(
                              mIndex,
                              aIndex,
                              "details",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="border border-gray-400 text-center">
                        <button
                          type="button"
                          onClick={() => deleteActivity(mIndex, aIndex)}
                          className="m-1 px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                onClick={() => addActivity(mIndex)}
                className="mt-2 px-4 py-1 bg-blue-500 text-white rounded cursor-pointer"
              >
                Add Activity
              </button>
              <button
                type="button"
                onClick={() => deleteMember(mIndex)}
                className="ml-2 mt-2 px-4 py-1 bg-red-600 text-white rounded cursor-pointer"
              >
                Remove Member
              </button>
            </div>
          ))}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={addMember}
              className="px-6 py-2 bg-blue-600 text-white rounded cursor-pointer"
            >
              Add Member
            </button>
          </div>
          <div className="text-center mt-10 flex flex-wrap justify-center gap-4">
            <button
              type="submit"
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded shadow cursor-pointer"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => alert("Form approved!")}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded shadow cursor-pointer"
            >
              Approve
            </button>
            <button
              type="button"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded shadow cursor-pointer"
            >
              Download
            </button>
            <button
              type="button"
              onClick={printForm}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded shadow cursor-pointer"
            >
              Print
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Form2;
