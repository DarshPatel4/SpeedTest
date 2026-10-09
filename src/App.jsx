import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CodeTypingBox } from "./components/CodeTypingBox.jsx";
import { DailyChallenge } from "./components/DailyChallenge.jsx";
import { DifficultySelector } from "./components/DifficultySelector.jsx";
import { LanguageSelector } from "./components/LanguageSelector.jsx";
import { LiveTelemetryCockpit } from "./components/LiveTelemetryCockpit.jsx";
import { LiveWpmGraph } from "./components/LiveWpmGraph.jsx";
import { ModeSelector } from "./components/ModeSelector.jsx";
import { ResultModal } from "./components/ResultModal.jsx";
import { TypingBox } from "./components/TypingBox.jsx";
import { WeakKeyStats, weakKeysSentence } from "./components/WeakKeyStats.jsx";
import { XPProgress } from "./components/XPProgress.jsx";
import { saveScore } from "./api/scores.js";
import { useAnalytics } from "./hooks/useAnalytics.js";
import { useSound } from "./hooks/useSound.js";
import { useStreak } from "./hooks/useStreak.js";
import { buildWeakKeyPractice, useTypingStats } from "./hooks/useTypingStats.js";
import { useTypingTest } from "./hooks/useTypingTest.js";
import { useXPLevel } from "./hooks/useXPLevel.js";

const DURATIONS = [15, 30, 60, 120];

