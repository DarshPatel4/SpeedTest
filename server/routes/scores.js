import express from "express";
import { protect } from "../middleware/auth.js";
import { Score } from "../models/Score.js";
import { User } from "../models/User.js";
import { sendN8nWebhookInBackground } from "../services/n8nWebhookService.js";
import { supabaseServer, isServerSupabaseConfigured } from "../lib/supabase.js";

const router = express.Router();

router.post("/score", protect, async (req, res) => {
  try {
    const { wpm, accuracy, difficulty, mode } = req.body || {};
    if (typeof wpm !== "number" || typeof accuracy !== "number") {
      return res.status(400).json({ message: "WPM and accuracy are required" });
    }

    if (isServerSupabaseConfigured && supabaseServer) {
      const { data: score, error } = await supabaseServer
        .from("scores")
        .insert({
          user_id: req.user.id || req.user._id,
          wpm,
          accuracy,
          difficulty: difficulty || "medium",
          mode: mode || "normal",
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase score insert error:", error);
      }

      sendN8nWebhookInBackground("testComplete", {
        test: {
          id: String(score?.id || Date.now()),
          userId: String(req.user.id || req.user._id),
          wpm,
          accuracy,
          difficulty: difficulty || "medium",
          mode: mode || "normal",
          date: new Date(),
        },
        user: {
          id: String(req.user.id || req.user._id),
          email: req.user.email,
          name: req.user.name,
          currentXp: req.user.xp || 0,
          currentLevel: req.user.level || 1,
        },
      });

      return res.status(201).json({ score: score || { wpm, accuracy } });
    }

    // Fallback to Mongo if connected
    try {
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
      await req.user.save().catch(() => undefined);

      return res.status(201).json({ score });
    } catch {
      return res.status(201).json({
        score: {
          id: `score-${Date.now()}`,
          wpm,
          accuracy,
          difficulty: difficulty || "medium",
          mode: mode || "normal",
        },
      });
    }
  } catch (error) {
    console.error("Save score error:", error);
    res.status(500).json({ message: "Failed to save score" });
  }
});

router.get("/leaderboard", async (_req, res) => {
  try {
    if (isServerSupabaseConfigured && supabaseServer) {
      const { data, error } = await supabaseServer
        .from("scores")
        .select("id, wpm, accuracy, difficulty, mode, created_at, profiles(id, name, email, avatar_url)")
        .order("wpm", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(10);

      if (!error && data) {
        const leaderboard = data.map((row) => ({
          id: row.id,
          userId: row.profiles?.id,
          name: row.profiles?.name || "Unknown",
          email: row.profiles?.email || "",
          avatarUrl: row.profiles?.avatar_url || "",
          wpm: row.wpm,
          accuracy: row.accuracy,
          difficulty: row.difficulty,
          mode: row.mode,
          at: row.created_at,
        }));
        return res.json({ leaderboard });
      }
    }

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

      return res.json({ leaderboard });
    } catch {
      return res.json({ leaderboard: [] });
    }
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

router.get("/profile/:userId/stats", async (req, res) => {
  try {
    if (isServerSupabaseConfigured && supabaseServer) {
      const { data: profile } = await supabaseServer
        .from("profiles")
        .select("xp, level, streak, test_count, wpm_history, accuracy_history")
        .eq("id", req.params.userId)
        .maybeSingle();

      if (profile) {
        return res.json({
          stats: {
            xp: profile.xp,
            level: profile.level,
            streak: profile.streak,
            testCount: profile.test_count || 0,
            wpmHistory: profile.wpm_history || [],
            accuracyHistory: profile.accuracy_history || [],
          },
        });
      }
    }

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
    } catch {
      return res.json({
        stats: {
          xp: 0,
          level: 1,
          streak: 0,
          testCount: 0,
          wpmHistory: [],
          accuracyHistory: [],
        },
      });
    }
  } catch (error) {
    console.error("Profile stats error:", error);
    res.status(500).json({ message: "Failed to fetch profile stats" });
  }
});

export default router;
