import { motion } from "framer-motion";
import { useMemo } from "react";

export function LiveTelemetryCockpit({
  wpm = 0,
  accuracy = 100,
  cpm = 0,
  errors = 0,
  timeLeft = 30,
  totalSec = 30,
  phase = "idle",
  typedCount = 0,
  correctChars = 0,
}) {
  const isRunning = phase === "running";
  const progressRatio = Math.max(0, Math.min(1, 1 - timeLeft / totalSec));
  const progressPercent = Math.round(progressRatio * 100);

  // Speedometer needle angle: 0 WPM -> -90 deg, 160 WPM -> +90 deg
  const needleAngle = useMemo(() => {
    const clamped = Math.max(0, Math.min(160, wpm));
    return -90 + (clamped / 160) * 180;
  }, [wpm]);

  // Glow color tier based on WPM
  const speedTier = useMemo(() => {
    if (wpm >= 110) return { label: "GODSPEED", color: "from-fuchsia-500 to-rose-500", glow: "rgba(236,72,153,0.6)", text: "text-fuchsia-300" };
    if (wpm >= 85) return { label: "HYPER FLOW", color: "from-sky-400 to-cyan-300", glow: "rgba(56,189,248,0.5)", text: "text-sky-300" };
    if (wpm >= 60) return { label: "CRUISING", color: "from-emerald-400 to-teal-300", glow: "rgba(52,211,153,0.45)", text: "text-emerald-300" };
    if (wpm >= 35) return { label: "WARMING UP", color: "from-amber-400 to-yellow-300", glow: "rgba(251,191,36,0.35)", text: "text-amber-300" };
    return { label: "IDLE / CALM", color: "from-slate-400 to-slate-300", glow: "rgba(148,163,184,0.2)", text: "text-mist-400" };
  }, [wpm]);

  // Accuracy color
  const accColor = useMemo(() => {
    if (accuracy >= 97) return "text-emerald-400";
    if (accuracy >= 92) return "text-cyan-400";
    if (accuracy >= 85) return "text-amber-400";
    return "text-rose-400";
  }, [accuracy]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-ink-900/90 via-ink-950/95 to-ink-950 p-5 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
      {/* Background ambient glow matching current speed tier */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-44 w-96 -translate-x-1/2 rounded-full opacity-35 blur-3xl transition-all duration-700"
        style={{ background: speedTier.glow }}
      />

      <div className="relative z-10 grid grid-cols-1 items-center gap-5 lg:grid-cols-12">
        {/* Speedometer Gauge Widget (4 Cols) */}
        <div className="flex flex-col items-center justify-center lg:col-span-4">
          <div className="relative flex h-32 w-48 items-end justify-center overflow-hidden">
            {/* Speedometer Arc SVG */}
            <svg viewBox="0 0 200 110" className="h-full w-full">
              <defs>
                <linearGradient id="meterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="45%" stopColor="#34d399" />
                  <stop offset="75%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>
              </defs>
              {/* Background Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Active Colored Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#meterGrad)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * Math.min(wpm, 160)) / 160}
                className="transition-all duration-200"
              />
              {/* Needle Pivot */}
              <circle cx="100" cy="100" r="7" fill="#e2e8f0" />
            </svg>

            {/* Needle Pivot & Arm */}
            <motion.div
              className="absolute bottom-0 h-20 w-1 origin-bottom rounded-full bg-gradient-to-t from-mist-100 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.9)]"
              animate={{ rotate: needleAngle }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              style={{ bottom: "0px", left: "calc(50% - 2px)" }}
            />
          </div>

          {/* Large Live Digital Speed Display */}
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={`font-mono text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl ${
                isRunning ? "text-white" : "text-mist-300"
              }`}
            >
              {wpm}
            </span>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-mist-400">
              WPM
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${speedTier.text}`}>
              {speedTier.label}
            </span>
          </div>
        </div>

        {/* Live Metrics Grid (5 Cols) */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-5">
          {/* Accuracy */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-center transition hover:border-white/10">
            <span className="font-mono text-[10px] uppercase tracking-wider text-mist-400">
              Accuracy
            </span>
            <span className={`mt-1 font-mono text-2xl font-bold tabular-nums ${accColor}`}>
              {accuracy}%
            </span>
            <span className="mt-0.5 text-[9px] text-mist-500">
              {errors === 0 ? "Flawless" : `${errors} typos`}
            </span>
          </div>

          {/* Live CPM */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-center transition hover:border-white/10">
            <span className="font-mono text-[10px] uppercase tracking-wider text-mist-400">
              CPM
            </span>
            <span className="mt-1 font-mono text-2xl font-bold tabular-nums text-mist-100">
              {cpm}
            </span>
            <span className="mt-0.5 text-[9px] text-mist-500">chars/min</span>
          </div>

          {/* Correct Characters */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-center transition hover:border-white/10">
            <span className="font-mono text-[10px] uppercase tracking-wider text-mist-400">
              Correct
            </span>
            <span className="mt-1 font-mono text-2xl font-bold tabular-nums text-emerald-400">
              {correctChars}
            </span>
            <span className="mt-0.5 text-[9px] text-mist-500">matches</span>
          </div>

          {/* Typos / Errors */}
          <motion.div
            animate={errors > 0 ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 0.2 }}
            className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition ${
              errors > 0
                ? "border-rose-500/30 bg-rose-500/10 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                : "border-white/5 bg-white/[0.03]"
            }`}
          >
            <span className="font-mono text-[10px] uppercase tracking-wider text-mist-400">
              Errors
            </span>
            <span
              className={`mt-1 font-mono text-2xl font-bold tabular-nums ${
                errors > 0 ? "text-rose-400" : "text-mist-300"
              }`}
            >
              {errors}
            </span>
            <span className="mt-0.5 text-[9px] text-mist-500">misses</span>
          </motion.div>
        </div>

        {/* Time Progress Ring & Controls (3 Cols) */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] p-4 lg:col-span-3">
          <div className="relative flex h-24 w-24 items-center justify-center">
            {/* Countdown SVG Circle */}
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="7"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={timeLeft <= 5 ? "#f43f5e" : "#38bdf8"}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 * progressRatio}
                className="transition-all duration-500"
              />
            </svg>

            {/* Time Remaining Digital */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`font-mono text-2xl font-bold tabular-nums ${
                  timeLeft <= 5 ? "text-rose-400 animate-pulse" : "text-white"
                }`}
              >
                {timeLeft}s
              </span>
              <span className="text-[9px] uppercase tracking-wider text-mist-500">
                {isRunning ? "active" : "timer"}
              </span>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-center font-mono text-[11px] text-mist-400">
            <span>Progress:</span>
            <span className="font-semibold text-accent">{progressPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

