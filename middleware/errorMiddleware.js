// Import Mongoose to check for specific Mongoose error types
const mongoose = require("mongoose");

/**
 * Custom error handling middleware for Express.
 * This function catches all errors passed to `next()` and formats them into a consistent JSON response.
 * @param {Error} err - The error object.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  // Log the full error to the console for debugging purposes
  console.error(err);

  // Determine the status code. Use the status code from the response if it's already set and not 200 (OK),
  // otherwise default to 500 (Internal Server Error).
  let statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  // Set a default error message.
  let message = err.message || "Server Error";

  // --- Specific Error Handling for Mongoose ---

  // Handle Mongoose validation errors (e.g., required fields are missing).
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400; // Bad Request
    // Combine all validation error messages into a single string.
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(", ");
  }

  // Handle Mongoose duplicate key errors (when a unique field like 'email' is duplicated).
  // MongoDB's error code for this is 11000.
  if (err.code && err.code === 11000) {
    statusCode = 400; // Bad Request
    // Identify which field caused the duplication error.
    const dupField = Object.keys(err.keyPattern || err.keyValue)[0];
    message = `${dupField} already exists`;
  }

  // Send the final, formatted error response to the client.
  res.status(statusCode).json({
    success: false,
    message,
  });
};

// Export the errorHandler to be used in server.js
module.exports = { errorHandler };
