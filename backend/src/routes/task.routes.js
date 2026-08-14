const express = require("express");

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,

} = require("../controllers/task.controller");

const authMiddleware = require("../middleware/auth.middleware");


const router = express.Router();

// Apply authentication middleware to all task routes
router.use(authMiddleware);

// Create task
router.post("/createTask", createTask);

// Get logged-in user's tasks
router.get("/myTasks", getTasks);

// Get task by ID
router.get("/tasks/:id", getTaskById);

// Update task
router.put("/tasks/:id", updateTask);

// Delete task
router.delete("/tasks/:id", deleteTask);

module.exports = router;