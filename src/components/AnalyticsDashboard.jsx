import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function AnalyticsDashboard({ open, onClose, stats, onClear }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-x-0 bottom-0 top-16 z-[55] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-ink-950/65 backdrop-blur-sm dark:bg-black/55"
            aria-label="Close analytics"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative z-10 flex h-[min(92vh,920px)] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-mist-200/90 bg-mist-50/95 shadow-glass dark:border-white/10 dark:bg-ink-900/95"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
          >
            <div className="pointer-events-none absolute inset-0 bg-radial-glow opacity-80" />
            <div className="relative flex items-start justify-between gap-3 border-b border-mist-200/80 px-6 py-5 dark:border-white/10">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-mist-500 dark:text-mist-400">
                  Analytics
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink-900 dark:text-mist-50">
                  Performance history
                </h2>
                <p className="mt-1 text-sm text-mist-600 dark:text-mist-400">
                  Stored locally. Updates after each completed run.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-mist-200/90 bg-white/80 px-3 py-2 text-xs font-semibold text-ink-800 transition hover:bg-mist-100 dark:border-white/10 dark:bg-ink-925/80 dark:text-mist-100 dark:hover:bg-ink-900"
              >
                Close
              </button>
            </div>

            <div className="relative flex-1 overflow-y-auto overflow-x-hidden px-6 py-5">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { label: "Tests", value: stats.tests },
                  { label: "Avg WPM", value: stats.avgWpm },
                  { label: "Avg acc", value: `${stats.avgAccuracy}%` },
                  { label: "Best WPM", value: stats.bestWpm },
                ].map((c) => (
                  <motion.div
                    key={c.label}
                    layout
                    className="rounded-2xl border border-mist-200/80 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-ink-950/40"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-mist-500 dark:text-mist-400">
                      {c.label}
                    </p>
                    <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-ink-900 dark:text-mist-50">
                      {c.value}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="h-64 rounded-2xl border border-mist-200/80 bg-white/60 p-3 xl:col-span-2 dark:border-white/10 dark:bg-ink-950/35">
                  <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-mist-500 dark:text-mist-400">
                    WPM over tests
                  </p>
                  {stats.chartWpm.length === 0 ? (
                    <p className="py-12 text-center text-sm text-mist-500 dark:text-mist-400">
                      No history yet.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.chartWpm} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 6" className="stroke-mist-200 dark:stroke-mist-800" />
                        <XAxis dataKey="i" tick={{ fontSize: 10 }} stroke="#64748b" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#64748b" width={28} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: "1px solid rgba(148,163,184,0.35)",
                            fontSize: 12,
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="wpm" stroke="#38bdf8" strokeWidth={2} dot={false} name="WPM" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="h-64 rounded-2xl border border-mist-200/80 bg-white/60 p-3 dark:border-white/10 dark:bg-ink-950/35">
                  <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-mist-500 dark:text-mist-400">
                    Accuracy trend
                  </p>
                  {stats.chartAcc.length === 0 ? (
                    <p className="py-10 text-center text-sm text-mist-500 dark:text-mist-400">
                      No history yet.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.chartAcc} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 6" className="stroke-mist-200 dark:stroke-mist-800" />
                        <XAxis dataKey="i" tick={{ fontSize: 10 }} stroke="#64748b" />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#64748b" width={28} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: "1px solid rgba(148,163,184,0.35)",
                            fontSize: 12,
                          }}
                        />
                        <Line type="monotone" dataKey="acc" stroke="#34d399" strokeWidth={2} dot={false} name="Accuracy %" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-between gap-3 border-t border-mist-200/80 px-6 py-4 dark:border-white/10">
              <button
                type="button"
                onClick={onClear}
                className="rounded-xl border border-rose-200/90 bg-rose-50/80 px-4 py-2.5 text-xs font-semibold text-rose-900 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-100 dark:hover:bg-rose-950/70"
              >
                Clear history
              </button>
              <p className="text-xs text-mist-500">Esc to close</p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
