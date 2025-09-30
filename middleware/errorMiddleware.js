const mongoose = require("mongoose");

const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Server Error";

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(", ");
  }

  // Duplicate key error (unique fields)
  if (err.code && err.code === 11000) {
    statusCode = 400;
    const dupField = Object.keys(err.keyPattern || err.keyValue)[0];
    message = `${dupField} already exists`;
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = { errorHandler };
