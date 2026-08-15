const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDatabase = require("./config/database");
const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");

dotenv.config();

const app = express();

app.use(express.json());

// Enable CORS and allow cookies (credentials)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
    credentials: true,
  })
);

// Parse cookies for refresh token handling
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "User Management API is running"
  });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Task routes
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();