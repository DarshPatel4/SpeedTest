import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { PasswordResetToken } from "../models/PasswordResetToken.js";
import { protect } from "../middleware/auth.js";
import { sendN8nWebhookInBackground } from "../services/n8nWebhookService.js";

const router = express.Router();
const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_SECRET ||
  "typeflow-dev-access-secret-change-in-production";
const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  process.env.JWT_SECRET ||
  "typeflow-dev-refresh-secret-change-in-production";
const RESET_TOKEN_SECRET =
  process.env.JWT_RESET_SECRET ||
  process.env.JWT_SECRET ||
  "typeflow-dev-reset-secret-change-in-production";

function toSafeUser(doc) {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  delete obj.password;
  return obj;
}

function signAccessToken(userId) {
  return jwt.sign({ id: userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: "2h",
    jwtid: crypto.randomUUID(),
  });
}

function signRefreshToken(userId) {
  return jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
    jwtid: crypto.randomUUID(),
  });
}

function accessExpiresAt() {
  return Date.now() + 2 * 60 * 60 * 1000;
}

async function saveRefreshToken(userId, token, req) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({
    userId,
    token,
    expiresAt,
    device: req.headers["user-agent"] || "Unknown device",
  });
}

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: String(password),
    });

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    await saveRefreshToken(user._id, refreshToken, req);

    sendN8nWebhookInBackground("userSignup", {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      user: toSafeUser(user),
      accessToken,
      refreshToken,
      accessTokenExpiresAt: accessExpiresAt(),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }
    console.error("Signup Error:", error);
    res.status(500).json({ message: error.message || "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(String(password));
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    await saveRefreshToken(user._id, refreshToken, req);

    res.json({
      accessToken,
      refreshToken,
      accessTokenExpiresAt: accessExpiresAt(),
      user: toSafeUser(user),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: error.message || "Login failed" });
  }
});

router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const dbToken = await RefreshToken.findOne({ token: refreshToken });
    if (!dbToken || dbToken.expiresAt <= new Date()) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const accessToken = signAccessToken(user._id);
    return res.json({
      accessToken,
      accessTokenExpiresAt: accessExpiresAt(),
      user: toSafeUser(user),
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    res.json({ message: "Logged out" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Logout failed" });
  }
});

router.post("/logout-all", protect, async (req, res) => {
  try {
    await RefreshToken.deleteMany({ userId: req.user._id });
    res.json({ message: "Logged out from all devices" });
  } catch (error) {
    console.error("Logout all Error:", error);
    res.status(500).json({ message: "Logout all failed" });
  }
});

router.get("/me", protect, (req, res) => {
  res.json({ user: toSafeUser(req.user) });
});

router.patch("/me", protect, async (req, res) => {
  try {
    const { name, avatarUrl } = req.body || {};
    if (typeof name === "string" && name.trim()) {
      req.user.name = name.trim();
    }
    if (typeof avatarUrl === "string") {
      req.user.avatarUrl = avatarUrl.trim();
    }
    await req.user.save();
    res.json({ user: toSafeUser(req.user) });
  } catch (error) {
    console.error("Profile update Error:", error);
    res.status(500).json({ message: "Profile update failed" });
  }
});

router.get("/sessions", protect, async (req, res) => {
  try {
    const sessions = await RefreshToken.find({
      userId: req.user._id,
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .select("token device createdAt expiresAt");
    res.json({
      sessions: sessions.map((s) => ({
        id: s._id,
        device: s.device,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
      })),
    });
  } catch (error) {
    console.error("Sessions Error:", error);
    res.status(500).json({ message: "Failed to load sessions" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.json({ message: "If this email exists, reset instructions were sent" });
    }

    await PasswordResetToken.deleteMany({ userId: user._id });
    const token = jwt.sign({ id: user._id }, RESET_TOKEN_SECRET, { expiresIn: "15m" });
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await PasswordResetToken.create({ userId: user._id, token, expiresAt });

    console.log(
      `Password reset link (mock): http://localhost:5173/reset-password/${token}`
    );
    return res.json({ message: "If this email exists, reset instructions were sent" });
  } catch (error) {
    console.error("Forgot password Error:", error);
    return res.status(500).json({ message: "Forgot password failed" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const stored = await PasswordResetToken.findOne({ token });
    if (!stored || stored.expiresAt <= new Date()) {
      return res.status(400).json({ message: "Reset token is invalid or expired" });
    }

    const payload = jwt.verify(token, RESET_TOKEN_SECRET);
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    user.password = String(password);
    await user.save();
    await PasswordResetToken.deleteMany({ userId: user._id });
    await RefreshToken.deleteMany({ userId: user._id });
    return res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password Error:", error);
    return res.status(400).json({ message: "Reset token is invalid or expired" });
  }
});

export default router;
