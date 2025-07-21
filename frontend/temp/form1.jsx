import React, { useState } from 'react';
import { jsPDF } from 'jspdf';

function Form1() {
  const [tools, setTools] = useState([{ name: '', version: '', type: '', purpose: '' }]);
  const [modules, setModules] = useState([{ name: '', functionality: '' }]);
  const [teamMembers, setTeamMembers] = useState([{ name: '', classGroup: '', mobile: '', expertise: '', role: '' }]);

  const handleToolChange = (index, field, value) => {
    const updated = [...tools];
    updated[index][field] = value;
    setTools(updated);
  };

  const handleModuleChange = (index, field, value) => {
    const updated = [...modules];
    updated[index][field] = value;
    setModules(updated);
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...teamMembers];
    updated[index][field] = value;
    setTeamMembers(updated);
  };

  const addToolRow = () => {
    setTools([...tools, { name: '', version: '', type: '', purpose: '' }]);
  };

  const addModuleRow = () => {
    setModules([...modules, { name: '', functionality: '' }]);
  };

  const addMemberRow = () => {
    setTeamMembers([...teamMembers, { name: '', classGroup: '', mobile: '', expertise: '', role: '' }]);
  };

  const deleteToolRow = (index) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const deleteModuleRow = (index) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const deleteMemberRow = (index) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Form submitted! (View console for details)");
    console.log({ tools, modules, teamMembers });
  };

  return (
    <div className="bg-gradient-to-br from-slate-100 to-sky-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Project Submission Form</h1>
          <h2 className="text-xl font-semibold text-gray-700 mt-2">MAJOR / MINOR PROJECT ABSTRACT (2023-24)</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="font-semibold block">Lab Coordinator</label>
            <input type="text" placeholder="Enter coordinator name" className="w-full p-2 border rounded" />
          </div>

          <div>
            <label className="font-semibold block">Project ID</label>
            <input type="text" placeholder="Enter Project ID" className="w-full p-2 border rounded" />
          </div>

          <div>
            <label className="font-semibold block">Title of Project</label>
            <input type="text" placeholder="Enter Project Title" className="w-full p-2 border rounded" />
          </div>

          <div>
            <label className="font-semibold block">Project Track</label>
            <div className="space-y-2 ml-4">
              <label className="block"><input type="checkbox" /> R&D (Innovation)</label>
              <label className="block"><input type="checkbox" /> Consultancy (Industry)</label>
              <label className="block"><input type="checkbox" /> Startup (Self-Business)</label>
              <label className="block"><input type="checkbox" /> Project Pool (IBM/Infosys)</label>
              <label className="block"><input type="checkbox" /> Hardware / Embedded</label>
            </div>
          </div>

          <div>
            <label className="font-semibold block">Brief Introduction</label>
            <textarea rows="4" placeholder="Enter project introduction" className="w-full p-2 border rounded"></textarea>
          </div>

          <div>
            <label className="font-semibold block mb-2">Tools / Technologies</label>
            <table className="w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">Version</th>
                  <th className="border px-2 py-1">Type</th>
                  <th className="border px-2 py-1">Purpose</th>
                  <th className="border px-2 py-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1"><input className="w-full p-1" value={tool.name} onChange={(e) => handleToolChange(i, 'name', e.target.value)} /></td>
                    <td className="border px-2 py-1"><input className="w-full p-1" value={tool.version} onChange={(e) => handleToolChange(i, 'version', e.target.value)} /></td>
                    <td className="border px-2 py-1"><input className="w-full p-1" value={tool.type} onChange={(e) => handleToolChange(i, 'type', e.target.value)} /></td>
                    <td className="border px-2 py-1"><input className="w-full p-1" value={tool.purpose} onChange={(e) => handleToolChange(i, 'purpose', e.target.value)} /></td>
                    <td className="border px-2 py-1 text-center">
                      <button type="button" onClick={() => deleteToolRow(i)} className="mt-1 px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={addToolRow} className="mt-2 px-4 py-1 bg-blue-500 text-white rounded cursor-pointer">Add Tool</button>
          </div>

          <div>
            <label className="font-semibold block mb-2">Modules</label>
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">Functionality</th>
                  <th className="border px-2 py-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((mod, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1"><input className="w-full p-1" value={mod.name} onChange={(e) => handleModuleChange(i, 'name', e.target.value)} /></td>
                    <td className="border px-2 py-1"><input className="w-full p-1" value={mod.functionality} onChange={(e) => handleModuleChange(i, 'functionality', e.target.value)} /></td>
                    <td className="border px-2 py-1 text-center">
                      <button type="button" onClick={() => deleteModuleRow(i)} className="mt-1 px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={addModuleRow} className="mt-2 px-4 py-1 bg-blue-500 text-white rounded cursor-pointer">Add Module</button>
          </div>

          <div>
            <label className="font-semibold block mb-2">Team Members</label>
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">Class/Group</th>
                  <th className="border px-2 py-1">Mobile</th>
                  <th className="border px-2 py-1">Expertise</th>
                  <th className="border px-2 py-1">Role</th>
                  <th className="border px-2 py-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1"><input className="w-full p-1" value={member.name} onChange={(e) => handleMemberChange(i, 'name', e.target.value)} /></td>
                    <td className="border px-2 py-1"><input className="w-full p-1" value={member.classGroup} onChange={(e) => handleMemberChange(i, 'classGroup', e.target.value)} /></td>
                    <td className="border px-2 py-1"><input className="w-full p-1" value={member.mobile} onChange={(e) => handleMemberChange(i, 'mobile', e.target.value)} /></td>
                    <td className="border px-2 py-1"><input className="w-full p-1" value={member.expertise} onChange={(e) => handleMemberChange(i, 'expertise', e.target.value)} /></td>
                    <td className="border px-2 py-1"><input className="w-full p-1" value={member.role} onChange={(e) => handleMemberChange(i, 'role', e.target.value)} /></td>
                    <td className="border px-2 py-1 text-center">
                      <button type="button" onClick={() => deleteMemberRow(i)} className="mt-1 px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded cursor-pointer">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={addMemberRow} className="mt-2 px-4 py-1 bg-blue-500 text-white rounded cursor-pointer">Add Member</button>
          </div>

          
          
          <div className="text-center mt-10 flex flex-wrap justify-center gap-4">
  <button type="submit" className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded shadow cursor-pointer">
    Submit
  </button>
  <button type="button" onClick={() => alert('Form approved!')} className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded shadow cursor-pointer">
    Approve
  </button>
  <button type="button" onClick={() => downloadForm()} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded shadow cursor-pointer">
    Download
  </button>
  <button type="button" onClick={() => window.print()} className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded shadow cursor-pointer">
    Print
  </button>
</div>
</form>
      </div>
    </div>
  );
}

const downloadForm = () => {
  import('jspdf').then(({ jsPDF }) => {
    const formContent = document.getElementById('form-content');
    if (!formContent) return;

    const doc = new jsPDF('p', 'pt', 'a4');
    doc.html(formContent, {
      callback: function (pdf) {
        pdf.save('project_form.pdf');
      },
      margin: [20, 20, 20, 20],
      autoPaging: 'text',
      html2canvas: { scale: 0.5 },
    });
  });
};

const printForm = () => {
  const formContent = document.getElementById('form-content');
  if (!formContent) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Print Form</title>
        <style>
          body { font-family: sans-serif; padding: 20px; background-color: white; color: black; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; border: 1px solid #ccc; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f1f1f1; font-weight: bold; }
          h1, h2 { text-align: center; }
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


export default Form1;