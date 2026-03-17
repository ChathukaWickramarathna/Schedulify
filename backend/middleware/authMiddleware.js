const jwt = require("jsonwebtoken");

/**
 * Protect routes by verifying JWT from Authorization header.
 * Expected header format: "Authorization: Bearer <token>"
 */
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ message: "Server misconfiguration: JWT secret missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload to request
    // Example: { id: "...", role: "admin", iat: ..., exp: ... }
    req.user = { id: decoded.id, role: decoded.role };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

module.exports = { protect };

