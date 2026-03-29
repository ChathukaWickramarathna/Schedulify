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
    workSchedule: {
      monday: {
        isWorking: { type: Boolean, default: true },
        startTime: { type: String, default: "09:00" }, // "HH:mm"
        endTime: { type: String, default: "17:00" },
      },
      tuesday: {
        isWorking: { type: Boolean, default: true },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "17:00" },
      },
      wednesday: {
        isWorking: { type: Boolean, default: true },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "17:00" },
      },
      thursday: {
        isWorking: { type: Boolean, default: true },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "17:00" },
      },
      friday: {
        isWorking: { type: Boolean, default: true },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "17:00" },
      },
      saturday: {
        isWorking: { type: Boolean, default: false },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "17:00" },
      },
      sunday: {
        isWorking: { type: Boolean, default: false },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "17:00" },
      },
    },
    unavailableDates: [
      {
        date: {
          type: Date,
          required: true,
        },
        reason: {
          type: String,
          enum: ["holiday", "sick_leave", "annual_leave", "personal", "other"],
          default: "other",
        },
        notes: {
          type: String,
          trim: true,
          default: "",
        },
      },
    ],
  },
  { timestamps: true }
);

staffSchema.index({ email: 1 }, { unique: true });
staffSchema.index({ "unavailableDates.date": 1 });

module.exports = mongoose.models.Staff || mongoose.model("Staff", staffSchema);

