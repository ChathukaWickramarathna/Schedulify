/**
 * Authentication Context
 * Provides global authentication state and methods to the entire application
 * Handles user login/logout, token management, and state persistence
 */

import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  saveAuthData,
  getToken,
  getUser,
  clearAuthData,
  isTokenExpired,
} from "../utils/tokenHelper";

/**
 * Create Auth Context with default values
 */
export const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  logout: () => {},
  restoreSession: async () => {},
  clearError: () => {},
});

/**
 * Auth Context Provider Component
 * Wraps the entire app to provide auth state and methods
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Restore authentication session from localStorage on app load
   * This allows users to stay logged in after page refresh
   */
  const restoreSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const storedToken = getToken();
      const storedUser = getUser();

      // If no token or user stored, session is empty
      if (!storedToken || !storedUser) {
        setToken(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Check if token is expired
      if (isTokenExpired(storedToken)) {
        clearAuthData();
        setToken(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Verify token is still valid on the server
      try {
        const response = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (response.data.user) {
          setToken(storedToken);
          setUser(storedUser);
        } else {
          clearAuthData();
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        // If verification fails, clear auth
        clearAuthData();
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error("Session restoration failed:", err);
      setError("Session restoration failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Log in user with email and password
   * Stores token and user in localStorage
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Resolves if login successful, rejects if failed
   */
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await api.post("/auth/login", { email, password });

      const { token: newToken, user: userData } = response.data;

      if (newToken && userData) {
        // Store in localStorage for persistence
        saveAuthData(newToken, userData);

        // Update context state
        setToken(newToken);
        setUser(userData);

        return { success: true, user: userData };
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Login failed";
      setError(errorMessage);
      setToken(null);
      setUser(null);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Log out user
   * Clears token, user, and localStorage
   * Can optionally notify the server
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);

      // Notify server of logout (optional - for audit trails)
      try {
        await api.post("/auth/logout");
      } catch (err) {
        console.warn("Logout notification failed, clearing locally anyway");
      }

      // Clear everything
      clearAuthData();
      setToken(null);
      setUser(null);
      setError(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Restore session when component mounts
   * This ensures user stays logged in after page refresh
   */
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /**
   * Prepare context value
   */
  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    error,
    login,
    logout,
    restoreSession,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
