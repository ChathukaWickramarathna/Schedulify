import { Navigate, Route, Routes } from "react-router-dom";

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
      <Route path="/login" element={<Placeholder title="Login" />} />
      <Route path="/register" element={<Placeholder title="Register" />} />

      {/* User */}
      <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
      <Route
        path="/book-appointment"
        element={<Placeholder title="Book Appointment" />}
      />
      <Route path="/my-bookings" element={<Placeholder title="My Bookings" />} />

      {/* Admin */}
      <Route
        path="/admin/dashboard"
        element={<Placeholder title="Admin Dashboard" />}
      />
      <Route
        path="/admin/resources"
        element={<Placeholder title="Manage Resources" />}
      />

      {/* Access */}
      <Route
        path="/unauthorized"
        element={<Placeholder title="Unauthorized" />}
      />

      {/* Fallback */}
      <Route path="*" element={<Placeholder title="Not Found" />} />
    </Routes>
  );
}

