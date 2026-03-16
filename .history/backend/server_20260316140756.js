const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

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

// Placeholder route imports (we will add these modules later)
// Example:
// const authRoutes = require("./routes/authRoutes");
// app.use("/api/auth", authRoutes);

// Error middleware placeholder (optional)
// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(500).json({ message: "Server error" });
// });

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});