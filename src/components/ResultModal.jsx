import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { WeakKeyStats, weakKeysSentence } from "./WeakKeyStats.jsx";

export function ResultModal({
  open,
  onClose,
  onRetry,
  wpm,
  cpm,
  accuracy,
  errors,
  durationSec,
  wpmSeries,
  sessionMistakes,
  lifetimeWeakSummary,
  onPracticeWeak,
}) {
  const data = wpmSeries.length
    ? wpmSeries
    : [{ t: 0, wpm }, { t: durationSec, wpm }];

  const weakLine = weakKeysSentence(sessionMistakes);
  const showWeak =
    lifetimeWeakSummary ||
    (sessionMistakes && Object.keys(sessionMistakes).length > 0);

  // Performance tier
  const tier = useMemo(() => {
    if (wpm >= 100) return { title: "TIER S · APEX FLOW", color: "from-fuchsia-500 to-rose-500", border: "border-fuchsia-500/40", text: "text-fuchsia-300", icon: "🏆" };
    if (wpm >= 80) return { title: "TIER A · CYBER MASTER", color: "from-sky-400 to-cyan-300", border: "border-sky-500/40", text: "text-sky-300", icon: "⚡" };
    if (wpm >= 60) return { title: "TIER B · SWIFT RUNNER", color: "from-emerald-400 to-teal-300", border: "border-emerald-500/40", text: "text-emerald-300", icon: "🚀" };
    if (wpm >= 40) return { title: "TIER C · STEADY CADENCE", color: "from-amber-400 to-yellow-300", border: "border-amber-500/40", text: "text-amber-300", icon: "🎯" };
    return { title: "TIER D · ROOKIE WARMUP", color: "from-slate-400 to-slate-300", border: "border-slate-500/40", text: "text-mist-300", icon: "🌱" };
  }, [wpm]);

  const xpEarned = Math.round(wpm + accuracy);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            aria-label="Close"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative z-10 my-6 w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-ink-900/95 via-ink-950/98 to-ink-950 p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-white/15"
            initial={{ y: 24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          >
            {/* Header Tier Pill */}
            <div className="flex flex-col items-center justify-center text-center">
              <div
                className={`inline-flex items-center gap-2 rounded-2xl border ${tier.border} bg-white/5 px-4 py-1.5 font-mono text-xs font-bold ${tier.text} shadow-glass-sm`}
              >
                <span>{tier.icon}</span>
                <span>{tier.title}</span>
              </div>

              {/* Main WPM display */}
              <h2 className="mt-4 flex items-baseline gap-2 font-mono text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
                <CountUp value={wpm} />
                <span className="text-xl font-bold uppercase tracking-wider text-accent">wpm</span>
              </h2>

              <p className="mt-1 font-mono text-xs text-mist-400">
                {durationSec}s Sprint · <span className="text-emerald-400">{accuracy}% Accuracy</span> · {errors} Mistakes
              </p>

              {/* XP Gain badge */}
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-300">
                <span>✨ +{xpEarned} XP Earned</span>
              </div>
            </div>

            {/* Metrics & Graph Grid */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {/* Stat Tiles */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="CPM" value={cpm} />
                  <StatCard label="Accuracy" value={`${accuracy}%`} accentColor="text-emerald-400" />
                  <StatCard label="Errors" value={errors} accentColor={errors > 0 ? "text-rose-400" : "text-mist-200"} />
                </div>

                {showWeak ? (
                  <WeakKeyStats
                    sessionMistakes={sessionMistakes || {}}
                    summaryLine={weakLine}
                    lifetimeLine={lifetimeWeakSummary}
                  />
                ) : (
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center font-mono text-xs text-mist-400">
                    🎯 Clean run! Zero repetitive weak keys detected.
                  </div>
                )}
              </div>

              {/* Live WPM Pace Progression Chart */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="mb-2 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">
                  Sprint Pace Telemetry
                </p>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 6" className="stroke-mist-800/60" />
                      <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#94a3b8" }} stroke="#334155" />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} stroke="#334155" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0b0e14",
                          borderColor: "rgba(255,255,255,0.15)",
                          borderRadius: "12px",
                          fontSize: "12px",
                          color: "#fff",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="wpm"
                        stroke="#38bdf8"
                        strokeWidth={2.5}
                        fill="url(#wpmGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onRetry}
                className="flex-1 rounded-2xl bg-gradient-to-r from-accent to-sky-400 px-6 py-4 font-mono text-sm font-bold text-ink-950 shadow-lg shadow-accent/25 transition hover:brightness-110"
              >
                ⚡ Retry Sprint (Alt+R)
              </button>
              {onPracticeWeak && (
                <button
                  type="button"
                  onClick={onPracticeWeak}
                  className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 font-mono text-sm font-bold text-amber-200 transition hover:bg-amber-500/20"
                >
                  Drill Weak Keys
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-mono text-sm font-semibold text-mist-200 transition hover:bg-white/10"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function StatCard({ label, value, accentColor = "text-white" }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-center">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-mist-400">
        {label}
      </p>
      <p className={`mt-1 font-mono text-xl font-bold tabular-nums ${accentColor}`}>
        {typeof value === "number" ? <CountUp value={value} /> : value}
      </p>
    </div>
  );
}

function CountUp({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const duration = 500;
    const from = 0;
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - (1 - p) * (1 - p);
      setDisplay(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return display;
}
