import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import Dashboard from "../pages/Dashboard";
import BookAppointment from "../pages/BookAppointment";
import MyBookings from "../pages/MyBookings";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import ManageServices from "../pages/Admin/ManageServices";
import ManageStaff from "../pages/Admin/ManageStaff";
import ManageRooms from "../pages/Admin/ManageRooms";
import ManageUsers from "../pages/Admin/ManageUsers";

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
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* User - Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute element={<Dashboard />} />
        }
      />
      <Route
        path="/book-appointment"
        element={
          <ProtectedRoute element={<BookAppointment />} />
        }
      />
      <Route
        path="/my-bookings"
        element={<ProtectedRoute element={<MyBookings />} />}
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

