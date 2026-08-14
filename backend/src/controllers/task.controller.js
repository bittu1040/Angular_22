const Task = require("../models/task.model");

// ==========================
// CREATE TASK
// ==========================
const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
        console.log("Authenticated user:", req.user);


    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || "",
      user: req.user.userId,
    });
    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    console.error("Create task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
};

// ==========================
// GET ALL MY TASKS
// ==========================
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get tasks",
    });
  }
};

// ==========================
// GET TASK BY ID
// ==========================
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Get task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get task",
    });
  }
};

// ==========================
// UPDATE TASK
// ==========================
const updateTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (title !== undefined) {
      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description.trim();
    }

    if (status !== undefined) {
      if (!["pending", "completed"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task status",
        });
      }

      task.status = status;
    }

    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    console.error("Update task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update task",
    });
  }
};

// ==========================
// DELETE TASK
// ==========================
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete task",
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};