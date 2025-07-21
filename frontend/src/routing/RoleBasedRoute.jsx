import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loading from "../components/Loading";

export default function RoleBasedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!roles.includes(user.role) && user.role !== "dev") {
    return <Navigate to="/notfound" />;
  }

  return children;
}
