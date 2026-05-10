import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
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

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm dark:bg-black/60"
            aria-label="Close"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative z-10 mx-auto my-4 w-full max-w-6xl rounded-3xl border border-mist-200/90 bg-mist-50/95 shadow-glass dark:border-white/10 dark:bg-ink-900/95"
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <div className="pointer-events-none absolute inset-0 bg-radial-glow opacity-90" />
            <div className="relative p-8">
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.35em] text-mist-500 dark:text-mist-400">
                Session complete
              </p>
              <h2 className="mt-2 text-center text-4xl font-bold tracking-tight text-ink-900 dark:text-mist-50 sm:text-5xl">
                <CountUp value={wpm} /> wpm
              </h2>
              <p className="mt-1 text-center text-sm text-mist-600 dark:text-mist-400">
                {durationSec}s test · {accuracy}% accuracy · {errors} errors
              </p>

              <div className="mt-10 grid gap-6 xl:grid-cols-2">
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
                    {[
                      { label: "CPM", value: cpm },
                      { label: "Accuracy", value: `${accuracy}%` },
                      { label: "Errors", value: errors },
                    ].map((x) => (
                      <div
                        key={x.label}
                        className="rounded-2xl border border-mist-200/90 bg-white/80 px-4 py-4 text-center dark:border-white/10 dark:bg-ink-925/80"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-mist-500 dark:text-mist-400">
                          {x.label}
                        </p>
                        <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-ink-900 dark:text-mist-100">
                          {typeof x.value === "number" ? <CountUp value={x.value} /> : x.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {showWeak ? (
                    <WeakKeyStats
                      sessionMistakes={sessionMistakes || {}}
                      summaryLine={weakLine}
                      lifetimeLine={lifetimeWeakSummary}
                    />
                  ) : null}
                </div>

                <div className="h-72 w-full rounded-2xl border border-mist-200/80 bg-white/60 p-4 dark:border-white/10 dark:bg-ink-950/40">
                  <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-mist-500 dark:text-mist-400">
                    Pace
                  </p>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="wpmFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 6" className="stroke-mist-200 dark:stroke-mist-800" />
                      <XAxis dataKey="t" tick={{ fontSize: 10 }} stroke="#64748b" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#64748b" width={28} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid rgba(148,163,184,0.35)",
                          fontSize: 12,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="wpm"
                        stroke="#38bdf8"
                        strokeWidth={2}
                        fill="url(#wpmFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex-1 rounded-2xl bg-ink-900 px-4 py-3.5 text-sm font-semibold text-mist-50 shadow-glass-sm transition hover:bg-ink-800 dark:bg-accent dark:text-ink-950 dark:hover:brightness-110"
                >
                  Try again
                </button>
                {onPracticeWeak ? (
                  <button
                    type="button"
                    onClick={onPracticeWeak}
                    className="rounded-2xl border border-mist-200/90 bg-white/80 px-4 py-3.5 text-sm font-semibold text-ink-800 transition hover:bg-mist-100 dark:border-white/10 dark:bg-ink-925/80 dark:text-mist-100 dark:hover:bg-ink-900"
                  >
                    Drill weak keys
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-mist-200/90 bg-white/80 px-4 py-3.5 text-sm font-semibold text-ink-800 transition hover:bg-mist-100 dark:border-white/10 dark:bg-ink-925/80 dark:text-mist-100 dark:hover:bg-ink-900"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
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
