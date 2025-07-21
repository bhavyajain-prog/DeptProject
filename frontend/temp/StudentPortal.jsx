// import React from "react";
// import { Link } from "react-router-dom";

// export default function StudentPortal() {
//   // No backend logic, just static links
//   return (
//     <div className="flex justify-center items-center px-4 mt-35">
//       <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
//         <h2 className="text-2xl font-semibold text-gray-800 mb-8">Dashboard</h2>
//         <div className="flex flex-col gap-5">
//           <Link
//             to="/my-team"
//             className="bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-md shadow text-lg font-medium"
//           >
//             My Team
//           </Link>
//           <Link
//             to="/join-team"
//             className="bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-md shadow text-lg font-medium"
//           >
//             Join Team
//           </Link>
//           <Link
//             to="/create-team"
//             className="bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-md shadow text-lg font-medium"
//           >
//             Create team
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }


import { Link } from "react-router-dom";
import { FaUsers, FaPlus, FaSignInAlt, FaWpforms } from "react-icons/fa";

function StudentActionCard({ to, title, icon }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow hover:shadow-md transition"
    >
      <div className="text-4xl text-teal-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    </Link>
  );
}

export default function StudentPortal() {
  return (
    <div className="bg-gradient-to-br from-slate-100 to-sky-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800">Student Portal</h1>
          <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto">
            Collaborate with your teammates and manage your project activities effortlessly.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
          <StudentActionCard
            to="/my-team"
            title="My Team"
            icon={<FaUsers />}
          />
          <StudentActionCard
            to="/join-team"
            title="Join Team"
            icon={<FaSignInAlt />}
          />
          <StudentActionCard
            to="/create-team"
            title="Create Team"
            icon={<FaPlus />}
          />
          <StudentActionCard
            to="/form1"
            title="Form 1"
            icon={<FaWpforms />}
          />
          <StudentActionCard
            to="/form2"
            title="Form 2"
            icon={<FaWpforms />}
          />
          <StudentActionCard
            to="/form3"
            title="Form 3"
            icon={<FaWpforms />}
          />

        </div>
      </div>
    </div>
  );
}
