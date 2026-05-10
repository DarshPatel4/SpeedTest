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
      <main className="relative z-10 w-full pb-12 pt-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          {!focusMode ? (
            <aside className="hidden xl:block">
              <div className="sticky top-24 space-y-4">
                <DailyChallenge
                  challengeText={dailyChallenge.text}
                  dateKey={dailyChallenge.dateKey}
                  bestWpm={todayBest}
                  onUseChallenge={onDailyChallenge}
                  disabled={controlsLocked}
                />
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-mist-400">
                    Typing settings
                  </p>
                  <div className="mt-3 space-y-4">
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
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-mist-400">
                    Session toggles
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                      className="rounded-xl border border-white/10 bg-ink-925/70 px-3 py-2 text-left text-xs font-semibold text-mist-100 transition hover:bg-ink-900"
                    >
                      Theme: {theme === "dark" ? "Dark" : "Light"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSound((s) => !s)}
                      className="rounded-xl border border-white/10 bg-ink-925/70 px-3 py-2 text-left text-xs font-semibold text-mist-100 transition hover:bg-ink-900"
                    >
                      Sound: {sound ? "On" : "Off"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFocusMode((v) => !v)}
                      className="rounded-xl border border-white/10 bg-ink-925/70 px-3 py-2 text-left text-xs font-semibold text-mist-100 transition hover:bg-ink-900"
                    >
                      {focusMode ? "Exit focus mode" : "Enter focus mode"}
                    </button>
                  </div>
                </div>
                <XPProgress
                  level={level}
                  totalXP={totalXP}
                  progressPct={progressInLevel}
                  xpForNextLevel={xpForNextLevel}
                />
                <div className="rounded-2xl border border-orange-500/20 bg-orange-950/20 px-4 py-3 text-xs font-semibold text-orange-100">
                  🔥 {streak} day streak
                </div>
              </div>
            </aside>
          ) : null}

          <section className="min-w-0 space-y-5">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Calm, precise typing.</h1>
              <p className="max-w-2xl text-sm text-mist-400">
                Keep your eyes ahead, keep rhythm steady, and let the stats guide your next run.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
              <Timer
                seconds={test.phase === "finished" ? 0 : test.timeLeft}
                phase={test.phase}
                totalSec={durationSec}
              />
              <p className="text-right text-xs text-mist-400">WPM = (correct ÷ 5) ÷ minutes elapsed</p>
            </div>

            <motion.div
              key={mode}
              layout
              className="w-full"
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
                    className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-ink-950/50 px-4 py-3 text-sm text-mist-100 outline-none transition placeholder:text-mist-500 focus:border-accent/50"
                  />
                </div>
                <button
                  type="button"
                  disabled={test.phase === "running"}
                  onClick={() => test.restart()}
                  className="shrink-0 rounded-2xl border border-white/10 bg-ink-925/70 px-5 py-3 text-sm font-semibold text-mist-100 transition hover:bg-ink-900 disabled:opacity-50"
                >
                  New passage
                </button>
              </div>
            </section>
          </section>

          {!focusMode ? (
            <aside className="hidden xl:block">
              <div className="sticky top-24 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <StatTile label="WPM" value={test.wpm} />
                  <StatTile label="Accuracy" value={`${test.accuracy}%`} />
                  <StatTile label="CPM" value={test.cpm} />
                  <StatTile label="Errors" value={test.errors} />
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-mist-400">
                    Live pace
                  </p>
                  <LiveWpmGraph points={test.wpmSeries} />
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <p className="text-sm text-mist-300">{smartHint}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
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
                      className="mt-3 w-full rounded-xl border border-white/10 bg-ink-925/70 px-3 py-2 text-xs font-semibold text-mist-100 transition hover:bg-ink-900"
                    >
                      Practice weak keys
                    </button>
                  ) : null}
                </div>
              </div>
            </aside>
          ) : null}
        </div>
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
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center backdrop-blur-md">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mist-400">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-mist-100">{value}</p>
    </div>
  );
}
