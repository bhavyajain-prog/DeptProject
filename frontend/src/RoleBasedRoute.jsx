import { Navigate } from "react-router-dom";
import { useAuth } from "./components/AuthContext";

export default function RoleBasedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role) && user.role !== "dev") {
    return <Navigate to="/notfound" />;
  }

  return children;
}
