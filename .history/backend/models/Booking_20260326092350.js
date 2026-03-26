const mongoose = require("mongoose");

/**
 * Booking model
 * - References: User, Service, Staff, Room
 * - Stores date and time range for an appointment
 * - status tracks approval flow (pending -> approved/rejected/cancelled)
 *
 * Note: Preventing *overlapping* bookings is best handled in service logic
 * (conflict detection query). This schema adds basic indexing to help.
 */
const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
      index: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String, // "HH:mm"
      required: true,
    },
    endTime: {
      type: String, // "HH:mm"
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

// Basic validation: endTime should be after startTime (string compare works for "HH:mm" format)
bookingSchema.pre("validate", function () {
  if (this.startTime && this.endTime && this.endTime <= this.startTime) {
    this.invalidate("endTime", "endTime must be after startTime");
  }
});

/**
 * Helpful indexes for common queries + faster conflict checks.
 * These do NOT fully prevent overlaps by themselves, but they speed up checks.
 */
bookingSchema.index({ date: 1, room: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ date: 1, assignedStaff: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ status: 1, date: 1 });

module.exports =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

