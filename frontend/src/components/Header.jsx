import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.jpg";
import { useAuth } from "./AuthContext";
import axios from "../api/axios";

const Header = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
      setUser(null);
      setShowDropdown(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getDashboardRoute = () => {
    if (!user || !user.role) return "/";
    if (user.role === "admin") return "/admin/home";
    if (user.role === "mentor") return "/mentor/home";
    if (user.role === "student") return "/home";
    if (user.role === "dev") return "/dev";
    return "/";
  };

  const path = location.pathname;

  const isMinimalOnlyLogo = ["/login", "/notfound"].includes(path);
  const isResetFlow =
    path === "/forgot-password" || path.startsWith("/reset-password");

  return (
    <header 
      className={`bg-white shadow-md py-3 px-6 relative min-h-[70px] z-10 ${
        scrolled ? "shadow-lg" : "shadow-md"
      } transition-shadow duration-300`}
    >
      <div className="max-w-screen-xl mx-auto relative min-h-[50px]">
        {isMinimalOnlyLogo ? (
          // Only logo centered
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <a
              href="https://erp.skit.ac.in"
              target="_blank"
              rel="noopener noreferrer"
              className="block relative"
            >
              <div className="w-[55px] h-[55px] rounded-full overflow-hidden border-2 border-teal-500 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 bg-white p-1">
                <img
                  src={logo}
                  alt="SKIT ERP"
                  className="max-w-full max-h-full hover:scale-105 transition-transform duration-200"
                />
              </div>
            </a>
          </div>
        ) : (
          <>
            {/* Left - Back button */}
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
              <button
                onClick={() => {
                  isResetFlow
                    ? navigate("/login")
                    : navigate(getDashboardRoute());
                }}
                className="bg-teal-50 hover:bg-teal-100 text-teal-600 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className="w-5 h-5"
                >
                  {isResetFlow ? (
                    <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-3.586l-4.707 4.707a1 1 0 01-1.414-1.414L11.586 10H5a1 1 0 110-2h6.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  )}
                </svg>
                <span>{isResetFlow ? "Back to Login" : "Home"}</span>
              </button>
            </div>

            {/* Center - Logo */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <a
                href="https://erp.skit.ac.in"
                target="_blank"
                rel="noopener noreferrer"
                className="block relative"
              >
                <div className="w-[55px] h-[55px] rounded-full overflow-hidden border-2 border-teal-500 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 bg-white p-1">
                  <img
                    src={logo}
                    alt="SKIT ERP"
                    className="max-w-full max-h-full hover:scale-105 transition-transform duration-200"
                  />
                </div>
              </a>
            </div>

            {/* Right - Profile and Logout */}
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2">
              {user && !isResetFlow && (
                <div className="relative">
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 bg-white border border-gray-200 hover:border-teal-300 rounded-full py-2 px-4 shadow-sm hover:shadow transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-semibold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="hidden md:block font-medium text-gray-700 max-w-[120px] truncate">
                      {user.name || "User"}
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20 border border-gray-100">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <div className="px-4 py-2 text-xs text-gray-500">
                        Role: <span className="capitalize font-medium">{user.role}</span>
                      </div>
                      <div className="px-2 py-1">
                        <button
                          onClick={() => navigate('/profile')}
                          className="block w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        >
                          Profile Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;