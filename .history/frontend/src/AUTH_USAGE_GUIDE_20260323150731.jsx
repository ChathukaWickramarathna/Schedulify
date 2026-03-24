/**
 * AUTHENTICATION SYSTEM USAGE GUIDE
 * ===================================
 *
 * This file demonstrates how to use the authentication system
 * in various components throughout the Schedulify application.
 *
 * DELETE THIS FILE WHEN YOU'RE DONE IMPLEMENTING REAL COMPONENTS
 */

/**
 * ============================================================================
 * EXAMPLE 1: Using Authentication in a Component
 * ============================================================================
 * The useAuth hook provides access to authentication state and methods
 */

// import { useAuth } from "../hooks/useAuth";
//
// export function MyComponent() {
//   const { user, isAuthenticated, login, logout, error } = useAuth();
//
//   if (!isAuthenticated) {
//     return <div>Please log in</div>;
//   }
//
//   return (
//     <div>
//       <p>Welcome, {user.email}</p>
//       <button onClick={() => logout()}>Logout</button>
//     </div>
//   );
// }

/**
 * ============================================================================
 * EXAMPLE 2: Login Form
 * ============================================================================
 * Using the login method with form submission
 */

// import { useState } from "react";
// import { useAuth } from "../hooks/useAuth";
// import { useNavigate } from "react-router-dom";
//
// export function LoginForm() {
//   const { login, error, isLoading } = useAuth();
//   const navigate = useNavigate();
//   const [credentials, setCredentials] = useState({ email: "", password: "" });
//
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await login(credentials.email, credentials.password);
//       // Navigate to dashboard on successful login
//       navigate("/dashboard");
//     } catch (err) {
//       // Error is already stored in authentication context
//       console.error("Login failed:", err);
//     }
//   };
//
//   return (
//     <form onSubmit={handleSubmit}>
//       <input
//         type="email"
//         value={credentials.email}
//         onChange={(e) =>
//           setCredentials({ ...credentials, email: e.target.value })
//         }
//         placeholder="Email"
//       />
//       <input
//         type="password"
//         value={credentials.password}
//         onChange={(e) =>
//           setCredentials({ ...credentials, password: e.target.value })
//         }
//         placeholder="Password"
//       />
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       <button type="submit" disabled={isLoading}>
//         {isLoading ? "Logging in..." : "Login"}
//       </button>
//     </form>
//   );
// }

/**
 * ============================================================================
 * EXAMPLE 3: Protected Routes with ProtectedRoute Component
 * ============================================================================
 * Routes that require authentication are wrapped with ProtectedRoute
 */

// import { Route } from "react-router-dom";
// import ProtectedRoute from "../components/ProtectedRoute";
// import Dashboard from "../pages/Dashboard/Dashboard";
// import AdminPanel from "../pages/Admin/AdminPanel";
//
// <Route
//   path="/dashboard"
//   element={<ProtectedRoute element={<Dashboard />} />}
// />
//
// {/* Admin routes require ADMIN role */}
// <Route
//   path="/admin"
//   element={
//     <ProtectedRoute
//       element={<AdminPanel />}
//       requiredRoles={["ADMIN"]}
//     />
//   }
// />

/**
 * ============================================================================
 * EXAMPLE 4: Conditional Rendering Based on Role
 * ============================================================================
 * Show/hide features based on user role
 */

// import { useAuth } from "../hooks/useAuth";
// import { hasRole, hasAnyRole } from "../utils/tokenHelper";
//
// export function Navigation() {
//   const { user } = useAuth();
//
//   return (
//     <nav>
//       <a href="/dashboard">Dashboard</a>
//
//       {/* Only show admin link if user has ADMIN role */}
//       {hasRole("ADMIN") && (
//         <a href="/admin">Admin Panel</a>
//       )}
//
//       {/* Show if user has ANY of these roles */}
//       {hasAnyRole(["ADMIN", "MODERATOR"]) && (
//         <a href="/manage">Management</a>
//       )}
//     </nav>
//   );
// }

/**
 * ============================================================================
 * EXAMPLE 5: Token Management
 * ============================================================================
 * Advanced token operations using tokenHelper utilities
 */

// import {
//   getToken,
//   getUser,
//   saveAuthData,
//   clearAuthData,
//   isTokenExpired,
//   getUserRole,
// } from "../utils/tokenHelper";
//
// // Check if current token is expired
// if (isTokenExpired(getToken())) {
//   console.log("Token is expired, user needs to re-login");
//   clearAuthData();
// }
//
// // Get user role without loading entire user object
// const role = getUserRole();

/**
 * ============================================================================
 * EXAMPLE 6: Logout Handler
 * ============================================================================
 * Clean logout with navigation
 */

// import { useAuth } from "../hooks/useAuth";
// import { useNavigate } from "react-router-dom";
//
// export function LogoutButton() {
//   const { logout } = useAuth();
//   const navigate = useNavigate();
//
//   const handleLogout = async () => {
//     await logout();
//     // Redirect to login page
//     navigate("/login");
//   };
//
//   return <button onClick={handleLogout}>Logout</button>;
// }

/**
 * ============================================================================
 * EXAMPLE 7: Displaying User Info in Header
 * ============================================================================
 * Show logged-in user information
 */

// import { useAuth } from "../hooks/useAuth";
//
// export function UserProfile() {
//   const { user, isAuthenticated } = useAuth();
//
//   if (!isAuthenticated) return null;
//
//   return (
//     <div className="user-profile">
//       <img
//         src={user.avatar || "/default-avatar.png"}
//         alt={user.name}
//       />
//       <p>{user.name}</p>
//       <p>{user.email}</p>
//       <p className="role-badge">{user.role}</p>
//     </div>
//   );
// }

/**
 * ============================================================================
 * API INTEGRATION WITH AUTH
 * ============================================================================
 * The axios instance automatically includes the token in requests
 */

// import api from "../api/axios";
//
// // Token is automatically added to request headers
// const response = await api.get("/api/bookings");
// // Equivalent to: GET /api/bookings
// //               Authorization: Bearer <token>
//
// // In case of 401 Unauthorized, you might want to logout
// try {
//   const response = await api.get("/api/protected-resource");
// } catch (error) {
//   if (error.response?.status === 401) {
//     // Token is invalid or expired
//     logout();
//     navigate("/login");
//   }
// }

/**
 * ============================================================================
 * IMPORTANT: SETUP CHECKLIST
 * ============================================================================
 *
 * ✅ AuthProvider wraps the entire app (in main.jsx)
 * ✅ Backend API endpoints ready:
 *    - POST /auth/login (returns token and user)
 *    - GET /auth/verify (validates token)
 *    - POST /auth/logout (optional)
 * ✅ User object structure from server includes:
 *    - id (unique identifier)
 *    - email (user email)
 *    - role (ADMIN, USER, etc.)
 *    - name (optional, user's full name)
 * ✅ JWT token decoded should include:
 *    - exp (expiration time in seconds)
 *    - Other standard claims
 *
 * ============================================================================
 */

/**
 * DEBUGGING TIPS
 * ============================================================================
 *
 * Check localStorage:
 * - localStorage.getItem('token')
 * - localStorage.getItem('user')
 *
 * Check context state:
 * - React DevTools -> Components -> AuthContext
 *
 * Add logging to understand flow:
 * - Add console logs in AuthContext.jsx restoreSession()
 * - Add logs in login() and logout()
 *
 * ============================================================================
 */

export default function AuthGuidance() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Authentication System Implementation Guide</h1>
      <p>
        This file contains usage examples. See code comments for implementation
        details. Delete this file when implementing real components.
      </p>
    </div>
  );
}
