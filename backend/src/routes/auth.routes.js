const express = require("express");

const {
  register,
  login,
  refreshToken,
  getMe,
  logout,
} = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.get("/me", authMiddleware, getMe);
router.post("/logout", logout);

module.exports = router;