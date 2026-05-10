import { motion } from "framer-motion";

export function Timer({ seconds, phase, totalSec }) {
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  const label = `${m}:${s.toString().padStart(2, "0")}`;
  const pct = totalSec > 0 ? (safe / totalSec) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-11">
        <svg className="-rotate-90" viewBox="0 0 36 36" aria-hidden>
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            className="stroke-mist-700/40 dark:stroke-mist-700/50"
            strokeWidth="2"
          />
          <motion.circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            className="stroke-accent"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={97.4}
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: 97.4 - (97.4 * pct) / 100 }}
            transition={{ type: "tween", duration: 0.35 }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-semibold tabular-nums text-ink-900 dark:text-mist-100">
          {phase === "finished" ? "✓" : s.toString().padStart(2, "0")}
        </span>
      </div>
      <div className="leading-tight">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist-500 dark:text-mist-400">
          Time
        </p>
        <p className="font-mono text-lg font-semibold tabular-nums text-ink-900 dark:text-mist-100">
          {phase === "finished" ? "0:00" : label}
        </p>
      </div>
    </div>
  );
}
