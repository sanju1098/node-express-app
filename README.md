# Simple Users API

This is a simple REST API for managing users, built with Node.js, Express, and MongoDB (using Mongoose). It provides basic CRUD (Create, Read, Update, Delete) operations for users, along with registration and login functionality.

## Features

- User registration and login
- Secure password hashing with `bcrypt`
- CRUD operations for users
- Role management (user/admin)
- Centralized error handling
- Environment-based configuration

## Project Structure

```
.
├── config/
│   └── db.js             # MongoDB connection logic
├── controllers/
│   └── userController.js   # Logic for handling user-related requests
├── middleware/
│   ├── asyncHandler.js     # Wrapper for async route handlers to catch errors
│   └── errorMiddleware.js  # Centralized error handler
├── models/
│   └── User.js             # Mongoose model and schema for users
├── routes/
│   └── userRoutes.js       # API routes for user endpoints
├── .env                    # Environment variables (needs to be created)
├── package.json            # Project dependencies and scripts
└── server.js               # Main entry point for the application
```

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/try/download/community) (or a MongoDB Atlas account)

### Installation

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/sanju1098/node-express-app.git
    cd node-users
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

### Environment Variables

Create a `.env` file in the root of the project and add the following variables. This file stores sensitive configuration that should not be committed to version control.

```properties
# The port your server will run on
PORT=####

# Your MongoDB connection string
MONGODB_URI=mongodb://localhost:#####/*****

# The cost factor for bcrypt password hashing
SALT_ROUNDS=10
```

### Running the Application

You can run the server in two modes:

- **Production mode:**

  ```sh
  npm start
  ```

  This uses `node` to run the server. You will need to manually restart it after making changes.

- **Development mode:**
  ```sh
  npm run dev
  ```
  This uses `nodemon`, which automatically restarts the server whenever you save a file, making development much faster.

## API Endpoints

The base URL for all user-related endpoints is `/users`.

| HTTP Method | Endpoint    | Description                     |
| :---------- | :---------- | :------------------------------ |
| `GET`       | `/`         | Get a list of all users.        |
| `POST`      | `/register` | Register a new user.            |
| `POST`      | `/login`    | Authenticate and log in a user. |
| `PUT`       | `/:id`      | Update a user's profile.        |
| `PATCH`     | `/:id/role` | Update a user's role.           |
| `DELETE`    | `/:id`      | Delete a user.                  |

---

## Code Deep Dive

Here is a detailed breakdown of how the different parts of the application work together.

### 1. Entry Point (`server.js`)

This is the main file that starts the application. Its responsibilities include:

- Loading environment variables from `.env`.
- Initializing the Express app.
- Connecting to the MongoDB database by calling `connectDB`.
- Applying middleware like `cors` (for cross-origin requests) and `express.json` (to parse JSON bodies).
- Mounting the API routes from `userRoutes.js` on the `/users` path.
- Setting up the final error-handling middleware.
- Starting the server to listen for requests on the specified `PORT`.

### 2. Database Connection (`config/db.js`)

This file exports a single function, `connectDB`, which handles the connection to MongoDB using Mongoose.

- It uses the `MONGODB_URI` from the environment variables.
- If the connection is successful, it logs a confirmation message.
- If it fails, it logs the error and exits the process, as the application cannot run without a database.

### 3. Data Modeling (`models/User.js`)

This file defines the `User` schema, which is the blueprint for user documents in the database.

- **Schema Definition**: It specifies the fields (`name`, `email`, `password`, etc.), their data types, and validation rules (e.g., `required`, `unique`, `match` with regex).
- **Password Hashing**: It uses a `pre-save` hook to automatically hash the user's password with `bcrypt` before it's saved to the database. This is a critical security measure.
- **JSON Transformation**: It modifies the user object before it's sent as a JSON response to rename `_id` to `id` and, most importantly, **delete the password hash** so it's never exposed to the client.

### 4. Routing (`routes/userRoutes.js`)

This file defines all the API endpoints related to users. It acts as a switchboard, mapping HTTP methods and URL paths to the appropriate controller functions. For example, a `GET` request to `/users/` is routed to the `getUsers` function in the controller.

### 5. Controllers (`controllers/userController.js`)

This file contains the core business logic for the application. Each function corresponds to a specific route and handles the request-response cycle.

- It interacts with the `User` model to perform database operations (find, create, update, delete).
- It performs validation and checks for conditions like existing users or incorrect passwords.
- It sends back a JSON response with the appropriate status code and data.

### 6. Middleware

Middleware are functions that run between the request and the response.

#### `middleware/asyncHandler.js`

A simple but powerful utility that wraps asynchronous route handlers. It removes the need for `try...catch` blocks in every controller function by automatically catching any errors and passing them to the central error handler (`errorHandler`).

#### `middleware/errorMiddleware.js`

This is the central error handler for the application. It catches all errors passed to it and formats them into a consistent JSON response. It also handles specific Mongoose errors, like validation failures or duplicate key errors, to provide more user-friendly messages.
