const express = require("express");

const {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
  approveBooking,
  rejectBooking,
  getAvailableSlots,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Get available slots must be defined before routes with :id
// @route   GET /api/bookings/available-slots
router.get("/available-slots", protect, getAvailableSlots);

// @route   POST /api/bookings
router.post("/", protect, createBooking);

// @route   GET /api/bookings/my
router.get("/my", protect, getMyBookings);

// @route   GET /api/bookings
router.get("/", protect, allowRoles("admin", "staff"), getAllBookings);

// @route   PATCH /api/bookings/:id/cancel
router.patch("/:id/cancel", protect, cancelBooking);

// @route   PATCH /api/bookings/:id/approve
router.patch(
  "/:id/approve",
  protect,
  allowRoles("admin", "staff"),
  approveBooking
);

// @route   PATCH /api/bookings/:id/reject
router.patch(
  "/:id/reject",
  protect,
  allowRoles("admin", "staff"),
  rejectBooking
);

module.exports = router;

