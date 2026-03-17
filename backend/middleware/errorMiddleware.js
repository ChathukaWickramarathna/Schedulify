/**
 * Simple error handler middleware (Express).
 * Keeps error responses consistent and beginner-friendly.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err && err.message ? err.message : "Server error",
    // stack is helpful during development; you can hide it in production later
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = { errorHandler };

