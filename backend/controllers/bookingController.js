const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Staff = require("../models/Staff");
const Room = require("../models/Room");
const { hasBookingConflict, timeStringToMinutes } = require("../utils/bookingHelper");

/**
 * @desc    Create a new booking (user)
 * @route   POST /api/bookings
 * @access  Private
 */
const createBooking = async (req, res) => {
  try {
    const {
      service: serviceId,
      assignedStaff: staffId,
      room: roomId,
      date,
      startTime,
      endTime,
      notes,
    } = req.body;

    if (!serviceId || !date || !startTime || !endTime) {
      return res.status(400).json({
        message: "Service, date, startTime and endTime are required",
      });
    }

    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(400).json({ message: "Selected service is not valid" });
    }

    // Optional: validate staff and room existence if provided
    if (staffId) {
      const staff = await Staff.findById(staffId);
      if (!staff || !staff.isAvailable) {
        return res
          .status(400)
          .json({ message: "Selected staff member is not available" });
      }
    }

    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room || !room.isAvailable) {
        return res
          .status(400)
          .json({ message: "Selected room is not available" });
      }
    }

    const bookingDate = new Date(date);

    // Check for conflicts with existing bookings
    let conflict;
    try {
      conflict = await hasBookingConflict(Booking, {
        date: bookingDate,
        startTime,
        endTime,
        roomId,
        staffId,
      });
    } catch (conflictError) {
      console.error("Conflict check error:", conflictError);
      return res.status(500).json({
        message: "Error checking booking conflicts",
        error: conflictError.message,
      });
    }

    if (conflict) {
      return res.status(400).json({
        message:
          "This time slot is already booked for the selected staff or room. Please choose another slot.",
      });
    }

    let booking;
    try {
      booking = await Booking.create({
        user: req.user.id,
        service: serviceId,
        assignedStaff: staffId || null,
        room: roomId || null,
        date: bookingDate,
        startTime,
        endTime,
        status: "pending",
        notes: notes || "",
      });
    } catch (createError) {
      console.error("Booking creation error:", createError);
      return res.status(500).json({
        message: "Error creating booking in database",
        error: createError.message,
      });
    }

    let populatedBooking;
    try {
      populatedBooking = await booking
        .populate("service", "name duration")
        .populate("assignedStaff", "name email")
        .populate("room", "name location")
        .populate("user", "name email role");
    } catch (populateError) {
      console.error("Populate error:", populateError);
      // Return the booking even if populate fails
      return res.status(201).json({
        message: "Booking created successfully",
        booking: booking,
      });
    }

    return res.status(201).json({
      message: "Booking created successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    console.error("Error stack:", error.stack);
    return res
      .status(500)
      .json({
        message: "Server error while creating booking",
        error: error.message,
      });
  }
};

/**
 * @desc    Get bookings of current logged-in user
 * @route   GET /api/bookings/my
 * @access  Private
 */
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("service", "name duration")
      .populate("assignedStaff", "name email")
      .populate("room", "name location")
      .sort({ date: -1, startTime: -1 });

    return res.json({ count: bookings.length, bookings });
  } catch (error) {
    console.error("Get my bookings error:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching your bookings" });
  }
};

/**
 * @desc    Get all bookings (admin/staff)
 * @route   GET /api/bookings
 * @access  Private/Admin,Staff
 */
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email role")
      .populate("service", "name duration")
      .populate("assignedStaff", "name email")
      .populate("room", "name location")
      .sort({ date: -1, startTime: -1 });

    return res.json({ count: bookings.length, bookings });
  } catch (error) {
    console.error("Get all bookings error:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching bookings" });
  }
};

/**
 * @desc    Cancel a booking (user can cancel own, admin/staff can cancel any)
 * @route   PATCH /api/bookings/:id/cancel
 * @access  Private
 */
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isOwner = booking.user.toString() === req.user.id;
    const isAdminOrStaff = ["admin", "staff"].includes(req.user.role);

    if (!isOwner && !isAdminOrStaff) {
      return res
        .status(403)
        .json({ message: "You are not allowed to cancel this booking" });
    }

    if (booking.status === "cancelled") {
      return res
        .status(400)
        .json({ message: "Booking is already cancelled" });
    }

    booking.status = "cancelled";
    const updated = await booking.save();

    return res.json({
      message: "Booking cancelled successfully",
      booking: updated,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return res
      .status(500)
      .json({ message: "Server error while cancelling booking" });
  }
};

