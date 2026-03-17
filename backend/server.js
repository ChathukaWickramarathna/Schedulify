const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect database
connectDB();

// Root route (health check)
app.get("/", (req, res) => {
  res.send("Schedulify API is running...");
});

// Auth routes
app.use("/api/auth", authRoutes);
// User management routes (admin)
app.use("/api/users", userRoutes);

// Custom error handler (should be after routes)
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});