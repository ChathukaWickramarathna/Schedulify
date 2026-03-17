const User = require("../models/User");
const Booking = require("../models/Booking");
const Service = require("../models/Service");

/**
 * @desc    Get dashboard summary stats
 * @route   GET /api/dashboard/summary
 * @access  Private/Admin,Staff
 *
 * Returns totals and status breakdown in a chart-friendly structure.
 */
const getDashboardSummary = async (req, res) => {
  try {
    // Total users
    const totalUsersPromise = User.countDocuments();

    // Total bookings
    const totalBookingsPromise = Booking.countDocuments();

    // Booking status breakdown
    const statusAggregationPromise = Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Active services
    const activeServicesPromise = Service.countDocuments({ isActive: true });

    const [
      totalUsers,
      totalBookings,
      statusAggregation,
      activeServices,
    ] = await Promise.all([
      totalUsersPromise,
      totalBookingsPromise,
      statusAggregationPromise,
      activeServicesPromise,
    ]);

    // Map status aggregation results into a simple object
    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
    };

    statusAggregation.forEach((item) => {
      if (statusCounts[item._id] !== undefined) {
        statusCounts[item._id] = item.count;
      }
    });

    // Chart-friendly format
    const bookingStatusChart = {
      labels: ["Pending", "Approved", "Rejected", "Cancelled"],
      data: [
        statusCounts.pending,
        statusCounts.approved,
        statusCounts.rejected,
        statusCounts.cancelled,
      ],
    };

    return res.json({
      totals: {
        totalUsers,
        totalBookings,
        activeServices,
      },
      bookingStatus: statusCounts,
      charts: {
        bookingStatusChart,
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching dashboard summary" });
  }
};

module.exports = {
  getDashboardSummary,
};

