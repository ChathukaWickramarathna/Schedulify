const mongoose = require("mongoose");

/**
 * Staff model
 * - Represents staff members who can be assigned to bookings
 * - Separate from User for simplicity (you can link them later if you want)
 */
const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Staff name is required"],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Staff email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    specialization: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

staffSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.models.Staff || mongoose.model("Staff", staffSchema);

