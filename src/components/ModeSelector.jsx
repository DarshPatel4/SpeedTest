import { motion } from "framer-motion";

const MODES = [
  { id: "normal", label: "Normal", hint: "Prose" },
  { id: "code", label: "Code", hint: "Dev mode" },
];

export function ModeSelector({ value, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist-500 dark:text-mist-400">
        Mode
      </p>
      <div
        className="inline-flex rounded-2xl border border-mist-200/90 bg-mist-100/50 p-1 shadow-inner dark:border-white/10 dark:bg-ink-950/50"
        role="tablist"
        aria-label="Typing mode"
      >
        {MODES.map((m) => {
          const active = value === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={disabled}
              onClick={() => onChange(m.id)}
              className={`relative flex min-w-[6rem] flex-col items-center rounded-xl px-4 py-2 text-center transition ${
                disabled ? "cursor-not-allowed opacity-45" : "hover:bg-white/60 dark:hover:bg-white/5"
              }`}
            >
              {active ? (
                <motion.span
                  layoutId="mode-pill"
                  className="absolute inset-0 rounded-xl bg-white shadow-glass-sm ring-1 ring-mist-200/80 dark:bg-ink-800 dark:ring-white/10"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span
                className={`relative z-10 text-xs font-semibold ${
                  active
                    ? "text-ink-900 dark:text-mist-50"
                    : "text-mist-600 dark:text-mist-400"
                }`}
              >
                {m.label}
              </span>
              <span
                className={`relative z-10 mt-0.5 hidden text-[10px] font-medium sm:block ${
                  active ? "text-mist-600 dark:text-mist-300" : "text-mist-400 dark:text-mist-600"
                }`}
              >
                {m.hint}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
