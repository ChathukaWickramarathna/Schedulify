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

module.exports = {
  timeStringToMinutes,
  isTimeOverlap,
  hasBookingConflict,
};

