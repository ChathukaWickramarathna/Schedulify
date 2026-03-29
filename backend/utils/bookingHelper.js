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
 * Validate if a staff member can perform a service
 * This is a placeholder for future implementation where Staff has a services array
 * For now, we assume all staff can perform all services
 * @param {object} staff - Staff document
 * @param {string} serviceId - Service ID to check
 * @returns {boolean} True if staff can perform service
 */
const canStaffPerformService = (staff, serviceId) => {
  // Future implementation: Check if staff.services includes serviceId
  // For now, assume all staff can perform all services
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
  canStaffPerformService,
};

