const Staff = require("../models/Staff");
const StaffShift = require("../models/StaffShift");

/**
 * @desc    Get staff work schedule
 * @route   GET /api/staff/:id/work-schedule
 * @access  Private
 */
const getStaffWorkSchedule = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).select(
      "name email workSchedule"
    );

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    return res.json({
      workSchedule: staff.workSchedule,
    });
  } catch (error) {
    console.error("Get work schedule error:", error);
    return res.status(500).json({
      message: "Server error while fetching work schedule",
      error: error.message,
    });
  }
};

/**
 * @desc    Update staff work schedule
 * @route   PUT /api/staff/:id/work-schedule
 * @access  Private/Admin
 */
const updateStaffWorkSchedule = async (req, res) => {
  try {
    const { workSchedule } = req.body;

    // Validate workSchedule structure
    if (!workSchedule) {
      return res.status(400).json({
        message: "Work schedule data is required.",
      });
    }

    const validDays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    // Validate each day in the schedule
    for (const day of validDays) {
      if (workSchedule[day]) {
        const daySchedule = workSchedule[day];

        if (daySchedule.isWorking) {
          // Validate time format if working
          if (!daySchedule.startTime || !daySchedule.endTime) {
            return res.status(400).json({
              message: `${day}: Start time and end time are required for working days.`,
            });
          }

          // Validate time format (HH:mm)
          const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (
            !timeRegex.test(daySchedule.startTime) ||
            !timeRegex.test(daySchedule.endTime)
          ) {
            return res.status(400).json({
              message: `${day}: Times must be in HH:mm format.`,
            });
          }

          // Validate end time is after start time
          if (daySchedule.endTime <= daySchedule.startTime) {
            return res.status(400).json({
              message: `${day}: End time must be after start time.`,
            });
          }
        }
      }
    }

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { workSchedule },
      { new: true, runValidators: true }
    ).select("name email workSchedule");

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    return res.json({
      message: "Work schedule updated successfully",
      workSchedule: staff.workSchedule,
    });
  } catch (error) {
    console.error("Update work schedule error:", error);
    return res.status(500).json({
      message: "Server error while updating work schedule",
      error: error.message,
    });
  }
};

/**
 * @desc    Get staff unavailable dates
 * @route   GET /api/staff/:id/unavailable-dates
 * @access  Private
 */
const getStaffUnavailableDates = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).select(
      "name email unavailableDates"
    );

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    return res.json({
      unavailableDates: staff.unavailableDates || [],
    });
  } catch (error) {
    console.error("Get unavailable dates error:", error);
    return res.status(500).json({
      message: "Server error while fetching unavailable dates",
      error: error.message,
    });
  }
};

/**
 * @desc    Add unavailable date to staff
 * @route   POST /api/staff/:id/unavailable-dates
 * @access  Private/Admin
 */
