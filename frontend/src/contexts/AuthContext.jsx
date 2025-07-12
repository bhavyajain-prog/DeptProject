import { createContext, useContext, useState, useEffect } from "react";
import axios from "../services/axios";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import Loading from "../components/Loading";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  const getTargetPathForRole = (role) => {
    switch (role) {
      case "admin":
      case "sub-admin":
        return "/admin/home";
      case "student":
        return "/home";
      case "mentor":
        return "/mentor/home";
      case "dev":
        return "/dev";
      default:
        return "/notfound";
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      console.log(
        "[AuthContext] Attempting to check authentication via /auth/me"
      );
      try {
        const res = await axios.get("/auth/me", {
          withCredentials: true,
        });
        console.log("[AuthContext] /auth/me response received:", res.data);

        if (res.data.user) {
          console.log(
            "[AuthContext] User data found in response, setting user:",
            res.data.user
          );
          setUser(res.data.user);

          const targetPath = getTargetPathForRole(res.data.user.role);
          const authPages = [
            "/login",
            "/register",
            "/forgot-password",
            "/reset-password",
          ];

          // Redirect if user is on an auth page or root, and not already on their target path.
          if (
            targetPath &&
            (authPages.includes(location.pathname) || location.pathname === "/") &&
            location.pathname !== targetPath
          ) {
            console.log(
              `[AuthContext] User authenticated. Current path: ${location.pathname}. Navigating to role-based home: ${targetPath}`
            );
            navigate(targetPath);
          } else {
            console.log(
              `[AuthContext] User authenticated. Current path: ${location.pathname}. No automatic redirect needed from AuthContext.`
            );
          }
        } else {
          console.log(
            "[AuthContext] No user data in /auth/me response, but no error. User will be redirected by protected routes if necessary."
          );
        }
      } catch (error) {
        console.error(
          "[AuthContext] Error during /auth/me call:",
          error.response ? error.response.data : error.message
        );
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {loading ? <Loading /> : children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
