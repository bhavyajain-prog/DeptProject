import { Link } from "react-router-dom";
import {
  FaUsers,
  FaPlus,
  FaSignInAlt,
  FaLightbulb,
  FaClipboardList,
  FaTachometerAlt,
  FaFileUpload,
  FaSpinner,
} from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";

// Reusable Action Card with description
function StudentActionCard({ to, title, description, icon, disabled = false }) {
  const content = (
    <>
      <div className="text-5xl text-teal-500 mb-5 group-hover:text-teal-600 transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 text-center">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 text-center px-2">
        {description}
      </p>
    </>
  );

  if (disabled) {
    return (
      <div className="group flex flex-col items-center justify-start text-center p-6 bg-gray-100 rounded-2xl shadow-inner cursor-not-allowed opacity-60 h-full">
        {content}
      </div>
    );
  }

  return (
    <Link
      to={to}
      className="group flex flex-col items-center justify-start text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full"
    >
      {content}
    </Link>
  );
}

export default function StudentPortal() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <FaSpinner className="animate-spin text-4xl text-teal-600" />
        <p className="ml-3 text-lg text-gray-700">Loading your portal...</p>
      </div>
    );
  }

  const isInTeam = !!user?.studentData?.currentTeam;
  const isTeamLeader =
    user?._id === user?.studentData?.currentTeam?.leader?._id;

  return (
    <div className="bg-gradient-to-br from-slate-50 to-sky-100 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
            Student Portal
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Welcome,{" "}
            <span className="font-semibold text-teal-600">
              {user?.name || "Student"}
            </span>
            ! Here's your command center for project success.
          </p>
        </header>

        {isInTeam ? (
          // VIEW FOR STUDENTS IN A TEAM
          <div>
            <div className="text-center mb-12 p-6 bg-teal-600/10 rounded-xl shadow-inner border border-teal-200/50">
              <h2 className="text-xl font-semibold text-teal-800">
                Your Team Code
              </h2>
              <p className="text-5xl font-mono font-bold text-teal-600 mt-2 tracking-widest bg-white/50 rounded-lg py-2 px-4 inline-block shadow-sm">
                {user.studentData.currentTeam.teamCode}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <StudentActionCard
                to="/my-team"
                title="My Team"
                description="View your team members, project details, and progress."
                icon={<FaUsers />}
              />
              <StudentActionCard
                to="/team-details" // Placeholder route
                title="Manage Team"
                description="Leader-only: Finalize team details and preferences."
                icon={<FaClipboardList />}
                disabled={!isTeamLeader}
              />
              <StudentActionCard
                to="/view-score" // Placeholder route
                title="View Score"
                description="Check your current project scores and feedback from mentors."
                icon={<FaTachometerAlt />}
              />
              <StudentActionCard
                to="/weekly-progress" // Placeholder route
                title="Weekly Progress"
                description="Submit your team's weekly progress report and logs."
                icon={<FaFileUpload />}
              />
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
              <div className="md:col-start-2">
                <StudentActionCard
                  to="/propose-project"
                  title="Propose a New Project"
                  description="Have a brilliant idea? Submit a project proposal for consideration."
                  icon={<FaLightbulb />}
                />
              </div>
            </div>
          </div>
        ) : (
          // VIEW FOR STUDENTS NOT IN A TEAM
          <div>
            <div className="text-center mb-12 p-6 bg-white rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-800">
                Let's Get You Started!
              </h2>
              <p className="mt-2 text-gray-600">
                You're not part of a team yet. Join an existing team or create a
                new one to begin your project journey.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StudentActionCard
                to="/join-team"
                title="Join a Team"
                description="Use a team code to join an existing team and meet your new colleagues."
                icon={<FaSignInAlt />}
              />
              <StudentActionCard
                to="/create-team"
                title="Create a Team"
                description="Take the lead! Form a new team and invite your classmates to collaborate."
                icon={<FaPlus />}
              />
              <StudentActionCard
                to="/propose-project"
                title="Propose a Project"
                description="Got an innovative idea? Submit a project proposal for everyone to see."
                icon={<FaLightbulb />}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
