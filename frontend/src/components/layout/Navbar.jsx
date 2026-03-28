/**
 * Navbar Component
 * Modern navigation bar with authentication state awareness
 * Features: User menu, role-based navigation, logout functionality, responsive design
 */

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { hasRole, hasAnyRole } from "../../utils/tokenHelper";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // State
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  /**
   * Check if route is active
   */
  const isActive = (path) => {
    return location.pathname === path ||
      location.pathname.startsWith(path + "/");
  };

  /**
   * Get user initials for avatar
   */
  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Get home route based on user role
   */
  const getHomeRoute = () => {
    if (!isAuthenticated) return "/login";
    if (hasRole("ADMIN")) return "/admin/dashboard";
    if (hasRole("STAFF")) return "/staff/dashboard";
    return "/dashboard"; // Default for USER
  };

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to={getHomeRoute()} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">Schedulify</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated ? (
            <div className="hidden md:flex md:items-center md:space-x-4">
              {/* Navigation Links - Show based on role */}
              {/* User-only links */}
              {hasRole("USER") && !hasAnyRole(["STAFF", "ADMIN"]) && (
                <>
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/dashboard")
                        ? "bg-slate-800 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/book-appointment"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/book-appointment")
                        ? "bg-slate-800 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    Book Appointment
                  </Link>

                  <Link
                    to="/my-bookings"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/my-bookings")
                        ? "bg-slate-800 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    My Bookings
                  </Link>
                </>
              )}

              {/* Staff-only links */}
              {hasRole("STAFF") && !hasRole("ADMIN") && (
                <>
                  <Link
                    to="/staff/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/staff/dashboard")
                        ? "bg-slate-800 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    Staff Dashboard
                  </Link>

                  <Link
                    to="/staff/manage-bookings"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/staff/manage-bookings")
                        ? "bg-slate-800 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    Manage Bookings
                  </Link>
                </>
              )}

              {/* Admin Link - Only show to admins */}
              {hasRole("ADMIN") && (
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/admin")
                      ? "bg-purple-600 text-white"
                      : "text-purple-400 hover:bg-purple-600/20 hover:text-purple-300"
                  }`}
                >
                  Admin
                </Link>
              )}

              {/* User Menu */}
              <div className="relative ml-3" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                    {getUserInitials()}
                  </div>
                  <span className="text-sm font-medium text-white hidden lg:block">
                    {user?.name}
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-lg border border-slate-700 py-1">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-slate-700">
                      <p className="text-sm font-medium text-white">
                        {user?.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {user?.email}
                      </p>
                      <p className="text-xs text-blue-400 mt-1 font-semibold">
                        {user?.role}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Profile
                      </div>
                    </Link>

                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Settings
                      </div>
                    </Link>

                    <div className="border-t border-slate-700 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors"
                    >
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Not Authenticated - Show Login/Register
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          {isAuthenticated ? (
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* User Info */}
              <div className="px-3 py-3 mb-2 bg-slate-900 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold mr-3">
                    {getUserInitials()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                    <p className="text-xs text-blue-400 font-semibold">
                      {user?.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              {/* User-only links */}
              {hasRole("USER") && !hasAnyRole(["STAFF", "ADMIN"]) && (
                <>
                  <Link
                    to="/dashboard"
                    className={`block px-3 py-2 rounded-lg text-base font-medium ${
                      isActive("/dashboard")
                        ? "bg-slate-900 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/book-appointment"
                    className={`block px-3 py-2 rounded-lg text-base font-medium ${
                      isActive("/book-appointment")
                        ? "bg-slate-900 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    Book Appointment
                  </Link>

                  <Link
                    to="/my-bookings"
                    className={`block px-3 py-2 rounded-lg text-base font-medium ${
                      isActive("/my-bookings")
                        ? "bg-slate-900 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    My Bookings
                  </Link>
                </>
              )}

              {/* Staff-only links */}
              {hasRole("STAFF") && !hasRole("ADMIN") && (
                <>
                  <Link
                    to="/staff/dashboard"
                    className={`block px-3 py-2 rounded-lg text-base font-medium ${
                      isActive("/staff/dashboard")
                        ? "bg-slate-900 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    Staff Dashboard
                  </Link>

                  <Link
                    to="/staff/manage-bookings"
                    className={`block px-3 py-2 rounded-lg text-base font-medium ${
                      isActive("/staff/manage-bookings")
                        ? "bg-slate-900 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    Manage Bookings
                  </Link>
                </>
              )}

              {hasRole("ADMIN") && (
                <Link
                  to="/admin/dashboard"
                  className={`block px-3 py-2 rounded-lg text-base font-medium ${
                    isActive("/admin")
                      ? "bg-purple-600 text-white"
                      : "text-purple-400 hover:bg-purple-600/20 hover:text-purple-300"
                  }`}
                >
                  Admin Panel
                </Link>
              )}

              <div className="border-t border-slate-700 my-2"></div>

              <Link
                to="/profile"
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Profile
              </Link>

              <Link
                to="/settings"
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Settings
              </Link>

              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-400 hover:bg-slate-700 hover:text-red-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/login"
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-lg text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
