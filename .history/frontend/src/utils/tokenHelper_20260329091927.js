/**
 * Token Management Utilities
 * Handles all token-related operations like storing, retrieving, and validating tokens
 */

const TOKEN_KEY = "token";
const USER_KEY = "user";

/**
 * Store token and user data in localStorage
 * @param {string} token - JWT token from server
 * @param {object} user - User object with id, email, role, etc.
 */
export const saveAuthData = (token, user) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Failed to save auth data:", error);
  }
};

/**
 * Retrieve token from localStorage
 * @returns {string|null} - Token or null if not found
 */
export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("Failed to retrieve token:", error);
    return null;
  }
};

/**
 * Retrieve user data from localStorage
 * @returns {object|null} - User object or null if not found
 */
export const getUser = () => {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Failed to retrieve user:", error);
    return null;
  }
};

/**
 * Clear token and user data from localStorage
 * Called during logout
 */
export const clearAuthData = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error("Failed to clear auth data:", error);
  }
};

/**
 * Check if token exists and is valid
 * @returns {boolean} - True if token exists, false otherwise
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Decode JWT token to get payload (without verification)
 * Note: This doesn't verify the token signature. Verification happens on the server.
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired, false otherwise
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    // Convert exp (in seconds) to milliseconds and compare with current time
    const expirationTime = decoded.exp * 1000;
    return Date.now() >= expirationTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get user role from stored user data
 * @returns {string|null} - User role or null
 */
export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

/**
 * Check if user has a specific role
 * @param {string} requiredRole - Role to check
 * @returns {boolean} - True if user has the role
 */
export const hasRole = (requiredRole) => {
  const userRole = getUserRole();
  // Case-insensitive comparison (backend uses lowercase, frontend might use uppercase)
  return userRole?.toLowerCase() === requiredRole?.toLowerCase();
};

/**
 * Check if user has any of the specified roles
 * @param {string[]} roles - Array of roles to check
 * @returns {boolean} - True if user has any of the roles
 */
export const hasAnyRole = (roles) => {
  const userRole = getUserRole();
  if (!Array.isArray(roles) || !userRole) return false;
  // Case-insensitive comparison
  return roles.some(role => role?.toLowerCase() === userRole?.toLowerCase());
};
