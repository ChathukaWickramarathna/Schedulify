const mongoose = require("mongoose");

/**
 * Service model
 * - Represents an appointment/service type (e.g., Consultation, Haircut, Meeting)
 * - duration is stored in minutes for simplicity
 */
const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
    duration: {
      type: Number, // minutes
      required: [true, "Duration is required"],
      min: [5, "Duration must be at least 5 minutes"],
      max: [480, "Duration must be less than 8 hours"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

serviceSchema.index({ name: 1 });

module.exports =
  mongoose.models.Service || mongoose.model("Service", serviceSchema);

