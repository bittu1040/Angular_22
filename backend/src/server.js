const express = require("express");
const dotenv = require("dotenv");

const connectDatabase = require("./config/database");
const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");

dotenv.config();

const app = express();

app.use(express.json());

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