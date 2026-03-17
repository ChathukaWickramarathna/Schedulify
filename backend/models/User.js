const mongoose = require("mongoose");

/**
 * User model
 * - Stores login credentials and role for role-based access
 * - Password should be hashed before saving (we’ll do that in auth logic later)
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // important: don’t return password by default in queries
    },
    role: {
      type: String,
      enum: ["admin", "staff", "user"],
      default: "user",
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Helps fast lookups and ensures unique emails at DB level
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);

