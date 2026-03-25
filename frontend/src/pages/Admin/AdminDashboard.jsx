import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import DashboardCard from "../../components/DashboardCard";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/dashboard/summary");
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError(err.response?.data?.message || "Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const adminCards = [
    {
      title: "Manage Services",
      description: "Add, edit, or remove services offered by your organization",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      link: "/admin/services",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Manage Staff",
      description: "Add, edit, or remove staff members from your team",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      link: "/admin/staff",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Manage Rooms",
      description: "Add, edit, or remove rooms available for bookings",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      link: "/admin/rooms",
      color: "from-green-500 to-teal-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
  ];

  // Chart data for booking status
  const bookingStatusData = stats ? {
    labels: stats.charts?.bookingStatusChart?.labels || [],
    datasets: [
      {
        label: "Bookings",
        data: stats.charts?.bookingStatusChart?.data || [],
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
  } : null;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            System overview and resource management
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <DashboardCard
              title="Total Users"
              value={stats.totals?.totalUsers || 0}
              subtitle="Registered accounts"
              color="indigo"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              }
            />

            <DashboardCard
              title="Total Bookings"
              value={stats.totals?.totalBookings || 0}
              subtitle="All bookings"
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
              title="Pending Bookings"
              value={stats.bookingStatus?.pending || 0}
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
              title="Active Services"
              value={stats.totals?.activeServices || 0}
              subtitle="Available services"
              color="green"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              }
            />
          </div>
        )}

        {/* Charts Section */}
        {stats && bookingStatusData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Booking Status Doughnut Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Status Distribution</h3>
              {stats.totals?.totalBookings > 0 ? (
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
                  </div>
                </div>
              )}
            </div>

            {/* Booking Status Bar Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Status Summary</h3>
              {stats.totals?.totalBookings > 0 ? (
                <div className="h-80">
                  <Bar data={bookingStatusData} options={chartOptions} />
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
                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                      />
                    </svg>
                    <p className="text-lg font-medium">No data to display</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Management Cards */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Resource Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {adminCards.map((card, index) => (
              <Link
                key={index}
                to={card.link}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                <div className={`bg-gradient-to-br ${card.color} p-6 text-white`}>
                  <div className="flex items-center justify-center mb-4">
                    {card.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-center">{card.title}</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-center mb-4">{card.description}</p>
                  <div className="flex items-center justify-center">
                    <span className={`inline-flex items-center px-4 py-2 rounded-lg ${card.bgColor} ${card.textColor} font-semibold text-sm group-hover:scale-110 transition-transform`}>
                      Manage
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="w-10 h-10 text-blue-100"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold mb-3">Administrator Guide</h3>
              <ul className="space-y-2 text-sm opacity-95">
                <li className="flex items-start">
                  <span className="font-semibold mr-2">•</span>
                  <span>
                    <strong>Services:</strong> Define the services your organization provides. Set duration and availability.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">•</span>
                  <span>
                    <strong>Staff:</strong> Add team members who will handle bookings. Include their specialization.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">•</span>
                  <span>
                    <strong>Rooms:</strong> Register physical spaces where services will be provided.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
