/**
 * Unauthorized Access Page
 * Displayed when user is authenticated but lacks required permissions
 * Features modern UI with gradient background and helpful navigation
 */

import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Access Denied Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full border border-red-500/30">
            <svg
              className="w-12 h-12 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-4xl font-bold text-white mb-2">Access Denied</h1>

        {/* Error Message */}
        <p className="text-slate-400 mb-2 text-lg">
          You don't have permission to access this page.
        </p>

        {/* User Info */}
        {user && (
          <p className="text-slate-500 text-sm mb-8">
            Logged in as: <span className="text-blue-400 font-medium">{user.email}</span>
            <br />
            Role: <span className="text-yellow-400 font-medium">{user.role || "USER"}</span>
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4-4m-4 4L9 5"
              />
            </svg>
            Go to Dashboard
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-medium rounded-lg transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Go Back
          </button>
        </div>

        {/* Contact Support */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <p className="text-slate-500 text-sm mb-4">
            Need access to this resource?
          </p>
          <Link
            to="/contact-support"
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
          >
            Contact support for assistance →
          </Link>
        </div>
      </div>
    </div>
  );
}
