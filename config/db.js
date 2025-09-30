// Import the Mongoose library, which is an Object Data Modeling (ODM) library for MongoDB and Node.js.
const mongoose = require("mongoose");

// Define an asynchronous function to connect to the database.
const connectDB = async (mongoUri) => {
  try {
    // Attempt to connect to the MongoDB database using the provided URI.
    // The options object contains settings to use the new URL parser and the new server discovery and monitoring engine.
    // These are generally recommended for compatibility and to avoid deprecation warnings.
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // If the connection is successful, log a confirmation message to the console.
    console.log("MongoDB connected");
  } catch (err) {
    // If an error occurs during the connection attempt, log the error message.
    console.error("MongoDB connection error:", err.message);
    // Exit the Node.js process with a failure code (1) to indicate that the application failed to start correctly.
    // This is important because the application cannot function without a database connection.
    process.exit(1);
  }
};

// Export the connectDB function so it can be imported and used in other parts of the application (like server.js).
module.exports = connectDB;
