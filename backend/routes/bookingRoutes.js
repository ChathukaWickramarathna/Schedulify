const express = require("express");

const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBooking,
  deleteBooking,
  cancelBooking,
  approveBooking,
  rejectBooking,
  getAvailableSlots,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles, denyRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Get available slots must be defined before routes with :id
// @route   GET /api/bookings/available-slots
router.get("/available-slots", protect, getAvailableSlots);

// @route   POST /api/bookings (Only users can create bookings, not staff/admin)
router.post("/", protect, allowRoles("user"), createBooking);

// @route   GET /api/bookings/my (Only users can see their own bookings)
router.get("/my", protect, allowRoles("user"), getMyBookings);

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

// @route   PUT /api/bookings/:id
router.put("/:id", protect, updateBooking);

// @route   DELETE /api/bookings/:id
router.delete("/:id", protect, allowRoles("admin", "staff"), deleteBooking);

module.exports = router;

