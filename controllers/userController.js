const User = require("../models/User");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const asyncHandler = require("../middleware/asyncHandler");

const getUsers = asyncHandler(async (req, res) => {
  // fetch all users (exclude password)
  const users = await User.find().select("-password").lean();
  res.json({ success: true, users });
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !phone || !password) {
    res.status(400);
    throw new Error("name, email, phone and password are required");
  }

  // check existing email
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error("Email already registered");
  }

  const user = new User({
    name,
    email,
    phone,
    password,
    role: role || undefined, // schema default handles it
  });

  await user.save();

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    success: true,
    message: "Login successful",
    role: user.role,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid user id");
  }

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, email, phone, password } = req.body;

  // If email is being updated, ensure uniqueness
  if (email && email.toLowerCase() !== user.email) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400);
      throw new Error("Email already registered");
    }
    user.email = email.toLowerCase();
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (password) user.password = password; // will get hashed by pre-save hook

  await user.save();

  res.json({
    success: true,
    message: "User updated",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    res.status(400);
    throw new Error('Role must be either "user" or "admin"');
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid user id");
  }

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === role) {
    res
      .status(400)
      .json({ success: false, message: `You are already a ${role}` });
    return;
  }

  user.role = role;
  await user.save();

  res.json({
    success: true,
    message: "Role updated",
    user: { id: user.id, role: user.role },
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid user id");
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({ success: true, message: "User deleted successfully" });
});

module.exports = {
  getUsers,
  registerUser,
  loginUser,
  updateUser,
  updateUserRole,
  deleteUser,
};
