/**
 * Convert a "HH:mm" time string into minutes from midnight.
 */
const timeStringToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Check if two time ranges on the same day overlap.
 * Assumes times are "HH:mm" strings.
 */
const isTimeOverlap = (startA, endA, startB, endB) => {
  const aStart = timeStringToMinutes(startA);
  const aEnd = timeStringToMinutes(endA);
  const bStart = timeStringToMinutes(startB);
  const bEnd = timeStringToMinutes(endB);

  // Overlap if both ranges intersect
  return aStart < bEnd && bStart < aEnd;
};

/**
 * Business hours configuration
 * Default: 09:00 to 17:00 (9 AM to 5 PM)
 */
const BUSINESS_HOURS = {
  startTime: "09:00",
  endTime: "17:00",
};

/**
 * Validate if a time slot is within business hours
 * @param {string} startTime - "HH:mm" format
 * @param {string} endTime - "HH:mm" format
 * @returns {object} { isValid: boolean, message?: string }
 */
const isWithinBusinessHours = (startTime, endTime) => {
  const businessStart = timeStringToMinutes(BUSINESS_HOURS.startTime);
  const businessEnd = timeStringToMinutes(BUSINESS_HOURS.endTime);
  const slotStart = timeStringToMinutes(startTime);
  const slotEnd = timeStringToMinutes(endTime);

  if (slotStart < businessStart) {
    return {
      isValid: false,
      message: `Appointments cannot start before business hours (${BUSINESS_HOURS.startTime}). Please select a later start time.`,
    };
  }

  if (slotEnd > businessEnd) {
    return {
      isValid: false,
      message: `Appointments cannot end after business hours (${BUSINESS_HOURS.endTime}). Please select an earlier end time.`,
    };
  }

  return { isValid: true };
};

/**
 * Check if a proposed booking conflicts with existing bookings
 * for a specific room or staff member on the same date.
 *
 * - bookingModel: Mongoose Booking model
 * - options: { date, startTime, endTime, roomId, staffId, excludeBookingId }
 */
const hasBookingConflict = async (bookingModel, options) => {
  const { date, startTime, endTime, roomId, staffId, excludeBookingId } =
    options;

  // We only need to check conflicts if room or staff is specified
  const orConditions = [];
  if (roomId) {
    orConditions.push({ room: roomId });
  }
  if (staffId) {
    orConditions.push({ assignedStaff: staffId });
  }

  if (orConditions.length === 0) {
    // No room or staff specified, so we treat as no conflict for now
    return false;
  }

  const query = {
    date,
    status: { $in: ["pending", "approved"] }, // bookings that "block" a slot
    $or: orConditions,
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const existingBookings = await bookingModel.find(query);

  // Check in memory for overlapping time ranges
  const hasConflict = existingBookings.some((booking) =>
    isTimeOverlap(startTime, endTime, booking.startTime, booking.endTime)
  );

  return hasConflict;
};

/**
 * Calculate duration in minutes between two "HH:mm" time strings
 * @param {string} startTime - "HH:mm" format
 * @param {string} endTime - "HH:mm" format
 * @returns {number} Duration in minutes
 */
const calculateTimeSlotDuration = (startTime, endTime) => {
  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = timeStringToMinutes(endTime);
  return endMinutes - startMinutes;
};

/**
 * Validate if a service duration fits in the available time slot
 * @param {number} serviceDuration - Duration in minutes from service
 * @param {string} startTime - Slot start time "HH:mm"
 * @param {string} endTime - Slot end time "HH:mm"
 * @returns {object} { fits: boolean, message?: string, slotDuration?: number }
 */
const validateServiceDurationFits = (serviceDuration, startTime, endTime) => {
  const slotDuration = calculateTimeSlotDuration(startTime, endTime);

  if (serviceDuration > slotDuration) {
    const durationHours = Math.floor(slotDuration / 60);
    const durationMinutes = slotDuration % 60;
    const serviceHours = Math.floor(serviceDuration / 60);
    const serviceMinutes = serviceDuration % 60;

    let availableTimeStr = "";
    if (durationHours > 0) {
      availableTimeStr = `${durationHours}h ${durationMinutes}m`;
    } else {
      availableTimeStr = `${durationMinutes}m`;
    }

    let requiredTimeStr = "";
    if (serviceHours > 0) {
      requiredTimeStr = `${serviceHours}h ${serviceMinutes}m`;
    } else {
      requiredTimeStr = `${serviceMinutes}m`;
    }

    return {
      fits: false,
      message: `The selected service requires ${requiredTimeStr}, but the available time slot is only ${availableTimeStr} (${startTime}-${endTime}). Please select a service with shorter duration or adjust the time slot.`,
    };
  }

  return { fits: true, slotDuration };
};

/**
 * Validate time format "HH:mm"
 * @param {string} timeStr - Time string to validate
 * @returns {object} { isValid: boolean, message?: string }
 */
const isValidTimeFormat = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") {
    return {
      isValid: false,
      message: "Time must be a valid string.",
    };
  }

  // Check HH:mm format
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(timeStr)) {
    return {
      isValid: false,
      message: "Time must be in HH:mm format (e.g., 14:00, 09:30).",
    };
  }

  return { isValid: true };
};

