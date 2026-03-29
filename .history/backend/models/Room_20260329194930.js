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
          enum: ["maintenance", "cleaning", "closure", "other"],
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

roomSchema.index({ name: 1 });
roomSchema.index({ "unavailableDates.date": 1 });

module.exports = mongoose.models.Room || mongoose.model("Room", roomSchema);

