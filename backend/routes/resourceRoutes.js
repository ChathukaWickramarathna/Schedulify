const express = require("express");

const {
  // services
  createService,
  getServices,
  updateService,
  deleteService,
  // staff
  createStaff,
  getStaff,
  updateStaff,
  deleteStaff,
  // rooms
  createRoom,
  getRooms,
  updateRoom,
  deleteRoom,
} = require("../controllers/resourceController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// All routes in this module are protected and admin-only
router.use(protect, allowRoles("admin"));

// -------- Services --------
router.post("/services", createService);
router.get("/services", getServices);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);

// -------- Staff --------
router.post("/staff", createStaff);
router.get("/staff", getStaff);
router.put("/staff/:id", updateStaff);
router.delete("/staff/:id", deleteStaff);

// -------- Rooms --------
router.post("/rooms", createRoom);
router.get("/rooms", getRooms);
router.put("/rooms/:id", updateRoom);
router.delete("/rooms/:id", deleteRoom);

module.exports = router;

