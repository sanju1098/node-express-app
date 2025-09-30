// Load environment variables from a .env file into process.env
require("dotenv").config();

// Import necessary modules
const express = require("express"); // Express.js framework for building web applications
const cors = require("cors"); // Middleware to enable Cross-Origin Resource Sharing
const connectDB = require("./config/db"); // Custom module to connect to the MongoDB database
const userRoutes = require("./routes/userRoutes"); // Router for user-related endpoints
const { errorHandler } = require("./middleware/errorMiddleware"); // Custom error handling middleware
const swaggerDocs = require("./swagger");

// Initialize the Express application
const app = express();
// Set the port number from environment variables, or default to 5000
const PORT = process.env.PORT || 5000;

// Connect to the MongoDB database using the URI from environment variables
connectDB(process.env.MONGODB_URI);

// --- Middlewares ---
// Enable CORS for all routes, allowing requests from different origins
app.use(cors());
// Parse incoming requests with JSON payloads. This is a built-in Express middleware.
app.use(express.json()); // parse JSON bodies

// --- Routes ---
// Mount the userRoutes for any requests starting with "/users"
app.use("/users", userRoutes);

// --- Swagger Docs ---
swaggerDocs(app);

// --- Health-check endpoint ---
// A simple route to check if the API is running and responding to requests
app.get("/", (req, res) => res.send("API is running"));

// --- Error handling middleware ---
// This middleware will catch any errors that occur in the route handlers.
// It's important that this is the last middleware added.
app.use(errorHandler);

// Start the server and listen for incoming connections on the specified port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
