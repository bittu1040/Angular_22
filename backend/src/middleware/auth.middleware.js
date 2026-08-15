const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

    console.log("========== AUTH MIDDLEWARE ==========");

  try {
    // Accept token from Authorization header (Bearer), or from a cookie named `accessToken` as a fallback
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
    }
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Authenticated user:", decoded);

    // Attach authenticated user information
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;