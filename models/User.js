// Import necessary libraries
const mongoose = require("mongoose"); // Mongoose is an ODM (Object Data Modeling) library for MongoDB.
const bcrypt = require("bcrypt"); // bcrypt is a library for hashing passwords.

// --- Regular Expressions for Validation ---
// Regex for validating a standard email format.
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Regex for validating an Indian mobile number. It allows for an optional country code (+91, 91, or 0)
// followed by a 10-digit number starting with a digit from 6 to 9.
const indianPhoneRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/;

// --- Mongoose Schema Definition ---
// A schema defines the structure of the documents within a collection in MongoDB.
const userSchema = new mongoose.Schema(
  {
    // --- Schema Fields ---
    name: {
      type: String,
      required: [true, "Name is required"], // This field is mandatory.
      trim: true, // Automatically removes whitespace from the start and end of the string.
    },
    email: {
      type: String,
      required: [true, "Email is required"], // Mandatory field.
      unique: true, // Ensures that every email in the database is unique.
      lowercase: true, // Automatically converts the email to lowercase before saving.
      trim: true, // Removes whitespace.
      match: [emailRegex, "Please fill a valid email address"], // Validates the email against the regex.
    },
    phone: {
      type: String,
      required: [true, "Phone is required"], // Mandatory field.
      trim: true, // Removes whitespace.
      match: [indianPhoneRegex, "Please fill a valid Indian phone number"], // Validates the phone number.
    },
    password: {
      type: String,
      required: [true, "Password is required"], // Mandatory field.
    },
    role: {
      type: String,
      enum: ["user", "admin"], // The role can only be one of these two values.
      default: "user", // If no role is provided, it defaults to "user".
    },
  },
  {
    // --- Schema Options ---
    // `timestamps: true` automatically adds `createdAt` and `updatedAt` fields to the document.
    timestamps: true,
  }
);

// --- Database Index ---
// This ensures that the `email` field is indexed for faster queries and enforces the `unique` constraint at the database level.
userSchema.index({ email: 1 }, { unique: true });

// --- Mongoose Middleware (pre-save hook) ---
// This function runs automatically *before* a user document is saved to the database (`.pre("save")`).
// It's used here to hash the password.
userSchema.pre("save", async function (next) {
  try {
    // `this` refers to the user document that is about to be saved.
    // If the password has not been changed, we don't need to re-hash it.
    if (!this.isModified("password")) return next();

    // Get the number of salt rounds from environment variables, or default to 10.
    // A higher number means more secure but slower hashing.
    const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;
    // Hash the plain-text password with the generated salt.
    const hashed = await bcrypt.hash(this.password, saltRounds);
    // Replace the plain-text password with the hashed password.
    this.password = hashed;
    // Continue with the save operation.
    next();
  } catch (err) {
    // If an error occurs during hashing, pass it to the next middleware (our error handler).
    next(err);
  }
});

// --- JSON Transformation ---
// This modifies the document when it's converted to JSON (e.g., when sent in an API response).
userSchema.set("toJSON", {
  virtuals: true, // Include virtual properties (like `id`) in the JSON output.
  versionKey: false, // Exclude the `__v` version key from the output.
  // The `transform` function allows you to manipulate the final JSON object.
  transform: (doc, ret) => {
    // `ret` is the plain object representation of the document.
    ret.id = ret._id; // Create a new property `id` from the `_id` property.
    delete ret._id; // Remove the original `_id` property.
    delete ret.password; // **Crucially, remove the password hash from the JSON output for security.**
  },
});

// --- Model Creation ---
// Create the `User` model from the schema. A Mongoose model provides an interface
// for creating, querying, updating, and deleting documents in the database.
const User = mongoose.model("User", userSchema);

// Export the model to be used in other parts of the application (like the controllers).
module.exports = User;
