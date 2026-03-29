const mongoose = require("mongoose");

/**
 * StaffShift model
 * - Represents special working hours for a specific date
 * - Overrides the default workSchedule for that day
 * - Used for special shifts, half-days, extended hours, etc.
 */
const staffShiftSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    isWorking: {
      type: Boolean,
      default: true,
    },
    startTime: {
      type: String, // "HH:mm"
      default: "09:00",
    },
    endTime: {
      type: String, // "HH:mm"
      default: "17:00",
    },
    reason: {
      type: String,
      enum: ["special_hours", "extended_hours", "half_day", "training", "other"],
      default: "special_hours",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Composite index for common queries: find shifts for a specific staff on a specific date
staffShiftSchema.index({ staff: 1, date: 1 });
// Index for querying all shifts for a date range
staffShiftSchema.index({ date: 1, staff: 1 });

module.exports =
  mongoose.models.StaffShift || mongoose.model("StaffShift", staffShiftSchema);
