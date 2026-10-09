import express from "express";
import mongoose from "mongoose";
import { protectN8n } from "../middleware/n8nAuth.js";
import { DailyChallenge } from "../models/DailyChallenge.js";
import { LeaderboardSnapshot } from "../models/LeaderboardSnapshot.js";
import { Score } from "../models/Score.js";
import { User } from "../models/User.js";
import { supabaseServer, isServerSupabaseConfigured } from "../lib/supabase.js";

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

    if (isServerSupabaseConfigured && supabaseServer) {
      const { data: challenge } = await supabaseServer
        .from("daily_challenges")
        .select("date_key, text, source, metadata")
        .eq("date_key", todayKey)
        .maybeSingle();

      if (challenge) {
        return res.json({
          challenge: {
            dateKey: challenge.date_key,
            text: challenge.text,
            source: challenge.source,
            metadata: challenge.metadata || {},
          },
        });
      }

      // Latest challenge fallback
      const { data: latest } = await supabaseServer
        .from("daily_challenges")
        .select("date_key, text, source, metadata")
        .order("date_key", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latest) {
        return res.json({
          challenge: {
            dateKey: latest.date_key,
            text: latest.text,
            source: latest.source,
            metadata: latest.metadata || {},
          },
        });
      }
    }

    try {
      const challenge =
        (await DailyChallenge.findOne({ dateKey: todayKey })) ||
        (await DailyChallenge.findOne({}).sort({ dateKey: -1 }));

      if (challenge) {
        return res.json({
          challenge: {
            dateKey: challenge.dateKey,
            text: challenge.text,
            source: challenge.source,
            metadata: challenge.metadata || {},
          },
        });
      }
    } catch {
      // ignore
    }

    return res.status(404).json({ message: "No daily challenge available" });
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

    if (isServerSupabaseConfigured && supabaseServer) {
      const { data, error } = await supabaseServer
        .from("daily_challenges")
        .upsert(
          {
            date_key: String(dateKey),
            text: text.trim(),
            source,
            metadata,
          },
          { onConflict: "date_key" }
        )
        .select()
        .single();

      if (error) throw new Error(error.message);

      return res.json({
        message: "Daily challenge stored",
        challenge: { dateKey: data.date_key, text: data.text, source: data.source },
      });
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

    if (isServerSupabaseConfigured && supabaseServer) {
      const { data: profile } = await supabaseServer
        .from("profiles")
        .select("xp, level")
        .eq("id", userId)
        .maybeSingle();

      if (!profile) return res.status(404).json({ message: "User not found" });

      const newXp = Math.max(0, (profile.xp || 0) + Number(xpAwarded));
      const newLevel = computeLevel(newXp);

      await supabaseServer
        .from("profiles")
        .update({ xp: newXp, level: newLevel, updated_at: new Date().toISOString() })
        .eq("id", userId);

      return res.json({
        message: "XP reward applied",
        user: { id: userId, xp: newXp, level: newLevel },
        reward: { xpAwarded: Number(xpAwarded), reason, metadata },
      });
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
    const fromDate = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString();

    if (isServerSupabaseConfigured && supabaseServer) {
      const { data: profile } = await supabaseServer
        .from("profiles")
        .select("id, name, email, xp, level, streak")
        .eq("id", userId)
        .maybeSingle();

      if (!profile) return res.status(404).json({ message: "User not found" });

      const { data: scores } = await supabaseServer
        .from("scores")
        .select("wpm, accuracy, created_at")
        .eq("user_id", userId)
        .gte("created_at", fromDate);

      const list = scores || [];
      const testsCount = list.length;
      const avgWpm = testsCount ? (list.reduce((s, r) => s + r.wpm, 0) / testsCount).toFixed(1) : "0.0";
      const avgAccuracy = testsCount ? (list.reduce((s, r) => s + Number(r.accuracy), 0) / testsCount).toFixed(1) : "0.0";
      const bestWpm = testsCount ? Math.max(...list.map((r) => r.wpm)) : 0;
      const latestTestAt = testsCount ? list[list.length - 1].created_at : null;

      return res.json({
        report: {
          rangeDays: lookbackDays,
          generatedAt: new Date().toISOString(),
          user: profile,
          performance: { testsCount, avgWpm, avgAccuracy, bestWpm, latestTestAt },
        },
      });
    }

    const objectId = new mongoose.Types.ObjectId(String(userId));
    const [user, stats] = await Promise.all([
      User.findById(objectId).select("name email xp level streak"),
      Score.aggregate([
        { $match: { userId: objectId, date: { $gte: new Date(fromDate) } } },
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

    if (isServerSupabaseConfigured && supabaseServer) {
      const { data: scores } = await supabaseServer
        .from("scores")
        .select("user_id, wpm, accuracy")
        .order("wpm", { ascending: false })
        .limit(size);

      const rankedEntries = (scores || []).map((row, idx) => ({
        userId: row.user_id,
        wpm: row.wpm,
        accuracy: row.accuracy,
        rank: idx + 1,
      }));

      await supabaseServer.from("leaderboard_snapshots").upsert(
        {
          date_key: String(dateKey),
          entries: rankedEntries,
          total_ranked_users: rankedEntries.length,
          source,
        },
        { onConflict: "date_key" }
      );

      return res.json({
        message: "Leaderboard recomputed",
        dateKey: String(dateKey),
        totalRankedUsers: rankedEntries.length,
        top: rankedEntries.slice(0, 10),
      });
    }

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

    const rankedEntries = ranking.map((row, index) => ({
      userId: row._id,
      wpm: row.wpm,
      accuracy: Number(Number(row.accuracy || 0).toFixed(1)),
      testsCount: row.testsCount,
      rank: index + 1,
    }));

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