/**
 * Validate date format and ensure it's a valid date
 * @param {string} dateStr - Date string to validate (ISO format or YYYY-MM-DD)
 * @returns {object} { isValid: boolean, message?: string }
 */
const isValidDateFormat = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") {
    return {
      isValid: false,
      message: "Date must be a valid string.",
    };
  }

  // Accept ISO format (2026-03-30) or ISO full (2026-03-30T...)
  const dateRegex = /^\d{4}-\d{2}-\d{2}/;
  if (!dateRegex.test(dateStr)) {
    return {
      isValid: false,
      message: "Date must be in YYYY-MM-DD format (e.g., 2026-03-30).",
    };
  }

  // Try parsing to ensure it's a valid date
  const parsedDate = new Date(dateStr);
  if (isNaN(parsedDate.getTime())) {
    return {
      isValid: false,
      message: "Date is not a valid date. Please select a valid date.",
    };
  }

  return { isValid: true };
};

/**
 * Validate if a service duration can fit within business hours
 * @param {number} serviceDuration - Duration in minutes
 * @returns {object} { canFit: boolean, message?: string }
 */
const validateServiceDurationWithinBusinessHours = (serviceDuration) => {
  const businessStart = timeStringToMinutes(BUSINESS_HOURS.startTime);
  const businessEnd = timeStringToMinutes(BUSINESS_HOURS.endTime);
  const availableTime = businessEnd - businessStart;

  if (serviceDuration > availableTime) {
    const hoursNeeded = Math.floor(serviceDuration / 60);
    const minutesNeeded = serviceDuration % 60;
    let durationStr = `${hoursNeeded}h ${minutesNeeded}m`;

    const businessHours = Math.floor(availableTime / 60);
    const businessMins = availableTime % 60;
    let availableStr = `${businessHours}h ${businessMins}m`;

    return {
      canFit: false,
      message: `This service requires ${durationStr}, but business hours only provide ${availableStr} (${BUSINESS_HOURS.startTime}-${BUSINESS_HOURS.endTime}). This service cannot be scheduled within business hours.`,
    };
  }

  return { canFit: true };
};

/**
 * Validate if a staff member can perform a service
 * This checks if staff has the service in their services array
 * @param {object} staff - Staff document
 * @param {string} serviceId - Service ID to check
 * @returns {boolean} True if staff can perform service
 */
const canStaffPerformService = (staff, serviceId) => {
  if (!staff || !serviceId) {
    return true;
  }
  // If staff has a services array, check if service is included
  if (staff.services && Array.isArray(staff.services)) {
    return staff.services.some(
      (s) => s.toString() === serviceId.toString()
    );
  }
  // Default: allow (assume all staff can do all services)
  return true;
};

module.exports = {
  timeStringToMinutes,
  isTimeOverlap,
  hasBookingConflict,
  isWithinBusinessHours,
  BUSINESS_HOURS,
  calculateTimeSlotDuration,
  validateServiceDurationFits,
  validateServiceDurationWithinBusinessHours,
  canStaffPerformService,
  isValidTimeFormat,
  isValidDateFormat,
};

