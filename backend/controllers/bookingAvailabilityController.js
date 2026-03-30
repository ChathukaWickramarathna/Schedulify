const Booking = require("../models/Booking");
const Staff = require("../models/Staff");
const StaffShift = require("../models/StaffShift");
const Service = require("../models/Service");
const { timeStringToMinutes, isTimeOverlap, isStaffAvailableOnDate } = require("../utils/bookingHelper");

/**
 * @desc    Get available dates for a staff member and service
 * @route   GET /api/bookings/available-dates?staffId=xxx&serviceId=yyy&daysAhead=30
 * @access  Private
 */
const getAvailableDates = async (req, res) => {
  try {
    const { staffId, serviceId, daysAhead = 30 } = req.query;

    if (!staffId || !serviceId) {
      return res.status(400).json({
        message: "staffId and serviceId are required",
      });
    }

    // Verify staff exists
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Verify service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Get staff shifts
    const staffShifts = await StaffShift.find({ staff: staffId });

    // Calculate available dates for next N days
    const availableDates = [];
    const unavailableDateReasons = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < parseInt(daysAhead); i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() + i);

      // Check if staff is available on this date
      const availability = isStaffAvailableOnDate(
        staff,
        checkDate,
        "09:00",
        "17:00",
        staffShifts
      );

      if (availability.isAvailable) {
        // Check if there are any time slots available
        const dayOfWeek = checkDate.getDay();
        const dayNames = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ];
        const dayName = dayNames[dayOfWeek];

        // Get work hours for this day
        let workHours = null;
        const specialShift = staffShifts.find(
          (shift) => new Date(shift.date).toDateString() === checkDate.toDateString()
        );

        if (specialShift && specialShift.isWorking) {
          workHours = {
            startTime: specialShift.startTime,
            endTime: specialShift.endTime,
          };
        } else if (staff.workSchedule && staff.workSchedule[dayName] && staff.workSchedule[dayName].isWorking) {
          workHours = {
            startTime: staff.workSchedule[dayName].startTime,
            endTime: staff.workSchedule[dayName].endTime,
          };
        }

        if (workHours) {
          // Get existing bookings for this staff on this date
          // Use proper date range query
          const dateStart = new Date(checkDate);
          dateStart.setHours(0, 0, 0, 0);
          const dateEnd = new Date(checkDate);
          dateEnd.setDate(dateEnd.getDate() + 1);
          dateEnd.setHours(0, 0, 0, 0);

          const existingBookings = await Booking.find({
            assignedStaff: staffId,
            date: {
              $gte: dateStart,
              $lt: dateEnd,
            },
            status: { $in: ["pending", "approved"] },
          });

          // Check if any time slots are available
          const hasAvailableSlot = generateTimeSlots(
            workHours.startTime,
            workHours.endTime,
            service.duration,
            existingBookings
          ).length > 0;

          if (hasAvailableSlot) {
            availableDates.push(checkDate.toISOString().split("T")[0]);
          }
        }
      } else {
        unavailableDateReasons[checkDate.toISOString().split("T")[0]] =
          availability.reason;
      }
    }

    return res.json({
      availableDates,
      unavailableDateReasons,
      serviceDuration: service.duration,
    });
  } catch (error) {
    console.error("Get available dates error:", error);
    return res.status(500).json({
      message: "Server error while fetching available dates",
      error: error.message,
    });
  }
};

/**
 * @desc    Get available time slots for a staff member on a specific date
 * @route   GET /api/bookings/available-slots?staffId=xxx&date=yyyy-mm-dd&serviceDuration=60
 * @access  Private
 */
