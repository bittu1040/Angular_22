const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    }
  );
};

// ==========================
// REGISTER
// ==========================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
      status: "active",
    });

    // Create tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Send refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// ==========================
// LOGIN
// ==========================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Create access token
    const accessToken = generateAccessToken(user);

    // Create refresh token
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// ==========================
// REFRESH TOKEN
// ==========================
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
      });
    }

    // Check that token belongs to this user's current session
    if (user.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Rotate refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new refresh token cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

// ==========================
// GET CURRENT USER
// ==========================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get current user",
    });
  }
};

// ==========================
// LOGOUT
// ==========================
const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      const user = await User.findOne({
        refreshToken: token,
      });

      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getMe,
  logout,
};