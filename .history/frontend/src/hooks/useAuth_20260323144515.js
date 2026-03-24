/**
 * useAuth Custom Hook
 * Provides convenient access to authentication context
 * Simplifies usage in components without needing to import AuthContext directly
 */

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Custom hook to use Auth context
 * Throws error if used outside of AuthProvider
 *
 * @returns {object} Auth context with user, token, isAuthenticated, etc.
 *
 * Usage in components:
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export default useAuth;
