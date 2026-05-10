import express from "express";
import mongoose from "mongoose";
import { protectN8n } from "../middleware/n8nAuth.js";
import { DailyChallenge } from "../models/DailyChallenge.js";
import { LeaderboardSnapshot } from "../models/LeaderboardSnapshot.js";
import { Score } from "../models/Score.js";
import { User } from "../models/User.js";

const router = express.Router();

function toDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function computeLevel(xp) {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1);
}

router.get("/daily-challenge", async (_req, res) => {
  try {
    const todayKey = toDateKey();
    const challenge =
      (await DailyChallenge.findOne({ dateKey: todayKey })) ||
      (await DailyChallenge.findOne({}).sort({ dateKey: -1 }));

    if (!challenge) {
      return res.status(404).json({ message: "No daily challenge available" });
    }

    return res.json({
      challenge: {
        dateKey: challenge.dateKey,
        text: challenge.text,
        source: challenge.source,
        metadata: challenge.metadata || {},
      },
    });
  } catch (error) {
    console.error("Daily challenge fetch error:", error);
    return res.status(500).json({ message: "Failed to fetch daily challenge" });
  }
});

router.post("/automation/daily-challenge", protectN8n, async (req, res) => {
  try {
    const { dateKey = toDateKey(), text, source = "n8n", metadata = {} } = req.body || {};
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ message: "text is required" });
    }

    const challenge = await DailyChallenge.findOneAndUpdate(
      { dateKey: String(dateKey) },
      { $set: { text: text.trim(), source, metadata } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      message: "Daily challenge stored",
      challenge: { dateKey: challenge.dateKey, text: challenge.text, source: challenge.source },
    });
  } catch (error) {
    console.error("Daily challenge upsert error:", error);
    return res.status(500).json({ message: "Failed to store daily challenge" });
  }
});

router.post("/automation/xp-reward", protectN8n, async (req, res) => {
  try {
    const { userId, xpAwarded, reason = "workflow-award", metadata = {} } = req.body || {};
    if (!userId || !Number.isFinite(xpAwarded)) {
      return res.status(400).json({ message: "userId and numeric xpAwarded are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.xp = Math.max(0, (user.xp || 0) + Number(xpAwarded));
    user.level = computeLevel(user.xp);
    await user.save();

    return res.json({
      message: "XP reward applied",
      user: { id: user._id, xp: user.xp, level: user.level },
      reward: { xpAwarded: Number(xpAwarded), reason, metadata },
    });
  } catch (error) {
    console.error("XP reward automation error:", error);
    return res.status(500).json({ message: "Failed to apply XP reward" });
  }
});

router.get("/automation/reports/weekly", protectN8n, async (req, res) => {
  try {
    const { userId, days = "7" } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "userId query param is required" });
    }

    const lookbackDays = Math.max(1, Number(days) || 7);
    const fromDate = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);
    const objectId = new mongoose.Types.ObjectId(String(userId));

    const [user, stats] = await Promise.all([
      User.findById(objectId).select("name email xp level streak"),
      Score.aggregate([
        { $match: { userId: objectId, date: { $gte: fromDate } } },
        {
          $group: {
            _id: "$userId",
            testsCount: { $sum: 1 },
            avgWpm: { $avg: "$wpm" },
            avgAccuracy: { $avg: "$accuracy" },
            bestWpm: { $max: "$wpm" },
            latestTestAt: { $max: "$date" },
          },
        },
      ]),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const summary = stats[0] || {
      testsCount: 0,
      avgWpm: 0,
      avgAccuracy: 0,
      bestWpm: 0,
      latestTestAt: null,
    };

    return res.json({
      report: {
        rangeDays: lookbackDays,
        generatedAt: new Date().toISOString(),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          xp: user.xp || 0,
          level: user.level || 1,
          streak: user.streak || 0,
        },
        performance: {
          testsCount: summary.testsCount,
          avgWpm: Number(summary.avgWpm || 0).toFixed(1),
          avgAccuracy: Number(summary.avgAccuracy || 0).toFixed(1),
          bestWpm: summary.bestWpm || 0,
          latestTestAt: summary.latestTestAt,
        },
      },
    });
  } catch (error) {
    console.error("Weekly report generation error:", error);
    return res.status(500).json({ message: "Failed to generate weekly report" });
  }
});

router.post("/automation/leaderboard/recompute", protectN8n, async (req, res) => {
  try {
    const { dateKey = toDateKey(), topN = 100, source = "n8n" } = req.body || {};
    const size = Math.max(1, Math.min(500, Number(topN) || 100));

    const ranking = await Score.aggregate([
      {
        $group: {
          _id: "$userId",
          wpm: { $max: "$wpm" },
          accuracy: { $avg: "$accuracy" },
          testsCount: { $sum: 1 },
        },
      },
      { $sort: { wpm: -1, accuracy: -1, testsCount: -1 } },
      { $limit: size },
    ]);

    const now = new Date();
    const rankedEntries = ranking.map((row, index) => ({
      userId: row._id,
      wpm: row.wpm,
      accuracy: Number(Number(row.accuracy || 0).toFixed(1)),
      testsCount: row.testsCount,
      rank: index + 1,
    }));

    if (rankedEntries.length > 0) {
      const bulk = rankedEntries.map((entry) => ({
        updateOne: {
          filter: { _id: entry.userId },
          update: {
            $set: {
              leaderboardRank: entry.rank,
              leaderboardScore: entry.wpm,
              lastLeaderboardSyncAt: now,
            },
          },
        },
      }));
      await User.bulkWrite(bulk, { ordered: false });
    }

    await LeaderboardSnapshot.findOneAndUpdate(
      { dateKey: String(dateKey) },
      {
        $set: {
          entries: rankedEntries,
          totalRankedUsers: rankedEntries.length,
          source,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      message: "Leaderboard recomputed",
      dateKey: String(dateKey),
      totalRankedUsers: rankedEntries.length,
      top: rankedEntries.slice(0, 10),
    });
  } catch (error) {
    console.error("Leaderboard recompute error:", error);
    return res.status(500).json({ message: "Failed to recompute leaderboard" });
  }
});

export default router;
