const express = require("express");

const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   POST /api/auth/register
router.post("/register", registerUser);

// @route   POST /api/auth/login
router.post("/login", loginUser);

// @route   GET /api/auth/me
router.get("/me", protect, getMe);

// @route   POST /api/auth/logout
// @desc    Logout user (client-side - just return success)
router.post("/logout", protect, (req, res) => {
  // For JWT, logout is handled client-side by removing token
  // This endpoint just confirms the action
  res.json({ message: "Logged out successfully" });
});

module.exports = router;