/**
 * @desc    Approve a booking (admin/staff)
 * @route   PATCH /api/bookings/:id/approve
 * @access  Private/Admin,Staff
 */
const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "cancelled" || booking.status === "rejected") {
      return res.status(400).json({
        message: "Cancelled or rejected bookings cannot be approved",
      });
    }

    // Re-check conflict at approval time
    const conflict = await hasBookingConflict(Booking, {
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      roomId: booking.room,
      staffId: booking.assignedStaff,
      excludeBookingId: booking._id,
    });

    if (conflict) {
      return res.status(400).json({
        message:
          "This booking conflicts with another approved or pending booking.",
      });
    }

    booking.status = "approved";
    const updated = await booking.save();

    return res.json({
      message: "Booking approved successfully",
      booking: updated,
    });
  } catch (error) {
    console.error("Approve booking error:", error);
    return res
      .status(500)
      .json({ message: "Server error while approving booking" });
  }
};

/**
 * @desc    Reject a booking (admin/staff)
 * @route   PATCH /api/bookings/:id/reject
 * @access  Private/Admin,Staff
 */
const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res
        .status(400)
        .json({ message: "Cancelled bookings cannot be rejected" });
    }

    booking.status = "rejected";
    const updated = await booking.save();

    return res.json({
      message: "Booking rejected successfully",
      booking: updated,
    });
  } catch (error) {
    console.error("Reject booking error:", error);
    return res
      .status(500)
      .json({ message: "Server error while rejecting booking" });
  }
};

