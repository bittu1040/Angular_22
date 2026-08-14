const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check Authorization header
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required"
      });
    }

    // Check Bearer token format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format"
      });
    }

    const token = authHeader.split(" ")[1];

    console.log("Received token:", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required"
      });
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("Decoded token:", decoded);

    // Attach authenticated user information
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

module.exports = authMiddleware;