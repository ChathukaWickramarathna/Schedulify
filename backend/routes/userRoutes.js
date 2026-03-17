const express = require("express");

const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// All routes here are protected and admin-only
router.use(protect, allowRoles("admin"));

// @route   GET /api/users
// @desc    Get all users
router.get("/", getUsers);

// @route   GET /api/users/:id
// @desc    Get single user by id
router.get("/:id", getUserById);

// @route   PUT /api/users/:id
// @desc    Update user basic details
router.put("/:id", updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
router.delete("/:id", deleteUser);

module.exports = router;

