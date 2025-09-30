// Import the Express library
const express = require("express");
// Create a new router object. A router is a mini-application capable of performing middleware and routing functions.
const router = express.Router();
// Import the controller functions that contain the logic for each route.
const userController = require("../controllers/userController");

// --- API Route Definitions ---
// This file defines all the API endpoints related to users.
// The base path for all these routes is "/users", which is set in `server.js`.

// Route to get all users.
// Method: GET
// Endpoint: /users/
router.get("/", userController.getUsers);

// Route to register a new user.
// Method: POST
// Endpoint: /users/register
router.post("/register", userController.registerUser);

// Route to log in a user.
// Method: POST
// Endpoint: /users/login
router.post("/login", userController.loginUser);

// Route to update a user's profile by their ID.
// Method: PUT
// Endpoint: /users/:id (e.g., /users/12345)
router.put("/:id", userController.updateUser);

// Route to update a user's role by their ID.
// Using PATCH is conventional for partial updates (updating just one field).
// Method: PATCH
// Endpoint: /users/:id/role (e.g., /users/12345/role)
router.patch("/:id/role", userController.updateUserRole);

// Route to delete a user by their ID.
// Method: DELETE
// Endpoint: /users/:id (e.g., /users/12345)
router.delete("/:id", userController.deleteUser);

// Export the router so it can be mounted by the main Express app in `server.js`.
module.exports = router;
