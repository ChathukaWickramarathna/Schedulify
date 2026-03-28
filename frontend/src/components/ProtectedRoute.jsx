/**
 * Protected Route Component
 * Wraps routes that require authentication and/or specific roles
 * Handles unauthorized access and redirects appropriately
 */

import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { hasAnyRole, hasRole } from "../utils/tokenHelper";

/**
 * ProtectedRoute Component
 *
 * Props:
 * - element: The component to render if authorized
 * - requiredRoles: Array of allowed roles (optional)
 *   If not provided, only authentication is required
 *   If provided, user must have at least one of these roles
 * - strictRoles: Boolean (optional, default: false)
 *   If true, ONLY users with exactly these roles can access
 *   (prevents STAFF/ADMIN from accessing USER routes)
 *
 * Behavior:
 * - If not authenticated: redirects to /login
 * - If authenticated but lacks required role: redirects to /unauthorized
 * - If authenticated and authorized: renders the component
 * - While loading: shows a loading state
 *
 * Usage:
 * <Route path="/admin" element={<ProtectedRoute element={<AdminDash />} requiredRoles={["ADMIN"]} />} />
 * <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} requiredRoles={["USER"]} strictRoles={true} />} />
 */
export default function ProtectedRoute({ element, requiredRoles = null, strictRoles = false }) {
  const { isAuthenticated, isLoading, user } = useContext(AuthContext);

  // Show loading state while session is being restored
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          {/* Spinner Animation */}
          <div className="mb-4 inline-block">
            <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-300 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, check user permissions
  if (requiredRoles && requiredRoles.length > 0) {
    if (strictRoles) {
      // Strict mode: user must have ONLY the specified roles
      // This prevents STAFF/ADMIN from accessing USER routes
      const hasExactRole = requiredRoles.some(role => hasRole(role));
      const hasHigherRole = hasRole("ADMIN") || hasRole("STAFF");

      // If user has a higher role and this is strict USER route, deny access
      if (requiredRoles.includes("USER") && hasHigherRole && !hasRole("USER")) {
        return <Navigate to="/unauthorized" replace />;
      }

      if (!hasExactRole) {
        return <Navigate to="/unauthorized" replace />;
      }
    } else {
      // Normal mode: user must have any of the required roles
      const hasRequiredRole = hasAnyRole(requiredRoles);

      if (!hasRequiredRole) {
        // User is authenticated but doesn't have required role
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  // User is authenticated and authorized - render the component
  return element;
}
