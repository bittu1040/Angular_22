const express = require("express");

const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  downloadUsers
} = require("../controllers/user.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// All user-management APIs require JWT
router.use(authMiddleware);

router.post("/", createUser);

router.get("/", getUsers);

router.get("/download", downloadUsers);

router.get("/:id", getUserById);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

module.exports = router;