import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

function Form3() {
  const [studentName, setStudentName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [teamMembers, setTeamMembers] = useState(['', '', '']);
  const [weeklyData, setWeeklyData] = useState([
    { from: '', to: '', module: '', progress: '', comments: '', marks: '' }
  ]);
  const [totalWeeks, setTotalWeeks] = useState('');
  const [moduleCompleted, setModuleCompleted] = useState('');
  const [overallProgress, setOverallProgress] = useState('');
  const [overallComment, setOverallComment] = useState('');
  const [percentageMarks, setPercentageMarks] = useState('');
  const [mentorRemarks, setMentorRemarks] = useState('');

  const handleWeeklyChange = (index, field, value) => {
    const updated = [...weeklyData];
    updated[index][field] = value;
    setWeeklyData(updated);
  };

  const addWeekRow = () => {
    setWeeklyData([...weeklyData, { from: '', to: '', module: '', progress: '', comments: '', marks: '' }]);
  };

  const deleteWeekRow = (index) => {
    setWeeklyData(weeklyData.filter((_, i) => i !== index));
  };

  const downloadForm = async () => {
    const input = document.getElementById('form3-content');
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('form3-weekly-status.pdf');
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4">
      <div id="form3-content" className="max-w-6xl mx-auto bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">PROJECT WEEKLY STATUS MATRIX [Form-3]</h1>

        <input className="w-full border p-2 mb-2" placeholder="Name of Student - 1" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
        <input className="w-full border p-2 mb-2" placeholder="Name of Project" value={projectName} onChange={(e) => setProjectName(e.target.value)} />

        <div className="grid grid-cols-3 gap-2 mb-4">
          {teamMembers.map((member, idx) => (
            <input key={idx} className="border p-2" placeholder={`Other Team Member ${idx + 2}`} value={member} onChange={(e) => {
              const updated = [...teamMembers];
              updated[idx] = e.target.value;
              setTeamMembers(updated);
            }} />
          ))}
        </div>

        <table className="w-full border border-gray-400 text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-2 py-1">Week (To-From)</th>
              <th className="border px-2 py-1">Working on Module</th>
              <th className="border px-2 py-1">Progress Achieved</th>
              <th className="border px-2 py-1">Comments & Signature of Mentor</th>
              <th className="border px-2 py-1">Marks (out of 10)</th>
              <th className="border px-2 py-1">Action</th>
            </tr>
          </thead>
          <tbody>
            {weeklyData.map((week, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">
                  <div className="flex gap-1">
                    <input type="date" className="w-1/2 border p-1" value={week.from} onChange={(e) => handleWeeklyChange(i, 'from', e.target.value)} />
                    <input type="date" className="w-1/2 border p-1" value={week.to} onChange={(e) => handleWeeklyChange(i, 'to', e.target.value)} />
                  </div>
                </td>
                <td className="border px-2 py-1"><input className="w-full p-1" value={week.module} onChange={(e) => handleWeeklyChange(i, 'module', e.target.value)} /></td>
                <td className="border px-2 py-1"><input className="w-full p-1" value={week.progress} onChange={(e) => handleWeeklyChange(i, 'progress', e.target.value)} /></td>
                <td className="border px-2 py-1"><input className="w-full p-1" value={week.comments} onChange={(e) => handleWeeklyChange(i, 'comments', e.target.value)} /></td>
                <td className="border px-2 py-1"><input className="w-full p-1" value={week.marks} onChange={(e) => handleWeeklyChange(i, 'marks', e.target.value)} /></td>
                <td className="border px-2 py-1 text-center">
                  <button onClick={() => deleteWeekRow(i)} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addWeekRow} className="mt-2 px-4 py-1 bg-blue-600 text-white rounded cursor-pointer">Add Week</button>

        <div className="grid grid-cols-5 gap-2 mt-6 text-sm">
          <input className="border p-2" placeholder="Total Weeks" value={totalWeeks} onChange={(e) => setTotalWeeks(e.target.value)} />
          <select className="border p-2" value={moduleCompleted} onChange={(e) => setModuleCompleted(e.target.value)}>
            <option value="">Module Completed (Y/N)</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          <select className="border p-2" value={overallProgress} onChange={(e) => setOverallProgress(e.target.value)}>
            <option value="">Overall Progress</option>
            <option value="Poor">Poor</option>
            <option value="Avg">Avg</option>
            <option value="Good">Good</option>
          </select>
          <select className="border p-2" value={overallComment} onChange={(e) => setOverallComment(e.target.value)}>
            <option value="">Overall Comment</option>
            <option value="Poor">Poor</option>
            <option value="Avg">Avg</option>
            <option value="Good">Good</option>
          </select>
          <input className="border p-2" placeholder="% Marks Estimate" value={percentageMarks} onChange={(e) => setPercentageMarks(e.target.value)} />
        </div>

        <div className="mt-4">
          <label className="font-semibold block mb-1">Mentor's Remarks:</label>
          <textarea rows={3} className="w-full border p-2" value={mentorRemarks} onChange={(e) => setMentorRemarks(e.target.value)} />
        </div>

        <div className="text-center mt-10 flex flex-wrap justify-center gap-4">
          <button type="submit" className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded shadow cursor-pointer">Submit</button>
          <button type="button" onClick={() => alert('Form approved!')} className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded shadow cursor-pointer">Approve</button>
          <button type="button" onClick={downloadForm} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded shadow cursor-pointer">Download</button>
          <button type="button" onClick={() => window.print()} className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded shadow cursor-pointer">Print</button>
        </div>
      </div>
    </div>
  );
}

export default Form3;