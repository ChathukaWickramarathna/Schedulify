const User = require("../models/User");

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching users" });
  }
};

/**
 * @desc    Get single user by id
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Get user by id error:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching user" });
  }
};

/**
 * @desc    Update user basic details (name, phone, role optional)
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = async (req, res) => {
  try {
    const { name, phone, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;

    // Allow role update only to valid values, if provided
    if (role !== undefined) {
      const validRoles = ["admin", "staff", "user"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role value" });
      }
      user.role = role;
    }

    const updatedUser = await user.save();

    return res.json({
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res
      .status(500)
      .json({ message: "Server error while updating user" });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return res
      .status(500)
      .json({ message: "Server error while deleting user" });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};

