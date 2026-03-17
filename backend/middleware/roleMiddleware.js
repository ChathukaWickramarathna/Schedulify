/**
 * Role-based authorization middleware.
 * Usage examples:
 * - allowRoles("admin")
 * - allowRoles("admin", "staff")
 */
const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // authMiddleware should run before this so req.user exists
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

module.exports = { allowRoles };

