const express = require("express");

const { getDashboardSummary } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// @route   GET /api/dashboard/summary
// @desc    Get dashboard summary (admin + staff)
router.get(
  "/summary",
  protect,
  allowRoles("admin", "staff"),
  getDashboardSummary
);

module.exports = router;