/**
 * @desc    Update a booking (admin/staff can edit any, user can edit own pending)
 * @route   PUT /api/bookings/:id
 * @access  Private
 */
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isOwner = booking.user.toString() === req.user.id;
    const isAdminOrStaff = ["admin", "staff"].includes(req.user.role);

    // Check if booking status prevents editing (for both users and staff)
    if (booking.status === "cancelled") {
      return res.status(403).json({
        message: "Cannot edit a cancelled booking. Please create a new booking instead.",
      });
    }

    if (booking.status === "rejected") {
      return res.status(403).json({
        message: "Cannot edit a rejected booking. Please create a new booking instead.",
      });
    }

    // Users can only edit their own pending bookings
    if (isOwner && booking.status !== "pending") {
      return res.status(403).json({
        message: "You can only edit pending bookings. This booking is already " + booking.status,
      });
    }

    // Check permission: owner can edit own pending, staff/admin can edit any non-cancelled/non-rejected
    if (!isOwner && !isAdminOrStaff) {
      return res.status(403).json({
        message: "You are not allowed to edit this booking",
      });
    }

    const {
      service: serviceId,
      assignedStaff: staffId,
      room: roomId,
      date,
      startTime,
      endTime,
      notes,
      status,
    } = req.body;

    // Validate service if provided
    if (serviceId) {
      const service = await Service.findById(serviceId);
      if (!service || !service.isActive) {
        return res.status(400).json({ message: "Selected service is not valid" });
      }
      booking.service = serviceId;
    }

    // Validate staff if provided
    if (staffId) {
      const staff = await Staff.findById(staffId);
      if (!staff || !staff.isAvailable) {
        return res.status(400).json({ message: "Selected staff member is not available" });
      }
      booking.assignedStaff = staffId;
    }

    // Validate room if provided
    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room || !room.isAvailable) {
        return res.status(400).json({ message: "Selected room is not available" });
      }
      booking.room = roomId;
    }

    // Update date and time if provided
    if (date) {
      const newDate = new Date(date);
      // Validate date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of today

      if (newDate < today) {
        return res.status(400).json({
          message: "Cannot book an appointment in the past. Please select a future date.",
        });
      }

      booking.date = newDate;
    }
    if (startTime) booking.startTime = startTime;
    if (endTime) booking.endTime = endTime;
    if (notes !== undefined) booking.notes = notes;

    // Only admin/staff can change status
    if (status && isAdminOrStaff) {
      booking.status = status;
    }

    // Mark as edited if staff/admin is making changes (not user editing own pending)
    if (isAdminOrStaff && !isOwner) {
      booking.isEdited = true;
    }

    // Check for conflicts if date/time changed
    if (date || startTime || endTime || staffId || roomId) {
      const conflict = await hasBookingConflict(Booking, {
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        roomId: booking.room,
        staffId: booking.assignedStaff,
        excludeBookingId: booking._id,
      });

      if (conflict) {
        // Provide more specific conflict message based on what changed
        let errorMsg = "This time slot conflicts with another booking.";
        if (date) {
          errorMsg = `${booking.assignedStaff ? "The selected staff member" : "The selected room"} is not available on ${new Date(booking.date).toLocaleDateString()} at ${booking.startTime}-${booking.endTime}. Please choose a different date or time.`;
        }
        return res.status(400).json({
          message: errorMsg,
        });
      }
    }

    const updated = await booking.save();

    // Populate the booking with related data
    await updated.populate([
      { path: "service", select: "name duration" },
      { path: "assignedStaff", select: "name email" },
      { path: "room", select: "name location" },
      { path: "user", select: "name email role" }
    ]);

    return res.json({
      message: "Booking updated successfully",
      booking: updated,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    return res.status(500).json({
      message: "Server error while updating booking",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a booking (admin/staff only)
 * @route   DELETE /api/bookings/:id
 * @access  Private/Admin,Staff
 */
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await Booking.findByIdAndDelete(req.params.id);

    return res.json({
      message: "Booking deleted successfully",
      bookingId: req.params.id,
    });
  } catch (error) {
    console.error("Delete booking error:", error);
    return res.status(500).json({
      message: "Server error while deleting booking",
      error: error.message,
    });
  }
};

/**
 * @desc    Get available time slots for a given date/service (and optional staff/room)
 * @route   GET /api/bookings/available-slots
 * @access  Private
 *
 * Query params:
 * - date (YYYY-MM-DD, required)
 * - serviceId (required)
 * - staffId (optional)
 * - roomId (optional)
 */
const getAvailableSlots = async (req, res) => {
  try {
    const { date, serviceId, staffId, roomId } = req.query;

    if (!date || !serviceId) {
      return res.status(400).json({
        message: "date (YYYY-MM-DD) and serviceId are required",
      });
    }

    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(400).json({ message: "Selected service is not valid" });
    }

    if (!staffId && !roomId) {
      return res.status(400).json({
        message: "staffId or roomId is required to check availability",
      });
    }

    const bookingDate = new Date(date);

    // Working hours (you can adjust these later)
    const WORK_START = "09:00";
    const WORK_END = "17:00";

    const duration = service.duration; // in minutes

    const existingBookings = await Booking.find({
      date: bookingDate,
      status: { $in: ["pending", "approved"] },
      $or: [
        ...(staffId ? [{ assignedStaff: staffId }] : []),
        ...(roomId ? [{ room: roomId }] : []),
      ],
    });

    const startMinutes = timeStringToMinutes(WORK_START);
    const endMinutes = timeStringToMinutes(WORK_END);

    const slots = [];

    for (
      let slotStart = startMinutes;
      slotStart + duration <= endMinutes;
      slotStart += duration
    ) {
      const slotEnd = slotStart + duration;

      const startStr = `${String(Math.floor(slotStart / 60)).padStart(
        2,
        "0"
      )}:${String(slotStart % 60).padStart(2, "0")}`;
      const endStr = `${String(Math.floor(slotEnd / 60)).padStart(2, "0")}:${String(
        slotEnd % 60
      ).padStart(2, "0")}`;

      const conflict = existingBookings.some((booking) =>
        hasBookingConflict(Booking, {
          date: bookingDate,
          startTime: startStr,
          endTime: endStr,
          roomId,
          staffId,
          excludeBookingId: booking._id,
        })
      );

      if (!conflict) {
        slots.push({ startTime: startStr, endTime: endStr });
      }
    }

    return res.json({ date, serviceId, staffId, roomId, slots });
  } catch (error) {
    console.error("Get available slots error:", error);
    return res
      .status(500)
      .json({ message: "Server error while calculating available slots" });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBooking,
  deleteBooking,
  cancelBooking,
  approveBooking,
  rejectBooking,
  getAvailableSlots,
};

