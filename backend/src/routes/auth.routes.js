const express = require("express");

const {
  register,
  login,
  getMe
} = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth.middleware");


const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", authMiddleware, getMe);

module.exports = router;