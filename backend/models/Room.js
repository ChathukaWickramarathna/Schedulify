const mongoose = require("mongoose");

/**
 * Room model
 * - Represents physical rooms/resources that can be booked
 */
const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
      maxlength: 120,
    },
    location: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },
    capacity: {
      type: Number,
      default: 1,
      min: [1, "Capacity must be at least 1"],
      max: [500, "Capacity is too large"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

roomSchema.index({ name: 1 });

module.exports = mongoose.models.Room || mongoose.model("Room", roomSchema);

