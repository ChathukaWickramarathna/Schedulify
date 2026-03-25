import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";
import DashboardCard from "../components/DashboardCard";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user's own bookings
      const bookingsRes = await api.get("/bookings/my");
      const bookings = bookingsRes.data.bookings || [];
      setMyBookings(bookings);

      // Calculate user's booking stats
      const userStats = {
        total: bookings.length,
        pending: bookings.filter((b) => b.status === "pending").length,
        approved: bookings.filter((b) => b.status === "approved").length,
        rejected: bookings.filter((b) => b.status === "rejected").length,
        cancelled: bookings.filter((b) => b.status === "cancelled").length,
      };

      setStats(userStats);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Chart data for booking status
  const bookingStatusData = {
    labels: ["Pending", "Approved", "Rejected", "Cancelled"],
    datasets: [
      {
        label: "Bookings",
        data: [
          stats?.pending || 0,
          stats?.approved || 0,
          stats?.rejected || 0,
          stats?.cancelled || 0,
        ],
        backgroundColor: [
          "rgba(251, 191, 36, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(156, 163, 175, 0.8)",
        ],
        borderColor: [
          "rgb(251, 191, 36)",
          "rgb(34, 197, 94)",
          "rgb(239, 68, 68)",
          "rgb(156, 163, 175)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          font: {
            size: 12,
            weight: "600",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Here's an overview of your booking activity
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Total Bookings"
            value={stats?.total || 0}
            subtitle="All time"
            color="blue"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          />

          <DashboardCard
            title="Pending"
            value={stats?.pending || 0}
            subtitle="Awaiting approval"
            color="yellow"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />

          <DashboardCard
            title="Approved"
            value={stats?.approved || 0}
            subtitle="Confirmed bookings"
            color="green"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />

          <DashboardCard
            title="Cancelled"
            value={stats?.cancelled || 0}
            subtitle="Cancelled bookings"
            color="red"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Booking Status Chart */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Status Overview</h3>
            {stats?.total > 0 ? (
              <div className="h-80">
                <Doughnut data={bookingStatusData} options={chartOptions} />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p className="text-lg font-medium">No bookings yet</p>
                  <p className="text-sm mt-1">Create your first booking to see stats</p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Bookings</h3>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {myBookings.slice(0, 5).map((booking) => (
                <div
                  key={booking._id}
                  className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {booking.service?.name?.charAt(0) || "B"}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {booking.service?.name || "Service"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(booking.date).toLocaleDateString()} at {booking.startTime}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold mt-2 ${
                        booking.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}

              {myBookings.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-lg font-medium">No bookings yet</p>
                  <button
                    onClick={() => navigate("/book-appointment")}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                  >
                    Create Your First Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate("/book-appointment")}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left group"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-bold text-gray-900">New Booking</h4>
                <p className="text-sm text-gray-600">Schedule an appointment</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/my-bookings")}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left group"
          >
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-xl group-hover:bg-purple-200 transition-colors">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-bold text-gray-900">My Bookings</h4>
                <p className="text-sm text-gray-600">View all your bookings</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left group"
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-xl group-hover:bg-green-200 transition-colors">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-bold text-gray-900">Profile</h4>
                <p className="text-sm text-gray-600">Manage your account</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
