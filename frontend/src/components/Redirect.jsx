import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loading from "./Loading";
import { useEffect } from "react";

export default function Redirect() {
  const { user, loading } = useAuth();
  useEffect(() => {
    // This effect runs when the component mounts or when user/role changes
    if (user) {
      console.log("Redirecting based on user role:", user.role);
    }
  }, [user]);

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case "sub-admin":
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
