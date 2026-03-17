const Service = require("../models/Service");
const Staff = require("../models/Staff");
const Room = require("../models/Room");

// -------- Services --------

/**
 * @desc    Create a new service
 * @route   POST /api/resources/services
 * @access  Private/Admin
 */
const createService = async (req, res) => {
  try {
    const { name, description, duration, isActive } = req.body;

    if (!name || !duration) {
      return res
        .status(400)
        .json({ message: "Name and duration are required" });
    }

    const service = await Service.create({
      name,
      description: description || "",
      duration,
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("Create service error:", error);
    return res
      .status(500)
      .json({ message: "Server error while creating service" });
  }
};

/**
 * @desc    Get all services
 * @route   GET /api/resources/services
 * @access  Private/Admin
 */
const getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    return res.json({ count: services.length, services });
  } catch (error) {
    console.error("Get services error:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching services" });
  }
};

/**
 * @desc    Update a service
 * @route   PUT /api/resources/services/:id
 * @access  Private/Admin
 */
const updateService = async (req, res) => {
  try {
    const { name, description, duration, isActive } = req.body;

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (name !== undefined) service.name = name;
    if (description !== undefined) service.description = description;
    if (duration !== undefined) service.duration = duration;
    if (isActive !== undefined) service.isActive = isActive;

    const updated = await service.save();

    return res.json({
      message: "Service updated successfully",
      service: updated,
    });
  } catch (error) {
    console.error("Update service error:", error);
    return res
      .status(500)
      .json({ message: "Server error while updating service" });
  }
};

/**
 * @desc    Delete a service
 * @route   DELETE /api/resources/services/:id
 * @access  Private/Admin
 */
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    await service.deleteOne();

    return res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Delete service error:", error);
    return res
      .status(500)
      .json({ message: "Server error while deleting service" });
  }
};

// -------- Staff --------

/**
 * @desc    Create a new staff member
 * @route   POST /api/resources/staff
 * @access  Private/Admin
 */
const createStaff = async (req, res) => {
  try {
    const { name, email, phone, specialization, isAvailable } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ message: "Name and email are required" });
    }

    const existing = await Staff.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Staff email already exists" });
    }

    const staff = await Staff.create({
      name,
      email: email.toLowerCase(),
      phone: phone || "",
      specialization: specialization || "",
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    return res.status(201).json({
      message: "Staff member created successfully",
      staff,
    });
  } catch (error) {
    console.error("Create staff error:", error);
    return res
      .status(500)
      .json({ message: "Server error while creating staff member" });
  }
};

/**
 * @desc    Get all staff
 * @route   GET /api/resources/staff
 * @access  Private/Admin
 */
const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    return res.json({ count: staff.length, staff });
  } catch (error) {
    console.error("Get staff error:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching staff" });
  }
};

/**
 * @desc    Update staff member
 * @route   PUT /api/resources/staff/:id
 * @access  Private/Admin
 */
const updateStaff = async (req, res) => {
  try {
    const { name, email, phone, specialization, isAvailable } = req.body;

    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    if (name !== undefined) staff.name = name;
    if (email !== undefined) staff.email = email.toLowerCase();
    if (phone !== undefined) staff.phone = phone;
    if (specialization !== undefined) staff.specialization = specialization;
    if (isAvailable !== undefined) staff.isAvailable = isAvailable;

    const updated = await staff.save();

    return res.json({
      message: "Staff member updated successfully",
      staff: updated,
    });
  } catch (error) {
    console.error("Update staff error:", error);
    return res
      .status(500)
      .json({ message: "Server error while updating staff member" });
  }
};

/**
 * @desc    Delete staff member
 * @route   DELETE /api/resources/staff/:id
 * @access  Private/Admin
 */
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    await staff.deleteOne();

    return res.json({ message: "Staff member deleted successfully" });
  } catch (error) {
    console.error("Delete staff error:", error);
    return res
      .status(500)
      .json({ message: "Server error while deleting staff member" });
  }
};

// -------- Rooms --------

/**
 * @desc    Create a new room
 * @route   POST /api/resources/rooms
 * @access  Private/Admin
 */
const createRoom = async (req, res) => {
  try {
    const { name, location, capacity, isAvailable } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const room = await Room.create({
      name,
      location: location || "",
      capacity: capacity || 1,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    return res.status(201).json({
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    console.error("Create room error:", error);
    return res
      .status(500)
      .json({ message: "Server error while creating room" });
  }
};

/**
 * @desc    Get all rooms
 * @route   GET /api/resources/rooms
 * @access  Private/Admin
 */
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    return res.json({ count: rooms.length, rooms });
  } catch (error) {
    console.error("Get rooms error:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching rooms" });
  }
};

/**
 * @desc    Update room
 * @route   PUT /api/resources/rooms/:id
 * @access  Private/Admin
 */
const updateRoom = async (req, res) => {
  try {
    const { name, location, capacity, isAvailable } = req.body;

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (name !== undefined) room.name = name;
    if (location !== undefined) room.location = location;
    if (capacity !== undefined) room.capacity = capacity;
    if (isAvailable !== undefined) room.isAvailable = isAvailable;

    const updated = await room.save();

    return res.json({
      message: "Room updated successfully",
      room: updated,
    });
  } catch (error) {
    console.error("Update room error:", error);
    return res
      .status(500)
      .json({ message: "Server error while updating room" });
  }
};

/**
 * @desc    Delete room
 * @route   DELETE /api/resources/rooms/:id
 * @access  Private/Admin
 */
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    await room.deleteOne();

    return res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Delete room error:", error);
    return res
      .status(500)
      .json({ message: "Server error while deleting room" });
  }
};

module.exports = {
  // services
  createService,
  getServices,
  updateService,
  deleteService,
  // staff
  createStaff,
  getStaff,
  updateStaff,
  deleteStaff,
  // rooms
  createRoom,
  getRooms,
  updateRoom,
  deleteRoom,
};