const addStaffUnavailableDate = async (req, res) => {
  try {
    const { date, reason, notes } = req.body;

    // Validate required fields
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Validate date is not in the past
    const unavailableDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (unavailableDate < today) {
      return res.status(400).json({
        message: "Cannot add unavailable date in the past.",
      });
    }

    // Validate reason enum
    const validReasons = [
      "holiday",
      "sick_leave",
      "annual_leave",
      "personal",
      "other",
    ];
    if (reason && !validReasons.includes(reason)) {
      return res.status(400).json({
        message: `Invalid reason. Must be one of: ${validReasons.join(", ")}`,
      });
    }

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Check if date already exists
    const dateStr = new Date(unavailableDate).toDateString();
    const exists = staff.unavailableDates.some(
      (ud) => new Date(ud.date).toDateString() === dateStr
    );

    if (exists) {
      return res.status(400).json({
        message: "This date is already marked as unavailable.",
      });
    }

    // Add unavailable date
    staff.unavailableDates.push({
      date: unavailableDate,
      reason: reason || "other",
      notes: notes || "",
    });

    await staff.save();

    return res.status(201).json({
      message: "Unavailable date added successfully",
      unavailableDates: staff.unavailableDates,
    });
  } catch (error) {
    console.error("Add unavailable date error:", error);
    return res.status(500).json({
      message: "Server error while adding unavailable date",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete unavailable date from staff
 * @route   DELETE /api/staff/:id/unavailable-dates/:dateId
 * @access  Private/Admin
 */
const deleteStaffUnavailableDate = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    const dateId = req.params.dateId;
    const initialLength = staff.unavailableDates.length;

    // Remove the unavailable date by ID
    staff.unavailableDates = staff.unavailableDates.filter(
      (ud) => ud._id.toString() !== dateId
    );

    if (staff.unavailableDates.length === initialLength) {
      return res.status(404).json({ message: "Unavailable date not found" });
    }

    await staff.save();

    return res.json({
      message: "Unavailable date deleted successfully",
      unavailableDates: staff.unavailableDates,
    });
  } catch (error) {
    console.error("Delete unavailable date error:", error);
    return res.status(500).json({
      message: "Server error while deleting unavailable date",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all staff shifts for a date range
 * @route   GET /api/staff-shifts?staffId=...&date=...
 * @access  Private
 */
const getStaffShifts = async (req, res) => {
  try {
    const { staffId, date } = req.query;

    const query = {};
    if (staffId) query.staff = staffId;

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const shifts = await StaffShift.find(query)
      .populate("staff", "name email")
      .sort({ date: 1 });

    return res.json({ shifts });
  } catch (error) {
    console.error("Get staff shifts error:", error);
    return res.status(500).json({
      message: "Server error while fetching staff shifts",
      error: error.message,
    });
  }
};

/**
 * @desc    Create staff shift
 * @route   POST /api/staff-shifts
 * @access  Private/Admin
 */
const createStaffShift = async (req, res) => {
  try {
    const { staffId, date, isWorking, startTime, endTime, reason, notes } =
      req.body;

    // Validate required fields
    if (!staffId || !date) {
      return res.status(400).json({
        message: "Staff ID and date are required.",
      });
    }

    // Verify staff exists
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Validate date is not in the past
    const shiftDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (shiftDate < today) {
      return res.status(400).json({
        message: "Cannot create shift for past dates.",
      });
    }

    // If working, validate times
    if (isWorking !== false) {
      if (!startTime || !endTime) {
        return res.status(400).json({
          message: "Start time and end time are required for working shifts.",
        });
      }

      // Validate time format
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return res.status(400).json({
          message: "Times must be in HH:mm format.",
        });
      }

      if (endTime <= startTime) {
        return res.status(400).json({
          message: "End time must be after start time.",
        });
      }
    }

    // Check if shift already exists for this date
    const existingShift = await StaffShift.findOne({
      staff: staffId,
      date: {
        $gte: new Date(shiftDate).setHours(0, 0, 0, 0),
        $lt: new Date(shiftDate).setHours(23, 59, 59, 999),
      },
    });

    if (existingShift) {
      return res.status(400).json({
        message: "A shift already exists for this staff member on this date.",
      });
    }

    const shift = new StaffShift({
      staff: staffId,
      date: shiftDate,
      isWorking: isWorking !== false ? true : false,
      startTime: startTime || "09:00",
      endTime: endTime || "17:00",
      reason: reason || "special_hours",
      notes: notes || "",
    });

    await shift.save();
    await shift.populate("staff", "name email");

    return res.status(201).json({
      message: "Staff shift created successfully",
      shift,
    });
  } catch (error) {
    console.error("Create staff shift error:", error);
    return res.status(500).json({
      message: "Server error while creating staff shift",
      error: error.message,
    });
  }
};

/**
 * @desc    Update staff shift
 * @route   PUT /api/staff-shifts/:id
 * @access  Private/Admin
 */
const updateStaffShift = async (req, res) => {
  try {
    const { isWorking, startTime, endTime, reason, notes } = req.body;

    const shift = await StaffShift.findById(req.params.id);
    if (!shift) {
      return res.status(404).json({ message: "Staff shift not found" });
    }

    // If working, validate times
    if (isWorking !== false) {
      if (!startTime || !endTime) {
        return res.status(400).json({
          message: "Start time and end time are required for working shifts.",
        });
      }

      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return res.status(400).json({
          message: "Times must be in HH:mm format.",
        });
      }

      if (endTime <= startTime) {
        return res.status(400).json({
          message: "End time must be after start time.",
        });
      }
    }

    // Update fields
    if (isWorking !== undefined) shift.isWorking = isWorking;
    if (startTime) shift.startTime = startTime;
    if (endTime) shift.endTime = endTime;
    if (reason) shift.reason = reason;
    if (notes !== undefined) shift.notes = notes;

    await shift.save();
    await shift.populate("staff", "name email");

    return res.json({
      message: "Staff shift updated successfully",
      shift,
    });
  } catch (error) {
    console.error("Update staff shift error:", error);
    return res.status(500).json({
      message: "Server error while updating staff shift",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete staff shift
 * @route   DELETE /api/staff-shifts/:id
 * @access  Private/Admin
 */
const deleteStaffShift = async (req, res) => {
  try {
    const shift = await StaffShift.findByIdAndDelete(req.params.id);

    if (!shift) {
      return res.status(404).json({ message: "Staff shift not found" });
    }

    return res.json({
      message: "Staff shift deleted successfully",
      shiftId: req.params.id,
    });
  } catch (error) {
    console.error("Delete staff shift error:", error);
    return res.status(500).json({
      message: "Server error while deleting staff shift",
      error: error.message,
    });
  }
};

module.exports = {
  getStaffWorkSchedule,
  updateStaffWorkSchedule,
  getStaffUnavailableDates,
  addStaffUnavailableDate,
  deleteStaffUnavailableDate,
  getStaffShifts,
  createStaffShift,
  updateStaffShift,
  deleteStaffShift,
};
