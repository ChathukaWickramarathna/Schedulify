const Room = require("../models/Room");

/**
 * @desc    Get room work schedule
 * @route   GET /api/rooms/:id/work-schedule
 * @access  Private
 */
const getRoomWorkSchedule = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).select(
      "name location workSchedule"
    );

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    return res.json({
      workSchedule: room.workSchedule,
    });
  } catch (error) {
    console.error("Get room work schedule error:", error);
    return res.status(500).json({
      message: "Server error while fetching room work schedule",
      error: error.message,
    });
  }
};

/**
 * @desc    Update room work schedule
 * @route   PUT /api/rooms/:id/work-schedule
 * @access  Private/Admin
 */
const updateRoomWorkSchedule = async (req, res) => {
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
              message: `${day}: Start time and end time are required for available days.`,
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

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { workSchedule },
      { new: true, runValidators: true }
    ).select("name location workSchedule");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    return res.json({
      message: "Room work schedule updated successfully",
      workSchedule: room.workSchedule,
    });
  } catch (error) {
    console.error("Update room work schedule error:", error);
    return res.status(500).json({
      message: "Server error while updating room work schedule",
      error: error.message,
    });
  }
};

/**
 * @desc    Get room unavailable dates
 * @route   GET /api/rooms/:id/unavailable-dates
 * @access  Private
 */
const getRoomUnavailableDates = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).select(
      "name location unavailableDates"
    );

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    return res.json({
      unavailableDates: room.unavailableDates || [],
    });
  } catch (error) {
    console.error("Get room unavailable dates error:", error);
    return res.status(500).json({
      message: "Server error while fetching room unavailable dates",
      error: error.message,
    });
  }
};

/**
 * @desc    Add unavailable date to room
 * @route   POST /api/rooms/:id/unavailable-dates
 * @access  Private/Admin
 */
const addRoomUnavailableDate = async (req, res) => {
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
    const validReasons = ["maintenance", "cleaning", "closure", "other"];
    if (reason && !validReasons.includes(reason)) {
      return res.status(400).json({
        message: `Invalid reason. Must be one of: ${validReasons.join(", ")}`,
      });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check if date already exists
    const dateStr = new Date(unavailableDate).toDateString();
    const exists = room.unavailableDates.some(
      (ud) => new Date(ud.date).toDateString() === dateStr
    );

    if (exists) {
      return res.status(400).json({
        message: "This date is already marked as unavailable for this room.",
      });
    }

    // Add unavailable date
    room.unavailableDates.push({
      date: unavailableDate,
      reason: reason || "other",
      notes: notes || "",
    });

    await room.save();

    return res.status(201).json({
      message: "Room unavailable date added successfully",
      unavailableDates: room.unavailableDates,
    });
  } catch (error) {
    console.error("Add room unavailable date error:", error);
    return res.status(500).json({
      message: "Server error while adding room unavailable date",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete unavailable date from room
 * @route   DELETE /api/rooms/:id/unavailable-dates/:dateId
 * @access  Private/Admin
 */
const deleteRoomUnavailableDate = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const dateId = req.params.dateId;
    const initialLength = room.unavailableDates.length;

    // Remove the unavailable date by ID
    room.unavailableDates = room.unavailableDates.filter(
      (ud) => ud._id.toString() !== dateId
    );

    if (room.unavailableDates.length === initialLength) {
      return res.status(404).json({ message: "Unavailable date not found" });
    }

    await room.save();

    return res.json({
      message: "Room unavailable date deleted successfully",
      unavailableDates: room.unavailableDates,
    });
  } catch (error) {
    console.error("Delete room unavailable date error:", error);
    return res.status(500).json({
      message: "Server error while deleting room unavailable date",
      error: error.message,
    });
  }
};

module.exports = {
  getRoomWorkSchedule,
  updateRoomWorkSchedule,
  getRoomUnavailableDates,
  addRoomUnavailableDate,
  deleteRoomUnavailableDate,
};
