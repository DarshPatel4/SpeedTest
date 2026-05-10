import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CodeTypingBox } from "./components/CodeTypingBox.jsx";
import { DailyChallenge } from "./components/DailyChallenge.jsx";
import { DifficultySelector } from "./components/DifficultySelector.jsx";
import { LiveWpmGraph } from "./components/LiveWpmGraph.jsx";
import { ModeSelector } from "./components/ModeSelector.jsx";
import { ResultModal } from "./components/ResultModal.jsx";
import { Timer } from "./components/Timer.jsx";
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

  const durationButtons = useMemo(
    () =>
      DURATIONS.map((d) => (
        <button
          key={d}
          type="button"
          disabled={test.phase === "running" || test.phase === "finished"}
          onClick={() => setDurationSec(d)}
          className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
            durationSec === d
              ? "bg-ink-900 text-white shadow-glass-sm dark:bg-accent dark:text-ink-950"
              : "border border-mist-200/90 bg-white/70 text-ink-700 hover:bg-mist-100 dark:border-white/10 dark:bg-ink-925/60 dark:text-mist-200 dark:hover:bg-ink-900"
          } ${test.phase === "running" || test.phase === "finished" ? "opacity-50" : ""}`}
        >
          {d}s
        </button>
      )),
    [durationSec, test.phase]
  );

  const controlsLocked =
    test.phase === "running" || test.phase === "finished";

  const onDailyChallenge = useCallback(() => {
    setMode("normal");
    setCustomText(dailyChallenge.text);
    setTimeout(() => test.restart(), 0);
  }, [dailyChallenge.text, test]);

  const smartHint = useMemo(() => {
    if (test.phase !== "running" && test.phase !== "finished") {
      return "Start typing to see live coaching hints.";
    }
    if (test.accuracy < 92) return "Accuracy is dropping - slow down slightly and prioritize precision.";
    if (test.wpm < 45) return "Warm-up pace detected - increase rhythm with shorter bursts.";
    if (test.wpm > 90 && test.accuracy >= 96) return "Excellent flow state - maintain cadence and breathing.";
    return "Good balance. Keep your eyes ahead and avoid correcting too early.";
  }, [test.phase, test.accuracy, test.wpm]);
  const weakLine = useMemo(() => weakKeysSentence(test.sessionMistakes), [test.sessionMistakes]);
  const topWeak = useMemo(() => topWeakKeys(6), [topWeakKeys]);

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      className="relative min-h-screen overflow-x-hidden text-ink-900 outline-none dark:text-mist-100"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-black"
        animate={{ opacity: focusMode ? 0.22 : 0 }}
        transition={{ duration: 0.25 }}
      />
      <main className="relative z-10 w-full pb-12 pt-6">
        <motion.div
          className="grid grid-cols-1 gap-7"
          animate={{
            gridTemplateColumns:
              focusMode ? "0px minmax(0,1fr) 0px" : "260px minmax(0,1fr) 300px",
          }}
          transition={{ type: "spring", stiffness: 220, damping: 30 }}
        >
          <motion.aside
            className="hidden xl:block overflow-hidden"
            animate={{ opacity: focusMode ? 0 : 1 }}
            transition={{ duration: 0.22 }}
            aria-hidden={focusMode}
          >
            <div className="sticky top-24 space-y-3">
                <DailyChallenge
                  challengeText={dailyChallenge.text}
                  dateKey={dailyChallenge.dateKey}
                  bestWpm={todayBest}
                  onUseChallenge={onDailyChallenge}
                  disabled={controlsLocked}
                />
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-mist-400">
                    Typing settings
                  </p>
                  <div className="mt-2.5 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">{durationButtons}</div>
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
                </div>
                <XPProgress
                  level={level}
                  totalXP={totalXP}
                  progressPct={progressInLevel}
                  xpForNextLevel={xpForNextLevel}
                />
                <div className="rounded-xl border border-orange-500/20 bg-orange-950/20 px-3 py-2 text-xs font-semibold text-orange-100">
                  🔥 {streak} day streak
                </div>
            </div>
          </motion.aside>

          <section className="min-w-0 space-y-4">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Calm, precise typing.</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-mist-400">
                Keep your eyes ahead, keep rhythm steady, and let the stats guide your next run.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5">
              <Timer
                seconds={test.phase === "finished" ? 0 : test.timeLeft}
                phase={test.phase}
                totalSec={durationSec}
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                  className="rounded-lg border border-white/10 bg-ink-925/60 px-3 py-1.5 text-[11px] font-semibold text-mist-100 transition hover:bg-ink-900"
                >
                  {theme === "dark" ? "Light" : "Dark"}
                </button>
                <button
                  type="button"
                  onClick={() => setSound((s) => !s)}
                  className="rounded-lg border border-white/10 bg-ink-925/60 px-3 py-1.5 text-[11px] font-semibold text-mist-100 transition hover:bg-ink-900"
                >
                  Sound {sound ? "on" : "off"}
                </button>
                <button
                  type="button"
                  onClick={() => setFocusMode((v) => !v)}
                  className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition ${
                    focusMode
                      ? "border-accent/40 bg-accent/15 text-mist-50"
                      : "border-white/10 bg-ink-925/60 text-mist-100 hover:bg-ink-900"
                  }`}
                >
                  {focusMode ? "Exit focus" : "Focus mode"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="flex flex-wrap items-center gap-2">{durationButtons}</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:justify-items-end">
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
            </div>

            <motion.div
              key={mode}
              layout
              className={`w-full transition-all duration-300 ${focusMode ? "xl:mx-auto xl:max-w-[1100px]" : ""}`}
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 1 }}
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

            <section className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex-1">
                  <label
                    htmlFor="custom"
                    className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mist-400"
                  >
                    Custom passage
                  </label>
                  <textarea
                    id="custom"
                    rows={2}
                    disabled={test.phase === "running"}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Optional: paste your own text, then click New passage."
                    className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-ink-950/45 px-4 py-2.5 text-sm text-mist-100 outline-none transition placeholder:text-mist-500 focus:border-accent/50"
                  />
                </div>
                <button
                  type="button"
                  disabled={test.phase === "running"}
                  onClick={() => test.restart()}
                  className="shrink-0 rounded-xl border border-white/10 bg-ink-925/60 px-5 py-2.5 text-sm font-semibold text-mist-100 transition hover:bg-ink-900 disabled:opacity-50"
                >
                  New passage
                </button>
              </div>
            </section>
          </section>

          <motion.aside
            className="hidden xl:block overflow-hidden"
            animate={{ opacity: focusMode ? 0 : 1 }}
            transition={{ duration: 0.22 }}
            aria-hidden={focusMode}
          >
            <div className="sticky top-24 space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <StatTile label="WPM" value={test.wpm} />
                  <StatTile label="Accuracy" value={`${test.accuracy}%`} />
                  <StatTile label="CPM" value={test.cpm} />
                  <StatTile label="Errors" value={test.errors} />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-mist-400">
                    Live pace
                  </p>
                  <LiveWpmGraph points={test.wpmSeries} />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-sm leading-relaxed text-mist-300">{smartHint}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-mist-400">
                    Weak keys
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
                      className="mt-3 w-full rounded-lg border border-white/10 bg-ink-925/60 px-3 py-2 text-xs font-semibold text-mist-100 transition hover:bg-ink-900"
                    >
                      Practice weak keys
                    </button>
                  ) : null}
                </div>
            </div>
          </motion.aside>
        </motion.div>
      </main>

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

function StatTile({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2.5 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist-400">{label}</p>
      <p className="mt-1 font-mono text-base font-semibold tabular-nums text-mist-100">{value}</p>
    </div>
  );
}
