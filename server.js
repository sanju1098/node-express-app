require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB(process.env.MONGODB_URI);

// Middlewares
app.use(cors());
app.use(express.json()); // parse JSON bodies

// Routes
app.use("/users", userRoutes);

// Health-check
app.get("/", (req, res) => res.send("API is running"));

// Error handling middleware (should be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
