const express = require("express");
const Service = require("../models/Service");
const Staff = require("../models/Staff");
const Room = require("../models/Room");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @desc    Get all active services (for booking)
 * @route   GET /api/public/services
 * @access  Private (all authenticated users)
 */
router.get("/services", protect, async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ name: 1 });
    return res.json({ count: services.length, services });
  } catch (error) {
    console.error("Get public services error:", error);
    return res.status(500).json({ message: "Server error while fetching services" });
  }
});

/**
 * @desc    Get all available staff (for booking)
 * @route   GET /api/public/staff
 * @access  Private (all authenticated users)
 */
router.get("/staff", protect, async (req, res) => {
  try {
    const staff = await Staff.find({ isAvailable: true }).sort({ name: 1 });
    return res.json({ count: staff.length, staff });
  } catch (error) {
    console.error("Get public staff error:", error);
    return res.status(500).json({ message: "Server error while fetching staff" });
  }
});

/**
 * @desc    Get all available rooms (for booking)
 * @route   GET /api/public/rooms
 * @access  Private (all authenticated users)
 */
router.get("/rooms", protect, async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true }).sort({ name: 1 });
    return res.json({ count: rooms.length, rooms });
  } catch (error) {
    console.error("Get public rooms error:", error);
    return res.status(500).json({ message: "Server error while fetching rooms" });
  }
});

module.exports = router;
