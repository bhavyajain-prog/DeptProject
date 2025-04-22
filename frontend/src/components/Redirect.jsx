import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Loading from "./Loading";

export default function Redirect() {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case "admin":
      return <Navigate to="/admin/home" />;
    case "student":
      return <Navigate to="/home" />;
    case "mentor":
      return <Navigate to="/mentor/home" />;
    case "dev":
      return <Navigate to="/dev" />;
    default:
      console.warn("Unknown role, redirecting to notfound");
      return <Navigate to="/notfound" />;
  }
}
