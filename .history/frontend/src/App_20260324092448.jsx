import "./App.css";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import Navbar from "./components/layout/Navbar.jsx";

export default function App() {
  const location = useLocation();

  // Hide navbar on auth pages (login, register)
  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/unauthorized";

  return (
    <div className="app min-h-screen bg-slate-50">
      {!hideNavbar && <Navbar />}
      <AppRoutes />
    </div>
  );
}