export default function App() {
  const [durationSec, setDurationSec] = useState(30);
  const [difficulty, setDifficulty] = useState("medium");
  const [mode, setMode] = useState("normal");
  const [codeLangPreference, setCodeLangPreference] = useState("powerscript");
  const [customText, setCustomText] = useState("");
  const [theme, setTheme] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );
  const { enabled: sound, setEnabled: setSound, playKey } = useSound();
  const [focusMode, setFocusMode] = useState(false);
  const rootRef = useRef(null);
  const savedFinishRef = useRef(false);

  const { appendTest } = useAnalytics();
  const {
    mergeSessionMistakes,
    summary: lifetimeWeakSummary,
    topWeakKeys,
  } = useTypingStats();
  const {
    streak,
    recordTestCompleted,
    dailyChallenge,
    todayBest,
    recordDailyBest,
  } = useStreak();
  const { totalXP, level, progressInLevel, addXP, xpForNextLevel } = useXPLevel();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const test = useTypingTest({
    durationSec,
    difficulty,
    customText,
    soundEnabled: sound,
    playKey,
    mode,
    codeLangPreference,
  });

  useEffect(() => {
    if (test.phase === "idle" || test.phase === "running") {
      savedFinishRef.current = false;
    }
  }, [test.phase]);

  useEffect(() => {
    if (test.phase !== "finished" || savedFinishRef.current) return;
    savedFinishRef.current = true;
    saveScore({ wpm: test.wpm, accuracy: test.accuracy, difficulty, mode }).catch(() => undefined);
    appendTest({
      wpm: test.wpm,
      accuracy: test.accuracy,
      durationSec,
      difficulty,
      mode,
    });
    if (test.sessionMistakes) {
      mergeSessionMistakes(test.sessionMistakes);
    }
    recordTestCompleted();
    addXP(Math.round(test.wpm + test.accuracy));
    const daily = dailyChallenge.text.trim();
    if (customText.trim() === daily) {
      recordDailyBest(test.wpm);
    }
  }, [
    test.phase,
    test.wpm,
    test.accuracy,
    test.sessionMistakes,
    durationSec,
    difficulty,
    mode,
    appendTest,
    mergeSessionMistakes,
    recordTestCompleted,
    addXP,
    dailyChallenge.text,
    customText,
    recordDailyBest,
  ]);

  const modalOpen = test.phase === "finished";

  const onRetry = useCallback(() => {
    test.restart();
  }, [test]);

  const onCloseModal = useCallback(() => {
    test.restart();
  }, [test]);

  const onPracticeWeak = useCallback(() => {
    const keys = topWeakKeys(10).map(([k]) => k);
    if (keys.length === 0) return;
    setMode("normal");
    setCustomText(buildWeakKeyPractice(keys));
    setTimeout(() => test.restart(), 0);
  }, [topWeakKeys, test]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      rootRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const controlsLocked = test.phase === "running" || test.phase === "finished";

  const onDailyChallenge = useCallback(() => {
    setMode("normal");
    setCustomText(dailyChallenge.text);
    setTimeout(() => test.restart(), 0);
  }, [dailyChallenge.text, test]);

  const smartHint = useMemo(() => {
    if (test.phase !== "running" && test.phase !== "finished") {
      return "Touch any key to initiate live telemetry.";
    }
    if (test.accuracy < 90) return "⚠️ Accuracy warning — ease off burst speed and lock in rhythm.";
    if (test.wpm < 45) return "🔥 Warm-up pace detected — shorten finger strokes to accelerate.";
    if (test.wpm >= 95 && test.accuracy >= 97) return "⚡ GODSPEED FLOW STATE — absolute cadence, breathing steady!";
    if (test.wpm >= 75) return "🚀 High velocity rhythm — keep eyes 2-3 words ahead!";
    return "✨ Good equilibrium. Maintain relaxation and cadence.";
  }, [test.phase, test.accuracy, test.wpm]);

  const weakLine = useMemo(() => weakKeysSentence(test.sessionMistakes), [test.sessionMistakes]);
  const topWeak = useMemo(() => topWeakKeys(6), [topWeakKeys]);

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      className="relative min-h-screen overflow-x-hidden text-ink-900 outline-none dark:text-mist-100"
    >
      {/* Background Focus Overlay */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-black/80"
        animate={{ opacity: focusMode ? 0.75 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <main className="relative z-10 w-full pb-16 pt-3">
        <motion.div
          className="grid grid-cols-1 gap-7"
          animate={{
            gridTemplateColumns:
              focusMode ? "0px minmax(0,1fr) 0px" : "280px minmax(0,1fr) 310px",
          }}
          transition={{ type: "spring", stiffness: 220, damping: 28 }}
        >
          {/* LEFT SIDEBAR */}
          <motion.aside
            className="hidden xl:block overflow-hidden"
            animate={{ opacity: focusMode ? 0 : 1 }}
            transition={{ duration: 0.22 }}
            aria-hidden={focusMode}
          >
            <div className="sticky top-20 space-y-4">
              <DailyChallenge
                challengeText={dailyChallenge.text}
                dateKey={dailyChallenge.dateKey}
                bestWpm={todayBest}
                onUseChallenge={onDailyChallenge}
                disabled={controlsLocked}
              />

              <XPProgress
                level={level}
                totalXP={totalXP}
                progressPct={progressInLevel}
                xpForNextLevel={xpForNextLevel}
              />

              <div className="flex items-center justify-between rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-ink-950 p-3.5 text-xs font-bold text-orange-200 shadow-glass-sm">
                <span className="flex items-center gap-2">
                  <span className="text-base">🔥</span> Active Streak
                </span>
                <span className="font-mono text-sm text-orange-300">
                  {streak} {streak === 1 ? "day" : "days"}
                </span>
              </div>
            </div>
          </motion.aside>

          {/* MAIN TYPING COCKPIT SECTION */}
          <section className="min-w-0 space-y-5">
            {/* Top Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 shadow-glass-sm backdrop-blur-xl">
              {/* Duration Switcher */}
              <div className="flex items-center gap-1 rounded-xl bg-ink-950/80 p-1 border border-white/5">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    disabled={controlsLocked}
                    onClick={() => setDurationSec(d)}
                    className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all ${
                      durationSec === d
                        ? "bg-accent text-ink-950 shadow-[0_0_12px_rgba(56,189,248,0.5)] scale-105"
                        : "text-mist-400 hover:text-mist-100 hover:bg-white/5"
                    } ${controlsLocked ? "opacity-40" : ""}`}
                  >
                    {d}s
                  </button>
                ))}
              </div>

              {/* Mode & Difficulty */}
              <div className="flex flex-wrap items-center gap-2.5">
                <ModeSelector
                  value={mode}
                  onChange={setMode}
                  disabled={controlsLocked || !!customText.trim()}
                />
                <DifficultySelector
                  value={difficulty}
                  onChange={setDifficulty}
                  disabled={controlsLocked || !!customText.trim()}
                />
              </div>

              {/* Toggles (Sound & Focus) */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSound((s) => !s)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-xs font-semibold transition ${
                    sound
                      ? "border-accent/40 bg-accent/15 text-accent shadow-[0_0_10px_rgba(56,189,248,0.25)]"
                      : "border-white/10 bg-white/5 text-mist-400 hover:bg-white/10 hover:text-mist-200"
                  }`}
                >
                  <span>{sound ? "🔊 Sound ON" : "🔇 Sound OFF"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFocusMode((v) => !v)}
                  className={`rounded-xl border px-3 py-1.5 font-mono text-xs font-semibold transition ${
                    focusMode
                      ? "border-fuchsia-500/50 bg-fuchsia-500/20 text-fuchsia-200 shadow-[0_0_12px_rgba(236,72,153,0.3)]"
                      : "border-white/10 bg-white/5 text-mist-300 hover:bg-white/10"
                  }`}
                >
                  {focusMode ? "✕ Exit Zen" : "⚡ Zen Mode"}
                </button>
              </div>
            </div>

            {/* LIVE TELEMETRY COCKPIT (HUD) */}
            <LiveTelemetryCockpit
              wpm={test.wpm}
              accuracy={test.accuracy}
              cpm={test.cpm}
              errors={test.errors}
              timeLeft={test.phase === "finished" ? 0 : test.timeLeft}
              totalSec={durationSec}
              phase={test.phase}
              typedCount={test.typed.length}
              correctChars={test.correctChars}
            />

            {/* Language Selection Filter for Code Mode */}
            {mode === "code" && (
              <LanguageSelector
                value={codeLangPreference}
                onChange={setCodeLangPreference}
                disabled={controlsLocked}
              />
            )}

            {/* ACTIVE TYPING AREA */}
            <motion.div
              key={`${mode}-${codeLangPreference}`}
              layout
              className={`w-full transition-all duration-300 ${focusMode ? "xl:mx-auto xl:max-w-[1150px]" : ""}`}
              initial={{ opacity: 0.9, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {mode === "code" ? (
                <CodeTypingBox
                  sourceText={test.sourceText}
                  typed={test.typed}
                  phase={test.phase}
                  language={test.codeLanguage}
                />
              ) : (
                <TypingBox sourceText={test.sourceText} typed={test.typed} phase={test.phase} />
              )}
            </motion.div>

            {/* Custom Passage Box */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-white/[0.03] to-white/[0.01] p-4 backdrop-blur-xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="custom"
                      className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-mist-400"
                    >
                      Custom Practice Passage
                    </label>
                    {customText && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomText("");
                          setTimeout(() => test.restart(), 0);
                        }}
                        className="text-xs text-rose-400 hover:underline"
                      >
                        Clear Custom Text
                      </button>
                    )}
                  </div>
                  <textarea
                    id="custom"
                    rows={2}
                    disabled={test.phase === "running"}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Optional: Paste your own text or PowerScript snippet, then click Apply."
                    className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-ink-950/70 px-4 py-2.5 font-mono text-sm text-mist-100 outline-none transition placeholder:text-mist-600 focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
                  />
                </div>
                <button
                  type="button"
                  disabled={test.phase === "running"}
                  onClick={() => test.restart()}
                  className="shrink-0 rounded-2xl bg-gradient-to-r from-accent to-sky-400 px-5 py-3 font-semibold text-ink-950 shadow-glass-sm transition hover:brightness-110 disabled:opacity-50"
                >
                  New Passage
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT SIDEBAR */}
          <motion.aside
            className="hidden xl:block overflow-hidden"
            animate={{ opacity: focusMode ? 0 : 1 }}
            transition={{ duration: 0.22 }}
            aria-hidden={focusMode}
          >
            <div className="sticky top-20 space-y-4">
              {/* Live Pace Sparkline */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-glass-sm backdrop-blur-xl">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
                    Live Pace Telemetry
                  </p>
                  <span className="font-mono text-xs font-bold text-mist-300">
                    {test.wpm} WPM
                  </span>
                </div>
                <LiveWpmGraph points={test.wpmSeries} />
              </div>

              {/* Live Coaching Hint */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-4 shadow-glass-sm backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-mist-200">
                  <span className="text-base">🤖</span> AI Live Coaching
                </div>
                <p className="mt-2 text-xs leading-relaxed text-mist-300">{smartHint}</p>
              </div>

              {/* Weak Keys Diagnostic */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-glass-sm backdrop-blur-xl">
                <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300">
                  Weak Key Radar
                </p>
                <WeakKeyStats
                  sessionMistakes={test.sessionMistakes || {}}
                  summaryLine={weakLine}
                  lifetimeLine={lifetimeWeakSummary}
                />
                {topWeak.length > 0 ? (
                  <button
                    type="button"
                    onClick={onPracticeWeak}
                    className="mt-3 w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 font-mono text-xs font-bold text-amber-200 transition hover:bg-amber-500/20"
                  >
                    Drill Weak Keys Now
                  </button>
                ) : null}
              </div>
            </div>
          </motion.aside>
        </motion.div>
      </main>

      {/* SESSION COMPLETE RESULT MODAL */}
      <ResultModal
        open={modalOpen}
        onClose={onCloseModal}
        onRetry={onRetry}
        wpm={test.wpm}
        cpm={test.cpm}
        accuracy={test.accuracy}
        errors={test.errors}
        durationSec={durationSec}
        wpmSeries={test.wpmSeries}
        sessionMistakes={test.sessionMistakes}
        lifetimeWeakSummary={lifetimeWeakSummary}
        onPracticeWeak={topWeakKeys(1).length > 0 ? onPracticeWeak : undefined}
      />
    </div>
  );
}
