import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return "—";
  }
}

function formatDifficulty(d) {
  if (!d || d === "—") return "—";
  if (d === "Unknown") return "Unknown";
  return d.charAt(0).toUpperCase() + d.slice(1);
}

export function Leaderboard({ open, onClose, rows, onClear }) {
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

  const sorted = [...rows].sort((a, b) => b.wpm - a.wpm).slice(0, 10);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-ink-950/65 backdrop-blur-sm dark:bg-black/55"
            aria-label="Close leaderboard"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lb-title"
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-mist-200/90 bg-mist-50/95 shadow-glass dark:border-white/10 dark:bg-ink-900/95"
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <div className="pointer-events-none absolute inset-0 bg-radial-glow opacity-80" />
            <div className="relative border-b border-mist-200/80 px-6 py-5 dark:border-white/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    id="lb-title"
                    className="text-[11px] font-semibold uppercase tracking-[0.3em] text-mist-500 dark:text-mist-400"
                  >
                    Leaderboard
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink-900 dark:text-mist-50">
                    Top 10 runs
                  </h2>
                  <p className="mt-1 text-sm text-mist-600 dark:text-mist-400">
                    Sorted by WPM. Stored locally on this device.
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
            </div>

            <div className="relative max-h-[min(70vh,520px)] overflow-auto px-4 py-4 sm:px-6">
              {sorted.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-mist-300/90 bg-white/50 px-4 py-10 text-center text-sm text-mist-600 dark:border-white/15 dark:bg-ink-950/30 dark:text-mist-400">
                  Complete a timed test to record your first score.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-mist-200/80 bg-white/60 dark:border-white/10 dark:bg-ink-950/35">
                  <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-mist-200/80 text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-500 dark:border-white/10 dark:text-mist-400">
                        <th className="px-4 py-3">Rank</th>
                        <th className="px-4 py-3">WPM</th>
                        <th className="px-4 py-3">Accuracy</th>
                        <th className="px-4 py-3">Difficulty</th>
                        <th className="px-4 py-3 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((r, i) => {
                        const best = i === 0;
                        return (
                          <motion.tr
                            key={r.id}
                            layout
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className={`border-b border-mist-200/60 last:border-0 dark:border-white/5 ${
                              best
                                ? "bg-accent/10 ring-1 ring-inset ring-accent/25 dark:bg-accent/15"
                                : "hover:bg-mist-50/90 dark:hover:bg-white/[0.03]"
                            }`}
                          >
                            <td className="px-4 py-3 font-mono text-xs text-mist-600 dark:text-mist-400">
                              #{i + 1}
                              {best ? (
                                <span className="ml-2 rounded-md bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-900 dark:text-mist-50">
                                  Best
                                </span>
                              ) : null}
                            </td>
                            <td className="px-4 py-3 font-mono font-semibold tabular-nums text-ink-900 dark:text-mist-100">
                              {r.wpm}
                            </td>
                            <td className="px-4 py-3 font-mono tabular-nums text-mist-700 dark:text-mist-300">
                              {typeof r.accuracy === "number"
                                ? `${r.accuracy}%`
                                : r.accuracy}
                            </td>
                            <td className="px-4 py-3 text-mist-700 dark:text-mist-300">
                              {formatDifficulty(r.difficulty)}
                            </td>
                            <td className="px-4 py-3 text-right text-xs text-mist-600 dark:text-mist-400">
                              {formatDate(r.at)}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-mist-200/80 px-6 py-4 dark:border-white/10">
              <button
                type="button"
                onClick={onClear}
                className="rounded-xl border border-rose-200/90 bg-rose-50/80 px-4 py-2.5 text-xs font-semibold text-rose-900 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-100 dark:hover:bg-rose-950/70"
              >
                Clear leaderboard
              </button>
              <p className="text-xs text-mist-500 dark:text-mist-500">
                Press Esc to close
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
