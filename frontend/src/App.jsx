import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Header";
import Login from "./features/auth/components/Login";
import StudentPortal from "./features/student/components/StudentPortal";
import MentorPortal from "./features/mentor/components/MentorPortal";
import AdminPortal from "./features/admin/components/AdminPortal";
import Home from "./pages/DevPortal";
import NotFound from "./pages/NotFound";
import Register from "./features/auth/components/Register";
import Upload from "./features/admin/components/AdminUpload";
import ForgotPassword from "./features/auth/components/ForgotPassword";
import ResetPassword from "./features/auth/components/ResetPassword";
import CreateTeam from "./features/teams/components/CreateTeam";

import RoleBasedRoute from "./routing/RoleBasedRoute";

import "./App.css";
import MyTeam from "./features/teams/components/MyTeam";
import JoinTeam from "./features/teams/components/JoinTeam";
import ViewTeams from "./features/teams/components/ViewTeams";
import ManageTeams from "./features/admin/components/ManageTeams";
import ManageMentors from "./features/admin/components/ManageMentors";
import ManageStudents from "./features/admin/components/ManageStudents";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Dev Portal: All Pages for UI/UX review */}
          <Route path="/dev" element={
            <RoleBasedRoute roles={["dev"]}>
              <Home />
            </RoleBasedRoute>
          } />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Admin Routes */}
          <Route
            path="/admin/home"
            element={
              <RoleBasedRoute roles={["admin"]}>
                <AdminPortal />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/upload"
            element={
              <RoleBasedRoute roles={["admin"]}>
                <Upload />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/manage/teams"
            element={
              <RoleBasedRoute roles={["admin"]}>
                <ManageTeams />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/manage/mentors"
            element={
              <RoleBasedRoute roles={["admin"]}>
                <ManageMentors />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/manage/students"
            element={
              <RoleBasedRoute roles={["admin"]}>
                <ManageStudents />
              </RoleBasedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/home"
            element={
              <RoleBasedRoute roles={["student"]}>
                <StudentPortal />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/create-team"
            element={
              <RoleBasedRoute roles={["student"]}>
                <CreateTeam />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/join-team"
            element={
              <RoleBasedRoute roles={["student"]}>
                <JoinTeam />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/my-team"
            element={
              <RoleBasedRoute roles={["student"]}>
                <MyTeam />
              </RoleBasedRoute>
            }
          />

          {/* Mentor Routes */}
          <Route
            path="/mentor/home"
            element={
              <RoleBasedRoute roles={["mentor"]}>
                <MentorPortal />
              </RoleBasedRoute>
            }
          />

          {/* Team Routes (currently public or demo) */}
          <Route
            path="/teams/select"
            element={
              <div style={{ padding: 40, textAlign: "center" }}>
                Select Teams Page (UI/UX Demo)
              </div>
            }
          />
          <Route path="/teams/view" element={<ViewTeams />} />

          {/* Util Routes */}
          <Route path="/notfound" element={<NotFound />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/notfound" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
// TODO: Global variables for timing of particular stages
