const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const authenticate = require("../middleware/authenticate");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    console.log(
      `[AuthRoutes] /auth/me route hit. Authenticated user:`,
      req.user
    );

    const user = await User.findById(req.user._id).lean().select("-password");
    if (!user) {
      console.log(
        "[AuthRoutes] /auth/me - User not found in DB for ID:",
        req.user._id
      );
      return res.status(404).json({ message: "User not found" });
    }
    console.log("[AuthRoutes] /auth/me - User found in DB:", user);

    res.status(200).json({ user });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    console.log("[AuthRoutes] /auth/login route hit. Body:", req.body);
    const { username, password, rememberMe } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Find user and validate password
    const user = await User.findOne({ username }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log(
        "[AuthRoutes] /auth/login - Invalid username or password for username:",
        username
      );
      return res.status(401).json({ message: "Invalid username or password" });
    }

    console.log(
      "[AuthRoutes] /auth/login - User authenticated:",
      user.username
    );
    // Generate token
    const expiresIn = rememberMe ? "7d" : "1d";
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Set cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    };

    // Check for first login
    if (user.firstLogin) {
      user.firstLogin = false;
      await user.save();
      console.log(
        "[AuthRoutes] /auth/login - First login detected for user:",
        user.username
      );
      return res
        .status(200)
        .cookie("token", token, cookieOptions)
        .json({ message: "Login successful", firstLogin: true, user });
    }
    console.log(
      "[AuthRoutes] /auth/login - Standard login for user:",
      user.username
    );
    // TODO: check if first login and redirect to change password page
    res
      .status(200)
      .cookie("token", token, cookieOptions)
      .json({ message: "Login successful", user });
  })
);

// PUT /auth/me/password - Set/Update password for the authenticated user (used for first login)
router.put(
  "/me/password",
  authenticate, // Ensures the user is logged in
  asyncHandler(async (req, res) => {
    console.log(
      `[AuthRoutes] /auth/me/password route hit for user: ${req.user.username}`
    );
    const { newPassword } = req.body;

    // Validate input
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // Find user
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log(
        `[AuthRoutes] /auth/me/password - User not found for ID: ${req.user._id}`
      );
      return res.status(404).json({ message: "User not found" });
    }

    console.log(
      `[AuthRoutes] /auth/me/password - Updating password for user: ${user.username}`
    );
    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.firstLogin = false; // Ensure firstLogin is set to false
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  })
);

// POST /forgot-password - Request password reset
router.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    console.log(
      "[AuthRoutes] /auth/forgot-password route hit. Email:",
      req.body.email
    );
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log(
        "[AuthRoutes] /auth/forgot-password - User not found for email:",
        email
      );
      return res.status(404).json({ message: "User not found" });
    }

    console.log(
      "[AuthRoutes] /auth/forgot-password - User found, sending reset email to:",
      email
    );
    // Generate reset token
    const resetToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const resetLink = `${
      process.env.CLIENT_URL || "http://localhost:5173"
    }/reset-password/${resetToken}`;

    const mailOptions = {
      from: `<${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Password",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
          <h2 style="color: #007BFF;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You requested to reset your password. Click the button below to create a new one:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; color: white; background-color: #007BFF; text-decoration: none; border-radius: 4px;">Reset Password</a>
          <p>If the button above doesn’t work, copy and paste the following link into your browser:</p>
          <p style="word-break: break-all;">${resetLink}</p>
          <hr>
          <p style="font-size: 12px; color: #777;">If you did not request a password reset, please ignore this email or contact support.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset email sent" });
  })
);

router.post(
  "/reset-password/:token",
  asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    console.log(
      `[AuthRoutes] /auth/reset-password/:token route hit. Token: ${token}`
    );

    // Validate input
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    // Verify token
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
      console.log(
        "[AuthRoutes] /auth/reset-password - Token verified. Payload:",
        payload
      );
    } catch (err) {
      console.error(
        "[AuthRoutes] /auth/reset-password - Token verification failed:",
        err.message
      );
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Find user
    const user = await User.findById(payload._id);
    if (!user) {
      console.log(
        "[AuthRoutes] /auth/reset-password - User not found for ID from token:",
        payload._id
      );
      return res.status(404).json({ message: "User not found" });
    }

    console.log(
      "[AuthRoutes] /auth/reset-password - User found, updating password for:",
      user.username
    );
    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  })
);

module.exports = router;
