import { motion } from "framer-motion";

export function XPProgress({ level, totalXP, progressPct, xpForNextLevel }) {
  return (
    <div className="flex min-w-[10rem] flex-col gap-2 rounded-2xl border border-mist-200/80 bg-white/70 px-4 py-3 shadow-glass-sm dark:border-white/10 dark:bg-ink-925/70">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist-500 dark:text-mist-400">
          Level
        </span>
        <motion.span
          key={level}
          initial={{ scale: 0.92, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-lg bg-accent/15 px-2 py-0.5 font-mono text-sm font-bold text-ink-900 dark:text-mist-50"
        >
          {level}
        </motion.span>
      </div>
      <div>
        <div className="mb-1 flex justify-between text-[10px] font-medium text-mist-600 dark:text-mist-400">
          <span>XP {totalXP}</span>
          <span>
            {progressPct}/{xpForNextLevel}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-mist-200/80 dark:bg-ink-950">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-accent"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          />
        </div>
      </div>
    </div>
  );
}
