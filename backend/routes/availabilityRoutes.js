const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// Import controllers
const {
  getStaffWorkSchedule,
  updateStaffWorkSchedule,
  getStaffUnavailableDates,
  addStaffUnavailableDate,
  deleteStaffUnavailableDate,
  getStaffShifts,
  createStaffShift,
  updateStaffShift,
  deleteStaffShift,
} = require("../controllers/staffAvailabilityController");

const {
  getRoomWorkSchedule,
  updateRoomWorkSchedule,
  getRoomUnavailableDates,
  addRoomUnavailableDate,
  deleteRoomUnavailableDate,
} = require("../controllers/roomAvailabilityController");

// Staff Availability Routes
router.get("/staff/:id/work-schedule", protect, getStaffWorkSchedule);
router.put(
  "/staff/:id/work-schedule",
  protect,
  allowRoles("admin"),
  updateStaffWorkSchedule
);
router.get("/staff/:id/unavailable-dates", protect, getStaffUnavailableDates);
router.post(
  "/staff/:id/unavailable-dates",
  protect,
  allowRoles("admin"),
  addStaffUnavailableDate
);
router.delete(
  "/staff/:id/unavailable-dates/:dateId",
  protect,
  allowRoles("admin"),
  deleteStaffUnavailableDate
);

// Staff Shifts Routes
router.get("/staff-shifts", protect, getStaffShifts);
router.post("/staff-shifts", protect, allowRoles("admin"), createStaffShift);
router.put("/staff-shifts/:id", protect, allowRoles("admin"), updateStaffShift);
router.delete(
  "/staff-shifts/:id",
  protect,
  allowRoles("admin"),
  deleteStaffShift
);

// Room Availability Routes
router.get("/rooms/:id/work-schedule", protect, getRoomWorkSchedule);
router.put(
  "/rooms/:id/work-schedule",
  protect,
  allowRoles("admin"),
  updateRoomWorkSchedule
);
router.get("/rooms/:id/unavailable-dates", protect, getRoomUnavailableDates);
router.post(
  "/rooms/:id/unavailable-dates",
  protect,
  allowRoles("admin"),
  addRoomUnavailableDate
);
router.delete(
  "/rooms/:id/unavailable-dates/:dateId",
  protect,
  allowRoles("admin"),
  deleteRoomUnavailableDate
);

module.exports = router;
