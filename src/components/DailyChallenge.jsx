import { motion } from "framer-motion";

export function DailyChallenge({
  challengeText,
  dateKey,
  bestWpm,
  onUseChallenge,
  disabled,
}) {
  const preview =
    challengeText.length > 120 ? `${challengeText.slice(0, 118)}…` : challengeText;

  return (
    <motion.div
      layout
      className="w-full overflow-hidden rounded-2xl border border-amber-200/40 bg-gradient-to-br from-amber-50/70 via-white/50 to-orange-50/40 p-3.5 dark:border-amber-500/20 dark:from-amber-950/35 dark:via-ink-900/40 dark:to-orange-950/20"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-800/90 dark:text-amber-200/90">
            Daily challenge · {dateKey}
          </p>
          <h3 className="mt-1.5 text-sm font-semibold text-ink-900 dark:text-mist-50">
            Same passage for everyone today
          </h3>
          <p className="mt-1.5 line-clamp-3 font-mono text-xs leading-relaxed text-mist-700 dark:text-mist-300">
            {preview}
          </p>
          {bestWpm != null ? (
            <p className="mt-2 text-[11px] font-medium text-amber-900/80 dark:text-amber-200/90">
              Your best today: <span className="font-mono font-semibold">{bestWpm} WPM</span>
            </p>
          ) : (
            <p className="mt-2 text-[11px] text-mist-600 dark:text-mist-400">
              Finish a run with this passage to set your daily best.
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={onUseChallenge}
          className="w-full rounded-xl bg-ink-900 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-ink-800 disabled:opacity-50 dark:bg-amber-500 dark:text-ink-950 dark:hover:brightness-110"
        >
          Use daily passage
        </button>
      </div>
    </motion.div>
  );
}
