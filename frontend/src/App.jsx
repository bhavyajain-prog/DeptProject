import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import Header from "./components/Header";
import Login from "./components/Login";
import StudentPortal from "./components/StudentPortal";
import MentorPortal from "./components/MentorPortal";
import AdminPortal from "./components/AdminPortal";
import Home from "./components/Home";
import NotFound from "./components/NotFound";
import Register from "./components/Register";
import Redirect from "./components/Redirect";
import Upload from "./components/AdminUpload";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import CreateTeam from "./components/CreateTeam";

import RoleBasedRoute from "./RoleBasedRoute";

import "./App.css";
import MyTeam from "./components/MyTeam";
import JoinTeam from "./components/JoinTeam";
import ViewTeams from "./components/ViewTeams";
import ManualAllocation from "./components/ManualAllocation";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Redirect />} />
          <Route path="/notfound" element={<NotFound />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Dev Role */}
          <Route
            path="/dev"
            element={
              <RoleBasedRoute allowedRoles={["dev"]}>
                <Home />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/register"
            element={
              <RoleBasedRoute allowedRoles={["dev", "admin"]}>
                <Register />
              </RoleBasedRoute>
            }
          />

          {/* Student */}
          <Route
            path="/home"
            element={
              <RoleBasedRoute allowedRoles={["student"]}>
                <StudentPortal />
              </RoleBasedRoute>
            }
          />

          {/* Mentor */}
          <Route
            path="/mentor/home"
            element={
              <RoleBasedRoute allowedRoles={["mentor"]}>
                <MentorPortal />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/mentor/teams"
            element={
              <RoleBasedRoute allowedRoles={["mentor"]}>
                <ViewTeams mode="mentor" />
              </RoleBasedRoute>
            }
          />
          {/* Admin */}
          <Route
            path="/admin/home"
            element={
              <RoleBasedRoute allowedRoles={["admin"]}>
                <AdminPortal />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/upload"
            element={
              <RoleBasedRoute allowedRoles={["admin"]}>
                <Upload />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/teams"
            element={
              <RoleBasedRoute allowedRoles={["admin"]}>
                <ViewTeams />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/manage/teams"
            element={
              <RoleBasedRoute allowedRoles={["admin"]}>
                <ManualAllocation />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/create-team"
            element={
              <RoleBasedRoute allowedRoles={["student"]}>
                <CreateTeam />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/join-team"
            element={
              <RoleBasedRoute allowedRoles={["student"]}>
                <JoinTeam />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/my-team"
            element={
              <RoleBasedRoute allowedRoles={["student"]}>
                <MyTeam />
              </RoleBasedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/notfound" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
// TODO: Global variables for timing of particular stages
