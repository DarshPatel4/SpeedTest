import { motion } from "framer-motion";

function StatCard({ label, value, suffix, accent }) {
  return (
    <motion.div
      layout
      className="group relative overflow-hidden rounded-2xl border border-mist-200/80 bg-white/70 px-4 py-3 shadow-glass-sm backdrop-blur-md dark:border-white/10 dark:bg-ink-900/50"
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl ${accent}`}
        aria-hidden
      />
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-500 dark:text-mist-400">
        {label}
      </p>
      <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-ink-900 dark:text-mist-50">
        {value}
        {suffix ? (
          <span className="ml-0.5 text-sm font-medium text-mist-500 dark:text-mist-400">
            {suffix}
          </span>
        ) : null}
      </p>
    </motion.div>
  );
}

export function StatsPanel({ wpm, cpm, accuracy, errors }) {
  return (
    <motion.div
      layout
      className="grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4"
      initial={false}
    >
      <StatCard
        label="WPM"
        value={wpm}
        suffix=""
        accent="bg-accent/15 dark:bg-accent/20"
      />
      <StatCard
        label="CPM"
        value={cpm}
        suffix=""
        accent="bg-violet-400/15 dark:bg-violet-500/20"
      />
      <StatCard
        label="Accuracy"
        value={accuracy}
        suffix="%"
        accent="bg-emerald-400/15 dark:bg-emerald-400/20"
      />
      <StatCard
        label="Errors"
        value={errors}
        suffix=""
        accent="bg-rose-400/15 dark:bg-rose-400/20"
      />
    </motion.div>
  );
}
