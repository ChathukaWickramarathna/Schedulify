const jwt = require("jsonwebtoken");

/**
 * Generate JWT token for a user.
 * We include user id + role so protected routes can authorize actions.
 */
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment variables.");
  }

  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = generateToken;

