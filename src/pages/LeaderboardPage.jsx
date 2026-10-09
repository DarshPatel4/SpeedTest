import { useEffect, useState, useCallback } from "react";
import { fetchLeaderboard } from "../api/scores.js";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { motion } from "framer-motion";

export function LeaderboardPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLeaderboard();
      setRows(data);
      setError("");
    } catch (e) {
      setError(e.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Supabase Realtime live scores subscription
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel("public:scores")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "scores" },
          () => {
            loadData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [loadData]);

  const filteredRows = rows.filter((r) => {
    if (filterDifficulty === "all") return true;
    return r.difficulty === filterDifficulty;
  });

  return (
    <div className="min-h-screen px-4 py-8 text-mist-100 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header with Live Sync Status */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-pulse" />
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                Live Global Standings
              </span>
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Typeflow Hall of Fame
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs font-semibold text-mist-200 shadow-glass-sm transition hover:bg-white/10 disabled:opacity-50"
            >
              <span className={loading ? "animate-spin" : ""}>🔄</span>
              <span>{loading ? "Syncing..." : "Live Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur-xl">
          <span className="px-3 font-mono text-xs font-semibold text-mist-400 uppercase">
            Difficulty:
          </span>
          {["all", "easy", "medium", "hard"].map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => setFilterDifficulty(diff)}
              className={`rounded-xl px-3.5 py-1.5 font-mono text-xs font-bold uppercase transition ${
                filterDifficulty === diff
                  ? "bg-accent text-ink-950 shadow-[0_0_12px_rgba(56,189,248,0.45)]"
                  : "text-mist-400 hover:bg-white/5 hover:text-mist-200"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 font-mono text-sm text-rose-200">
            {error}
          </div>
        )}

        {/* Leaderboard Table Container */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-ink-950/80 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
          <table className="w-full text-left font-mono text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-mist-400">
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Runner</th>
                <th className="px-6 py-4">WPM</th>
                <th className="px-6 py-4">Accuracy</th>
                <th className="px-6 py-4">Mode / Diff</th>
                <th className="px-6 py-4 text-right">Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRows.map((row, idx) => {
                const rank = idx + 1;
                const isTop1 = rank === 1;
                const isTop2 = rank === 2;
                const isTop3 = rank === 3;

                return (
                  <motion.tr
                    key={row.id || idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`transition-colors hover:bg-white/[0.04] ${
                      isTop1
                        ? "bg-amber-500/[0.08]"
                        : isTop2
                        ? "bg-slate-300/[0.04]"
                        : isTop3
                        ? "bg-orange-500/[0.04]"
                        : ""
                    }`}
                  >
                    {/* Rank */}
                    <td className="px-6 py-4 font-bold">
                      {isTop1 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 px-2.5 py-1 text-xs text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                          🥇 #1
                        </span>
                      ) : isTop2 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-300/20 px-2.5 py-1 text-xs text-slate-200">
                          🥈 #2
                        </span>
                      ) : isTop3 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600/20 px-2.5 py-1 text-xs text-orange-300">
                          🥉 #3
                        </span>
                      ) : (
                        <span className="text-mist-500">#{rank}</span>
                      )}
                    </td>

                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 font-bold text-accent">
                          {row.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{row.name}</div>
                          {row.email && (
                            <div className="text-xs text-mist-500">{row.email}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* WPM */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-xl font-extrabold text-accent tabular-nums">
                        {row.wpm}
                      </span>
                      <span className="ml-1 text-[11px] text-mist-500">WPM</span>
                    </td>

                    {/* Accuracy */}
                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold tabular-nums ${
                          row.accuracy >= 97
                            ? "text-emerald-400"
                            : row.accuracy >= 92
                            ? "text-cyan-400"
                            : "text-amber-400"
                        }`}
                      >
                        {row.accuracy}%
                      </span>
                    </td>

                    {/* Mode / Diff */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-lg border border-white/5 bg-white/5 px-2 py-1 text-xs text-mist-300 capitalize">
                        {row.mode === "code" ? "⚡ Code" : "Normal"} · {row.difficulty}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-right text-xs text-mist-500">
                      {row.at ? new Date(row.at).toLocaleDateString() : "Recent"}
                    </td>
                  </motion.tr>
                );
              })}

              {filteredRows.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-mist-500">
                    No leaderboard scores found. Complete a typing run to set the first score!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
