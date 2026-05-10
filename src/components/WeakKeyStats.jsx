import { useMemo } from "react";
import { motion } from "framer-motion";

const ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", ";"],
];

function normHeat(k) {
  if (!k || k.length !== 1) return null;
  return k.toLowerCase();
}

export function WeakKeyStats({ sessionMistakes, summaryLine, lifetimeLine }) {
  const max = useMemo(() => {
    if (!sessionMistakes) return 0;
    let m = 0;
    for (const v of Object.values(sessionMistakes)) {
      if (typeof v === "number" && v > m) m = v;
    }
    return m;
  }, [sessionMistakes]);

  return (
    <div className="mt-6 space-y-4">
      {summaryLine ? (
        <p className="rounded-2xl border border-mist-200/80 bg-mist-50/80 px-4 py-3 text-center text-sm font-medium leading-relaxed text-ink-800 dark:border-white/10 dark:bg-ink-950/50 dark:text-mist-200">
          {summaryLine}
        </p>
      ) : null}
      {lifetimeLine ? (
        <p className="rounded-2xl border border-accent/20 bg-accent/5 px-4 py-2 text-center text-xs font-medium text-mist-700 dark:text-mist-300">
          All-time: {lifetimeLine}
        </p>
      ) : null}

      <div>
        <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-mist-500 dark:text-mist-400">
          Session heatmap
        </p>
        <div className="flex flex-col items-center gap-1.5">
          {ROWS.map((row, ri) => (
            <div key={ri} className="flex flex-wrap justify-center gap-1">
              {row.map((key) => {
                const n = heatForKey(sessionMistakes, key);
                const opacity = max > 0 ? 0.25 + (n / max) * 0.75 : 0.15;
                return (
                  <motion.span
                    key={key}
                    className="flex h-8 min-w-[1.75rem] items-center justify-center rounded-lg border border-mist-200/60 font-mono text-[11px] font-semibold text-ink-900 dark:border-white/10 dark:text-mist-100"
                    style={{
                      backgroundColor: `rgba(56, 189, 248, ${opacity})`,
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {key}
                  </motion.span>
                );
              })}
            </div>
          ))}
          <div className="mt-1 flex justify-center">
            <motion.span
              className="flex h-9 min-w-[8rem] items-center justify-center rounded-lg border border-mist-200/60 font-mono text-[10px] font-semibold text-ink-900 dark:border-white/10 dark:text-mist-100"
              style={{
                backgroundColor: `rgba(56, 189, 248, ${heatSpace(sessionMistakes, max)})`,
              }}
            >
              space
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  );
}

function heatForKey(sessionMistakes, key) {
  if (!sessionMistakes) return 0;
  let n = 0;
  for (const [k, v] of Object.entries(sessionMistakes)) {
    if (normHeat(k) === key) n += v;
  }
  return n;
}

function heatSpace(sessionMistakes, max) {
  const n = sessionMistakes?.space ?? 0;
  if (max <= 0) return 0.15;
  return 0.25 + (n / max) * 0.75;
}

export function weakKeysSentence(sessionMistakes) {
  if (!sessionMistakes) return null;
  const entries = Object.entries(sessionMistakes)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([k]) => k);
  if (entries.length === 0) return null;
  return `You frequently mistype: ${entries.join(", ")}`;
}
