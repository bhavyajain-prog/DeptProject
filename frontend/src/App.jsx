import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import Header from "./components/Header";
import Footer from "./components/Footer";
import NotFound from "./pages/NotFound";
import RoleBasedRoute from "./routing/RoleBasedRoute";
import "./App.css";

import Login from "./features/auth/components/Login";
import Register from "./features/auth/components/Register";
import ForgotPassword from "./features/auth/components/ForgotPassword";
import ResetPassword from "./features/auth/components/ResetPassword";

import StudentPortal from "./features/student/components/StudentPortal";
import CreateTeam from "./features/student/components/CreateTeam";
import MyTeam from "./features/student/components/MyTeam";
import JoinTeam from "./features/student/components/JoinTeam";

import MentorPortal from "./features/mentor/components/MentorPortal";

import AdminPortal from "./features/admin/components/AdminPortal";
import AdminUpload from "./features/admin/components/AdminUpload";
import ManageTeams from "./features/admin/components/ManageTeams";
import ManageMentors from "./features/admin/components/ManageMentors";
import ManageStudents from "./features/admin/components/ManageStudents";
import ManageProjects from "./features/admin/components/ManageProjects";

import Home from "./pages/DevPortal";


export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* Redirect root to login */}
              <Route path="/" element={<Navigate to="/login" />} />
              {/* Dev Portal: All Pages for UI/UX review */}
              <Route
                path="/dev"
                element={
                  <RoleBasedRoute roles={["dev"]}>
                    <Home />
                  </RoleBasedRoute>
                }
              />
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
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
                    <AdminUpload />
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
              <Route
                path="/admin/manage/projects"
                element={
                  <RoleBasedRoute roles={["admin"]}>
                    <ManageProjects />
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
              {/* Util Routes */}
              <Route path="/notfound" element={<NotFound />} /> {/* Fallback */}
              <Route path="*" element={<Navigate to="/notfound" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
// TODO: Global variables for timing of particular stages
