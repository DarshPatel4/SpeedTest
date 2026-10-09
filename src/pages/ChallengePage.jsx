import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStreak } from "../hooks/useStreak.js";
import { fetchDailyChallengeFromSupabase } from "../api/passages.js";
import { motion } from "framer-motion";
import { Flame, Zap } from "lucide-react";

export function ChallengePage() {
  const navigate = useNavigate();
  const { todayBest, streak } = useStreak();
  const [challenge, setChallenge] = useState({
    dateKey: new Date().toISOString().slice(0, 10),
    text: "PowerBuilder applications leverage PowerScript for event-driven business logic, robust DataWindow manipulations, and low-latency database transactions.",
    title: "Daily Official Sprint",
    fromSupabase: false,
  });

  useEffect(() => {
    fetchDailyChallengeFromSupabase().then((data) => {
      if (data?.text) setChallenge(data);
    });
  }, []);

  return (
    <div className="min-h-screen px-4 py-8 text-mist-100 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.9)] animate-pulse" />
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-orange-400">
                Daily Sprint {challenge.dateKey}
              </span>
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Daily Challenge Arena
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3.5 py-1.5 font-mono text-xs font-bold text-orange-300">
              <Flame className="h-3.5 w-3.5 text-orange-400 fill-orange-400" />
              <span>{streak} Day Streak</span>
            </span>
            {todayBest != null && (
              <span className="flex items-center gap-1.5 rounded-xl border border-accent/30 bg-accent/10 px-3.5 py-1.5 font-mono text-xs font-bold text-accent">
                <Zap className="h-3.5 w-3.5 text-accent" />
                <span>Best: {todayBest} WPM</span>
              </span>
            )}
          </div>
        </div>

        {/* Challenge Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#121620]/90 to-ink-950 p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="font-mono text-xs font-semibold text-accent uppercase">
              {challenge.title || "Universal Daily Sprint"}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Synced from Supabase</span>
            </span>
          </div>

          <p className="mt-6 font-mono text-lg leading-relaxed text-slate-100 sm:text-xl">
            {challenge.text}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-white/10 pt-6">
            <div className="font-mono text-xs text-slate-400">
              Rule: Type this exact passage on the main arena to lock in your daily ranking.
            </div>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-2xl bg-gradient-to-r from-accent to-sky-400 px-6 py-3 font-mono text-sm font-bold text-ink-950 shadow-glass-sm transition hover:brightness-110"
            >
              Start Daily Sprint Now →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
