import { useState } from "react";

export function SettingsPage() {
  const [compact, setCompact] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [soundVolume, setSoundVolume] = useState(80);

  return (
    <div className="min-h-screen px-4 py-8 text-slate-100 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Preferences
            </span>
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Settings & Controls
          </h1>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/[0.08] bg-[#121620]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <Toggle
            label="Compact Display"
            value={compact}
            onChange={setCompact}
            description="Tighter visual density and padding for high resolution displays."
          />
          <Toggle
            label="Reduced Motion"
            value={reducedMotion}
            onChange={setReducedMotion}
            description="Minimizes transition and gauge animation intensity for optimal battery life."
          />

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex items-center justify-between">
            <div>
              <span className="font-mono text-sm font-semibold text-white block">Keyboard Click Volume</span>
              <span className="font-mono text-xs text-slate-400">Audio intensity of mechanical key clicks</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={soundVolume}
                onChange={(e) => setSoundVolume(Number(e.target.value))}
                className="w-32 accent-accent cursor-pointer"
              />
              <span className="font-mono text-xs text-accent font-bold w-8 text-right">{soundVolume}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange, description }) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 cursor-pointer hover:bg-white/[0.04] transition">
      <div>
        <span className="block font-mono text-sm font-semibold text-white">{label}</span>
        <span className="font-mono text-xs text-slate-400">{description}</span>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`h-7 w-14 rounded-full p-1 transition-colors duration-200 ${
          value ? "bg-accent shadow-[0_0_10px_rgba(56,189,248,0.5)]" : "bg-white/10"
        }`}
      >
        <span
          className={`block h-5 w-5 rounded-full bg-white transition-transform duration-200 ${
            value ? "translate-x-7" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}
