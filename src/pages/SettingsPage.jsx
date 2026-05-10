import { useState } from "react";

export function SettingsPage() {
  const [compact, setCompact] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glass">
        <Toggle
          label="Compact cards"
          value={compact}
          onChange={setCompact}
          description="Tighter spacing for smaller screens."
        />
        <Toggle
          label="Reduced motion"
          value={reducedMotion}
          onChange={setReducedMotion}
          description="Minimizes animation intensity."
        />
      </div>
    </section>
  );
}

function Toggle({ label, value, onChange, description }) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-ink-925/70 p-4">
      <span>
        <span className="block font-medium">{label}</span>
        <span className="text-sm text-mist-400">{description}</span>
      </span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`h-7 w-14 rounded-full p-1 transition ${value ? "bg-accent" : "bg-white/20"}`}
      >
        <span
          className={`block h-5 w-5 rounded-full bg-white transition ${value ? "translate-x-7" : "translate-x-0"}`}
        />
      </button>
    </label>
  );
}
