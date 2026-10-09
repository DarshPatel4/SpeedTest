import { AVAILABLE_CODE_LANGUAGES } from "../data/codeSnippets.js";

export function LanguageSelector({ value, onChange, disabled }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/10 bg-ink-950/80 p-1.5 shadow-glass-sm backdrop-blur-xl">
      <span className="px-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-accent">
        Code Language:
      </span>
      {AVAILABLE_CODE_LANGUAGES.map((lang) => {
        const isSelected = value === lang.id;
        const isPowerScript = lang.id === "powerscript";

        return (
          <button
            key={lang.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(lang.id)}
            className={`relative rounded-xl px-3 py-1.5 font-mono text-xs font-semibold transition-all duration-200 ${
              isSelected
                ? isPowerScript
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-ink-950 shadow-[0_0_16px_rgba(245,158,11,0.5)] scale-105"
                  : "bg-accent text-ink-950 shadow-[0_0_14px_rgba(56,189,248,0.45)] scale-105"
                : isPowerScript
                  ? "border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200"
                  : "border border-white/5 bg-white/[0.03] text-mist-300 hover:bg-white/[0.08] hover:text-mist-100"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isPowerScript ? "⚡ " : ""}
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}