const getAvailableSlots = async (req, res) => {
  try {
    const { staffId, date, serviceDuration = 60 } = req.query;

    if (!staffId || !date) {
      return res.status(400).json({
        message: "staffId and date are required",
      });
    }

    // Verify staff exists
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Parse date properly - date comes as "2026-04-01"
    const [year, month, day] = date.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day, 0, 0, 0, 0);

    console.log(`[Available Slots] Staff: ${staff.name}, Date: ${date}, Selected Date: ${selectedDate.toDateString()}`);

    // Get staff shifts and work hours for this date
    const staffShifts = await StaffShift.find({ staff: staffId });
    const dayOfWeek = selectedDate.getDay();
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayName = dayNames[dayOfWeek];

    let workHours = null;
    const specialShift = staffShifts.find(
      (shift) => new Date(shift.date).toDateString() === selectedDate.toDateString()
    );

    if (specialShift && specialShift.isWorking) {
      workHours = {
        startTime: specialShift.startTime,
        endTime: specialShift.endTime,
      };
      console.log(`[Available Slots] Using special shift: ${workHours.startTime} - ${workHours.endTime}`);
    } else if (staff.workSchedule && staff.workSchedule[dayName] && staff.workSchedule[dayName].isWorking) {
      workHours = {
        startTime: staff.workSchedule[dayName].startTime,
        endTime: staff.workSchedule[dayName].endTime,
      };
      console.log(`[Available Slots] Using work schedule for ${dayName}: ${workHours.startTime} - ${workHours.endTime}`);
    }

    if (!workHours) {
      console.log(`[Available Slots] Staff not working on ${dayName}`);
      return res.json({
        date: date,
        staffWorkHours: null,
        availableSlots: [],
        message: "Staff is not working on this date",
      });
    }

    // Get existing bookings for this staff on this date
    // Create date range: from start of day to end of day
    const dateStart = new Date(year, month - 1, day, 0, 0, 0, 0);
    const dateEnd = new Date(year, month - 1, day, 23, 59, 59, 999);

    console.log(`[Available Slots] Querying bookings between ${dateStart.toISOString()} and ${dateEnd.toISOString()}`);

    // Query using date string matching instead of date range to avoid timezone issues
    const existingBookings = await Booking.find({
      assignedStaff: staffId,
      date: {
        $gte: dateStart,
        $lte: dateEnd,
      },
      status: { $in: ["pending", "approved"] },
    }).lean(); // Use lean() for faster query since we only read the data

    console.log(`[Available Slots] Found ${existingBookings.length} existing bookings`);
    existingBookings.forEach((b, idx) => {
      console.log(`  [${idx}] Date: ${new Date(b.date).toDateString()}, Time: ${b.startTime}-${b.endTime} (${b.status})`);
    });

    // Generate available time slots
    const availableSlots = generateTimeSlots(
      workHours.startTime,
      workHours.endTime,
      parseInt(serviceDuration),
      existingBookings
    );

    console.log(`[Available Slots] Generated ${availableSlots.length} available slots`);
    if (availableSlots.length > 0) {
      availableSlots.slice(0, 5).forEach((s) => {
        console.log(`  - Slot: ${s.startTime}-${s.endTime}`);
      });
    }

    return res.json({
      date: date,
      staffWorkHours: workHours,
      availableSlots,
    });
  } catch (error) {
    console.error("Get available slots error:", error);
    return res.status(500).json({
      message: "Server error while fetching available slots",
      error: error.message,
    });
  }
};

/**
 * Helper function to generate available time slots
 * @param {string} startTime - Work start time "HH:mm"
 * @param {string} endTime - Work end time "HH:mm"
 * @param {number} duration - Service duration in minutes
 * @param {array} existingBookings - Array of existing bookings
 * @returns {array} Array of available slots {startTime, endTime}
 */
const generateTimeSlots = (startTime, endTime, duration, existingBookings = []) => {
  const slots = [];
  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = timeStringToMinutes(endTime);
  const durationInMinutes = parseInt(duration) || 60;

  // Generate 30-minute interval slots
  for (let minutes = startMinutes; minutes + durationInMinutes <= endMinutes; minutes += 30) {
    const slotStart = minutes;
    const slotEnd = minutes + durationInMinutes;

    // Convert back to HH:mm format
    const slotStartHours = Math.floor(slotStart / 60);
    const slotStartMins = slotStart % 60;
    const slotStartTime = `${String(slotStartHours).padStart(2, "0")}:${String(
      slotStartMins
    ).padStart(2, "0")}`;

    const slotEndHours = Math.floor(slotEnd / 60);
    const slotEndMins = slotEnd % 60;
    const slotEndTime = `${String(slotEndHours).padStart(2, "0")}:${String(
      slotEndMins
    ).padStart(2, "0")}`;

    // Check if this slot conflicts with any existing booking
    const hasConflict = existingBookings.some((booking) =>
      isTimeOverlap(slotStartTime, slotEndTime, booking.startTime, booking.endTime)
    );

    if (!hasConflict) {
      slots.push({
        startTime: slotStartTime,
        endTime: slotEndTime,
      });
    }
  }

  return slots;
};

module.exports = {
  getAvailableDates,
  getAvailableSlots,
};
