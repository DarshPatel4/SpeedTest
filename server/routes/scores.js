import express from "express";
import { protect } from "../middleware/auth.js";
import { Score } from "../models/Score.js";
import { User } from "../models/User.js";
import { sendN8nWebhookInBackground } from "../services/n8nWebhookService.js";

const router = express.Router();

router.post("/score", protect, async (req, res) => {
  try {
    const { wpm, accuracy, difficulty, mode } = req.body || {};
    if (typeof wpm !== "number" || typeof accuracy !== "number") {
      return res.status(400).json({ message: "WPM and accuracy are required" });
    }

    const score = await Score.create({
      userId: req.user._id,
      wpm,
      accuracy,
      difficulty: difficulty || "medium",
      mode: mode || "normal",
      date: new Date(),
    });

    req.user.testCount = (req.user.testCount || 0) + 1;
    req.user.wpmHistory = [...(req.user.wpmHistory || []), wpm].slice(-100);
    req.user.accuracyHistory = [...(req.user.accuracyHistory || []), accuracy].slice(-100);
    await req.user.save();

    sendN8nWebhookInBackground("testComplete", {
      test: {
        id: String(score._id),
        userId: String(req.user._id),
        wpm: score.wpm,
        accuracy: score.accuracy,
        difficulty: score.difficulty,
        mode: score.mode,
        date: score.date,
      },
      user: {
        id: String(req.user._id),
        email: req.user.email,
        name: req.user.name,
        currentXp: req.user.xp || 0,
        currentLevel: req.user.level || 1,
      },
    });

    res.status(201).json({ score });
  } catch (error) {
    console.error("Save score error:", error);
    res.status(500).json({ message: "Failed to save score" });
  }
});

router.get("/leaderboard", async (_req, res) => {
  try {
    const topScores = await Score.find({})
      .sort({ wpm: -1, createdAt: 1 })
      .limit(10)
      .populate("userId", "name email avatarUrl");

    const leaderboard = topScores.map((row) => ({
      id: row._id,
      userId: row.userId?._id,
      name: row.userId?.name || "Unknown",
      email: row.userId?.email || "",
      avatarUrl: row.userId?.avatarUrl || "",
      wpm: row.wpm,
      accuracy: row.accuracy,
      difficulty: row.difficulty,
      mode: row.mode,
      at: row.date,
    }));

    res.json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

router.get("/profile/:userId/stats", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "xp level streak testCount wpmHistory accuracyHistory"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({
      stats: {
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        testCount: user.testCount || 0,
        wpmHistory: user.wpmHistory || [],
        accuracyHistory: user.accuracyHistory || [],
      },
    });
  } catch (error) {
    console.error("Profile stats error:", error);
    res.status(500).json({ message: "Failed to fetch profile stats" });
  }
});

export default router;
