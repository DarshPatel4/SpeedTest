import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { apiUrl, authFetch } from "./client.js";

const LOCAL_SCORES_KEY = "typeflow-local-scores-v1";

function loadLocalScores() {
  try {
    const raw = localStorage.getItem(LOCAL_SCORES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalScore(item) {
  try {
    const list = loadLocalScores();
    list.unshift(item);
    localStorage.setItem(LOCAL_SCORES_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    // ignore
  }
}

export async function saveScore(payload) {
  const { wpm, accuracy, difficulty = "medium", mode = "normal" } = payload || {};

  if (isSupabaseConfigured && supabase) {
    const { data: sessData } = await supabase.auth.getSession();
    const user = sessData?.session?.user;

    if (user) {
      // 1. Insert into scores table
      const { data: score, error: scoreErr } = await supabase
        .from("scores")
        .insert({
          user_id: user.id,
          wpm,
          accuracy,
          difficulty,
          mode,
        })
        .select()
        .single();

      if (scoreErr) {
        console.warn("Could not save score to Supabase:", scoreErr.message);
      }

      // 2. Update user profile stats
      const { data: profile } = await supabase
        .from("profiles")
        .select("test_count, wpm_history, accuracy_history")
        .eq("id", user.id)
        .maybeSingle();

      const newTestCount = (profile?.test_count || 0) + 1;
      const newWpmHistory = [...(profile?.wpm_history || []), wpm].slice(-100);
      const newAccHistory = [...(profile?.accuracy_history || []), accuracy].slice(-100);

      await supabase
        .from("profiles")
        .update({
          test_count: newTestCount,
          wpm_history: newWpmHistory,
          accuracy_history: newAccHistory,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      return { score: score || { wpm, accuracy, difficulty, mode } };
    }
  }

  // Local fallback
  const localScore = {
    id: `score-${Date.now()}`,
    wpm,
    accuracy,
    difficulty,
    mode,
    date: new Date().toISOString(),
  };
  saveLocalScore(localScore);
  return { score: localScore };
}

export async function fetchLeaderboard() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("scores")
      .select("id, wpm, accuracy, difficulty, mode, created_at, profiles(id, name, email, avatar_url)")
      .order("wpm", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(10);

    if (error) {
      console.warn("Error fetching Supabase leaderboard:", error.message);
    } else if (data && data.length > 0) {
      return data.map((row) => ({
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
    }
  }

  // Fallback to local stored scores or empty array
  const local = loadLocalScores();
  return local.map((s, idx) => ({
    id: s.id || `local-${idx}`,
    name: "Guest Runner",
    email: "",
    wpm: s.wpm,
    accuracy: s.accuracy,
    difficulty: s.difficulty,
    mode: s.mode,
    at: s.date,
  }));
}

export async function fetchProfileStats(userId) {
  if (isSupabaseConfigured && supabase && userId && userId !== "local-user-id") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("xp, level, streak, test_count, wpm_history, accuracy_history")
      .eq("id", userId)
      .maybeSingle();

    if (profile) {
      return {
        xp: profile.xp || 0,
        level: profile.level || 1,
        streak: profile.streak || 0,
        testCount: profile.test_count || 0,
        wpmHistory: profile.wpm_history || [],
        accuracyHistory: profile.accuracy_history || [],
      };
    }
  }

  const scores = loadLocalScores();
  return {
    xp: 0,
    level: 1,
    streak: scores.length > 0 ? 1 : 0,
    testCount: scores.length,
    wpmHistory: scores.map((s) => s.wpm),
    accuracyHistory: scores.map((s) => s.accuracy),
  };
}
