// Import necessary models and libraries
const User = require("../models/User"); // User model for database interaction
const bcrypt = require("bcrypt"); // Library for password hashing
const mongoose = require("mongoose"); // ODM library for MongoDB

// Import custom middleware for handling asynchronous operations
const asyncHandler = require("../middleware/asyncHandler");

/**
 * @desc    Get all users
 * @route   GET /users
 * @access  Public (for now, should be Admin in a real app)
 */
const getUsers = asyncHandler(async (req, res) => {
  // Fetch all users from the database.
  // .select("-password") excludes the password field from the result for security.
  // .lean() returns plain JavaScript objects instead of Mongoose documents for better performance.
  const users = await User.find().select("-password").lean();
  res.json({ success: true, users });
});

/**
 * @desc    Register a new user
 * @route   POST /users/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  // Destructure user data from the request body
  const { name, email, phone, password, role } = req.body;

  // Validate that all required fields are provided
  if (!name || !email || !phone || !password) {
    res.status(400);
    throw new Error("name, email, phone and password are required");
  }

  // Check if a user with the given email already exists (case-insensitive)
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error("Email already registered");
  }

  // Create a new user instance
  const user = new User({
    name,
    email,
    phone,
    password,
    role: role || undefined, // If role is not provided, it will be handled by the schema's default
  });

  // Save the new user to the database. The password will be hashed by the pre-save hook in the User model.
  await user.save();

  // Respond with a success message and the new user's data (excluding the password)
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

/**
 * @desc    Authenticate a user (login)
 * @route   POST /users/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // Validate that email and password are provided
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password required");
  }

  // Find the user by email (case-insensitive)
  const user = await User.findOne({ email: email.toLowerCase() });
  // If no user is found, send a generic error message to prevent user enumeration attacks
  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Compare the provided password with the hashed password in the database
  const match = await bcrypt.compare(password, user.password);
  // If passwords don't match, send the same generic error message
  if (!match) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // If login is successful, respond with a success message and the user's role
  res.json({
    success: true,
    message: "Login successful",
    role: user.role,
  });
});

/**
 * @desc    Update a user's profile
 * @route   PUT /users/:id
 * @access  Private (should be protected)
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Check if the provided ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid user id");
  }

  // Find the user by their ID
  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, email, phone, password } = req.body;

  // If the email is being updated, check for uniqueness
  if (email && email.toLowerCase() !== user.email) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400);
      throw new Error("Email already registered");
    }
    user.email = email.toLowerCase();
  }

  // Update user properties if they are provided in the request body
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (password) user.password = password; // The new password will be hashed by the pre-save hook

  // Save the updated user information
  await user.save();

  // Respond with a success message and the updated user data
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

/**
 * @desc    Update a user's role
 * @route   PATCH /users/:id/role
 * @access  Private (Admin only)
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Validate that the role is one of the allowed values
  if (!["user", "admin"].includes(role)) {
    res.status(400);
    throw new Error('Role must be either "user" or "admin"');
  }

  // Check if the provided ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid user id");
  }

  // Find the user by their ID
  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Prevent updating if the user already has the target role
  if (user.role === role) {
    res
      .status(400)
      .json({ success: false, message: `User is already a ${role}` });
    return;
  }

  // Update the user's role and save
  user.role = role;
  await user.save();

  // Respond with a success message and the updated role
  res.json({
    success: true,
    message: "Role updated",
    user: { id: user.id, role: user.role },
  });
});

/**
 * @desc    Delete a user
 * @route   DELETE /users/:id
 * @access  Private (Admin or user themselves)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Check if the provided ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid user id");
  }

  // Find the user by ID and delete them in one atomic operation
  const user = await User.findByIdAndDelete(id);
  // If no user was found to delete, send a 404 error
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Respond with a success message
  res.json({ success: true, message: "User deleted successfully" });
});

// Export all the controller functions to be used in the routes file
module.exports = {
  getUsers,
  registerUser,
  loginUser,
  updateUser,
  updateUserRole,
  deleteUser,
};
