import { Navigate, Route, Routes } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { hasRole } from "../utils/tokenHelper";
import ProtectedRoute from "../components/ProtectedRoute";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import Dashboard from "../pages/Dashboard";
import BookAppointment from "../pages/BookAppointment";
import MyBookings from "../pages/MyBookings";
import StaffDashboard from "../pages/Staff/StaffDashboard";
import ManageBookings from "../pages/Staff/ManageBookings";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import ManageServices from "../pages/Admin/ManageServices";
import ManageStaff from "../pages/Admin/ManageStaff";
import ManageRooms from "../pages/Admin/ManageRooms";
import ManageUsers from "../pages/Admin/ManageUsers";
import StaffAvailabilityManagement from "../pages/Admin/StaffAvailabilityManagement";
import RoomAvailabilityManagement from "../pages/Admin/RoomAvailabilityManagement";

// Smart Home Redirect Component
const HomeRedirect = () => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  if (hasRole("ADMIN")) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (hasRole("STAFF")) {
    return <Navigate to="/staff/dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />; // USER
};

// Route placeholders (real pages will be created later)
const Placeholder = ({ title }) => {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 8 }}>{title}</h2>
      <p style={{ margin: 0, opacity: 0.8 }}>
        This page will be implemented next.
      </p>
    </div>
  );
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* User - Protected Routes (Only for USER role, not STAFF/ADMIN) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            element={<Dashboard />}
            requiredRoles={["USER"]}
            strictRoles={true}
          />
        }
      />
      <Route
        path="/book-appointment"
        element={
          <ProtectedRoute
            element={<BookAppointment />}
            requiredRoles={["USER"]}
            strictRoles={true}
          />
        }
      />
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute
            element={<MyBookings />}
            requiredRoles={["USER"]}
            strictRoles={true}
          />
        }
      />

      {/* Staff - Protected Routes with Role Check */}
      <Route
        path="/staff/dashboard"
        element={
          <ProtectedRoute
            element={<StaffDashboard />}
            requiredRoles={["STAFF", "ADMIN"]}
          />
        }
      />
      <Route
        path="/staff/manage-bookings"
        element={
          <ProtectedRoute
            element={<ManageBookings />}
            requiredRoles={["STAFF", "ADMIN"]}
          />
        }
      />

      {/* Admin - Protected Routes with Role Check */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute
            element={<AdminDashboard />}
            requiredRoles={["ADMIN"]}
          />
        }
      />
      <Route
        path="/admin/services"
        element={
          <ProtectedRoute
            element={<ManageServices />}
            requiredRoles={["ADMIN"]}
          />
        }
      />
      <Route
        path="/admin/staff"
        element={
          <ProtectedRoute
            element={<ManageStaff />}
            requiredRoles={["ADMIN"]}
          />
        }
      />
      <Route
        path="/admin/rooms"
        element={
          <ProtectedRoute
            element={<ManageRooms />}
            requiredRoles={["ADMIN"]}
          />
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute
            element={<ManageUsers />}
            requiredRoles={["ADMIN"]}
          />
        }
      />
      <Route
        path="/admin/staff-availability"
        element={
          <ProtectedRoute
            element={<StaffAvailabilityManagement />}
            requiredRoles={["ADMIN"]}
          />
        }
      />
      <Route
        path="/admin/room-availability"
        element={
          <ProtectedRoute
            element={<RoomAvailabilityManagement />}
            requiredRoles={["ADMIN"]}
          />
        }
      />
      {/* Legacy admin resource route - redirect to dashboard */}
      <Route
        path="/admin/resources"
        element={<Navigate to="/admin/dashboard" replace />}
      />

      {/* Access */}
      <Route
        path="/unauthorized"
        element={<UnauthorizedPage />}
      />

      {/* Fallback */}
      <Route path="*" element={<Placeholder title="Not Found" />} />
    </Routes>
  );
}

