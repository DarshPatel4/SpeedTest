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
      className="w-full max-w-4xl overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50/90 via-white/70 to-orange-50/50 p-5 shadow-glass-sm backdrop-blur-md dark:border-amber-500/20 dark:from-amber-950/40 dark:via-ink-900/60 dark:to-orange-950/30"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-800/90 dark:text-amber-200/90">
            Daily challenge · {dateKey}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-ink-900 dark:text-mist-50">
            Same passage for everyone today
          </h3>
          <p className="mt-2 font-mono text-sm leading-relaxed text-mist-700 dark:text-mist-300">
            {preview}
          </p>
          {bestWpm != null ? (
            <p className="mt-3 text-xs font-medium text-amber-900/80 dark:text-amber-200/90">
              Your best today: <span className="font-mono font-semibold">{bestWpm} WPM</span>
            </p>
          ) : (
            <p className="mt-3 text-xs text-mist-600 dark:text-mist-400">
              Finish a run with this passage to set your daily best.
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={onUseChallenge}
          className="shrink-0 rounded-2xl bg-ink-900 px-5 py-3 text-sm font-semibold text-white shadow-glass-sm transition hover:bg-ink-800 disabled:opacity-50 dark:bg-amber-500 dark:text-ink-950 dark:hover:brightness-110"
        >
          Use daily passage
        </button>
      </div>
    </motion.div>
  );
}
