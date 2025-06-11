const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  console.log(
    `[AuthMiddleware] Attempting to authenticate request for: ${req.path}`
  );
  let token;

  // 1. Try to get token from HTTP-only cookie first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log("[AuthMiddleware] Token found in cookies.");
  }
  // 2. If not in cookie, try Authorization header (e.g., for API clients or mobile apps)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    // Extract token from "Bearer <token>"
    token = req.headers.authorization.split(" ")[1];
    console.log("[AuthMiddleware] Token found in Authorization header.");
  }

  // 3. If no token found in either location
  if (!token) {
    console.log(
      "[AuthMiddleware] No token found in cookies or Authorization header."
    );
    return res.status(401).json({
      message: "Authentication token not provided or in an invalid format.",
    });
  }

  // 4. Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id)
      .select("-password") // Exclude password from user object
      .lean(); // Use lean() for better performance if you don't need Mongoose methods
    console.log(
      "[AuthMiddleware] Token verified successfully. User:",
      req.user
    );
    next();
  } catch (err) {
    console.error("[AuthMiddleware] Token verification failed:", err.message);
    // If token verification fails, and the token came from a cookie,
    // it's good practice to clear the invalid cookie to prevent redirect loops or stale sessions.
    if (req.cookies && req.cookies.token) {
      console.log(
        "[AuthMiddleware] Invalid token was from cookie, clearing cookie."
      );
      // Ensure cookie clearing options match how it was set (e.g., path, domain, httpOnly, secure)
      // For simplicity, assuming default path and no domain. Adjust if your cookie was set with specific options.
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = authenticate;
