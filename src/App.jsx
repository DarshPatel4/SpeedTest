import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Layers,
  Code2,
  Binary,
  Flame,
  FileEdit,
  Database,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Shuffle,
  CheckCircle2,
} from "lucide-react";
import { CodeTypingBox } from "./components/CodeTypingBox.jsx";
import { TypingBox } from "./components/TypingBox.jsx";
import { ResultModal } from "./components/ResultModal.jsx";
import { WeakKeyStats, weakKeysSentence } from "./components/WeakKeyStats.jsx";
import { LiveWpmGraph } from "./components/LiveWpmGraph.jsx";
import { saveScore } from "./api/scores.js";
import { fetchPassagesFromSupabase, fetchDailyChallengeFromSupabase } from "./api/passages.js";
import { useAnalytics } from "./hooks/useAnalytics.js";
import { useSound } from "./hooks/useSound.js";
import { useStreak } from "./hooks/useStreak.js";
import { buildWeakKeyPractice, useTypingStats } from "./hooks/useTypingStats.js";
import { useTypingTest } from "./hooks/useTypingTest.js";
import { useXPLevel } from "./hooks/useXPLevel.js";

const DURATIONS = [15, 30, 60, 120];

const PRACTICE_MODES = [
  { id: "prose", label: "Words & Prose", icon: FileText },
  { id: "powerscript", label: "PowerScript (PowerBuilder)", icon: Layers },
  { id: "javascript", label: "JavaScript", icon: Code2 },
  { id: "python", label: "Python", icon: Binary },
  { id: "daily", label: "Daily Challenge", icon: Flame },
  { id: "custom", label: "Custom Passage", icon: FileEdit },
];

export default function App() {
  const [durationSec, setDurationSec] = useState(30);
  const [difficulty, setDifficulty] = useState("medium");
  const [practiceMode, setPracticeMode] = useState("powerscript");
  const [customText, setCustomText] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [supabaseLoadedSource, setSupabaseLoadedSource] = useState("");

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
  const { streak, recordTestCompleted, recordDailyBest } = useStreak();
  const { totalXP, level, progressInLevel, addXP, xpForNextLevel } = useXPLevel();

  // Mode & language mapping for underlying typing test engine
  const internalMode = practiceMode === "prose" ? "normal" : "code";
  const internalCodeLang =
    practiceMode === "powerscript"
      ? "powerscript"
      : practiceMode === "javascript"
      ? "javascript"
      : practiceMode === "python"
      ? "python"
      : "powerscript";

  const test = useTypingTest({
    durationSec,
    difficulty,
    customText,
    codeLanguageProp: internalCodeLang,
    soundEnabled: sound,
    playKey,
    mode: internalMode,
    codeLangPreference: internalCodeLang,
  });

  // Load passage directly from Supabase when practice mode or difficulty changes
  const loadPassageFromSupabase = useCallback(
    async (modeChoice = practiceMode, diffChoice = difficulty) => {
      if (modeChoice === "custom") {
        setShowCustomInput(true);
        return;
      }
      setShowCustomInput(false);
      setSupabaseLoading(true);

      try {
        if (modeChoice === "daily") {
          const daily = await fetchDailyChallengeFromSupabase();
          if (daily?.text) {
            setCustomText(daily.text);
            setSupabaseLoadedSource(`Daily: ${daily.title || daily.dateKey}`);
            test.loadSnippet(daily.text, "powerscript");
          }
        } else if (modeChoice === "prose") {
          const list = await fetchPassagesFromSupabase({
            category: "prose",
            language: "english",
            difficulty: diffChoice,
          });
          if (list && list.length > 0) {
            const chosen = list[Math.floor(Math.random() * list.length)];
            setCustomText(chosen.text);
            setSupabaseLoadedSource(chosen.fromSupabase ? `Supabase: ${chosen.title}` : chosen.title);
            test.loadSnippet(chosen.text, null);
          }
        } else {
          // Code modes: powerscript, javascript, python
          const list = await fetchPassagesFromSupabase({
            category: "code",
            language: modeChoice,
            difficulty: diffChoice,
          });
          if (list && list.length > 0) {
            const chosen = list[Math.floor(Math.random() * list.length)];
            setCustomText(chosen.text);
            setSupabaseLoadedSource(chosen.fromSupabase ? `Supabase: ${chosen.title}` : chosen.title);
            test.loadSnippet(chosen.text, modeChoice);
          }
        }
      } catch (err) {
        console.warn("Failed loading from Supabase:", err);
      } finally {
        setSupabaseLoading(false);
      }
    },
    [practiceMode, difficulty, test.loadSnippet]
  );

  // Initial load from Supabase on mount
  useEffect(() => {
    loadPassageFromSupabase(practiceMode, difficulty);
  }, []);

  const handleModeChange = (newMode) => {
    if (controlsLocked) return;
    setPracticeMode(newMode);
    loadPassageFromSupabase(newMode, difficulty);
  };

  const handleDifficultyChange = (newDiff) => {
    if (controlsLocked) return;
    setDifficulty(newDiff);
    loadPassageFromSupabase(practiceMode, newDiff);
  };

  useEffect(() => {
    if (test.phase === "idle" || test.phase === "running") {
      savedFinishRef.current = false;
    }
  }, [test.phase]);

  useEffect(() => {
    if (test.phase !== "finished" || savedFinishRef.current) return;
    savedFinishRef.current = true;
    saveScore({
      wpm: test.wpm,
      accuracy: test.accuracy,
      difficulty,
      mode: internalMode,
    }).catch(() => undefined);

    appendTest({
      wpm: test.wpm,
      accuracy: test.accuracy,
      durationSec,
      difficulty,
      mode: internalMode,
    });

    if (test.sessionMistakes) {
      mergeSessionMistakes(test.sessionMistakes);
    }
    recordTestCompleted();
    addXP(Math.round(test.wpm + test.accuracy));

    if (practiceMode === "daily") {
      recordDailyBest(test.wpm);
    }
  }, [
    test.phase,
    test.wpm,
    test.accuracy,
    test.sessionMistakes,
    durationSec,
    difficulty,
    internalMode,
    appendTest,
    mergeSessionMistakes,
    recordTestCompleted,
    addXP,
    practiceMode,
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
    setPracticeMode("prose");
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
  const weakLine = useMemo(() => weakKeysSentence(test.sessionMistakes), [test.sessionMistakes]);
  const topWeak = useMemo(() => topWeakKeys(6), [topWeakKeys]);

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      className="relative min-h-[calc(100vh-4rem)] text-slate-100 outline-none flex flex-col justify-between"
    >
      {/* Background Focus Zen Dimmer */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-black/85"
        animate={{ opacity: focusMode ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* =========================================================================
            1. FLOATING CONTROL BAR (MONKEYTYPE STYLE - COMPACT & BEAUTIFUL)
        ========================================================================= */}
        <motion.div
          animate={{ opacity: focusMode ? 0.15 : 1, y: focusMode ? -10 : 0 }}
          transition={{ duration: 0.2 }}
          className="mx-auto flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-[#121620]/90 px-4 py-2.5 shadow-2xl backdrop-blur-2xl"
        >
          {/* Mode Selector Segment */}
          <div className="flex flex-wrap items-center gap-1">
            {PRACTICE_MODES.map((m) => {
              const active = practiceMode === m.id;
              const isPB = m.id === "powerscript";
              const IconComp = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={controlsLocked}
                  onClick={() => handleModeChange(m.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-xs font-semibold transition-all duration-150 ${
                    active
                      ? isPB
                        ? "bg-amber-400 text-ink-950 shadow-[0_0_14px_rgba(251,191,36,0.5)] font-bold scale-105"
                        : "bg-accent text-ink-950 shadow-[0_0_12px_rgba(56,189,248,0.4)] font-bold scale-105"
                      : isPB
                      ? "text-amber-300/90 hover:bg-amber-400/10 hover:text-amber-200"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  } ${controlsLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <IconComp className="h-3.5 w-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          {/* Time Duration Segment */}
          <div className="flex items-center gap-1">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                disabled={controlsLocked}
                onClick={() => setDurationSec(d)}
                className={`rounded-xl px-2.5 py-1.5 font-mono text-xs font-semibold transition-all ${
                  durationSec === d
                    ? "bg-white/20 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                } ${controlsLocked ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {d}s
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          {/* Difficulty Segment */}
          <div className="flex items-center gap-1">
            {["easy", "medium", "hard"].map((diff) => (
              <button
                key={diff}
                type="button"
                disabled={controlsLocked}
                onClick={() => handleDifficultyChange(diff)}
                className={`rounded-xl px-2.5 py-1.5 font-mono text-xs font-semibold capitalize transition-all ${
                  difficulty === diff
                    ? "bg-white/20 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                } ${controlsLocked ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {diff}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Live Supabase Source Indicator Pill */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.15)]">
            <Database className="h-3 w-3 text-emerald-400" />
            <span>Supabase Synced</span>
          </span>
          {supabaseLoadedSource && (
            <span className="font-mono text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
              · {supabaseLoadedSource}
            </span>
          )}
          {supabaseLoading && (
            <span className="font-mono text-[11px] text-accent animate-pulse">
              (Syncing...)
            </span>
          )}
        </div>

        {/* =========================================================================
            2. MINIMALIST LIVE TELEMETRY (CLEAN, PROPER, FOCUSED)
        ========================================================================= */}
        <div className="my-8 flex items-baseline justify-between px-2">
          {/* Live WPM Speedometer Display */}
          <div className="flex items-baseline gap-2">
            <span
              className={`font-mono text-6xl font-black tracking-tighter tabular-nums transition-colors duration-150 sm:text-7xl ${
                test.phase === "running" ? "text-accent drop-shadow-[0_0_24px_rgba(56,189,248,0.4)]" : "text-slate-600"
              }`}
            >
              {test.wpm}
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">
              WPM
            </span>
          </div>

          {/* Center Cadence & Accuracy */}
          <div className="flex items-center gap-4 font-mono text-sm">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-widest text-slate-500">Accuracy</span>
              <span
                className={`font-bold tabular-nums text-lg ${
                  test.accuracy >= 97
                    ? "text-emerald-400"
                    : test.accuracy >= 92
                    ? "text-cyan-400"
                    : "text-amber-400"
                }`}
              >
                {test.accuracy}%
              </span>
            </div>

            <div className="h-6 w-[1px] bg-white/10" />

            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-widest text-slate-500">Errors</span>
              <span
                className={`font-bold tabular-nums text-lg ${
                  test.errors > 0 ? "text-rose-400 animate-bounce" : "text-slate-400"
                }`}
              >
                {test.errors}
              </span>
            </div>

            <div className="h-6 w-[1px] bg-white/10" />

            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-widest text-slate-500">CPM</span>
              <span className="font-bold tabular-nums text-lg text-slate-300">
                {test.cpm}
              </span>
            </div>
          </div>

          {/* Time Remaining Countdown Display */}
          <div className="flex items-baseline gap-1.5 font-mono">
            <span
              className={`text-4xl font-extrabold tabular-nums sm:text-5xl ${
                test.timeLeft <= 5 && test.phase === "running"
                  ? "text-rose-400 animate-pulse"
                  : "text-slate-200"
              }`}
            >
              {test.phase === "finished" ? 0 : test.timeLeft}
            </span>
            <span className="text-xs font-semibold uppercase text-slate-500">s</span>
          </div>
        </div>

        {/* =========================================================================
            3. MAIN TYPING ARENA (HERO DISPLAY - FLUID & CENTERED)
        ========================================================================= */}
        <div className="relative">
          {internalMode === "code" ? (
            <CodeTypingBox
              sourceText={test.sourceText}
              typed={test.typed}
              phase={test.phase}
              language={test.codeLanguage}
            />
          ) : (
            <TypingBox
              sourceText={test.sourceText}
              typed={test.typed}
              phase={test.phase}
            />
          )}
        </div>

        {/* =========================================================================
            4. QUICK SHORTCUTS & ACTION BAR (BOTTOM OF TEST)
        ========================================================================= */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => test.restart()}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 hover:bg-white/10 hover:text-white transition"
            >
              <RotateCcw className="h-3 w-3 text-accent" />
              <kbd className="text-[10px] font-bold text-accent">Tab</kbd>
              <span>Restart Run</span>
            </button>
            <button
              type="button"
              onClick={() => loadPassageFromSupabase(practiceMode, difficulty)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 hover:bg-white/10 hover:text-white transition"
            >
              <Shuffle className="h-3 w-3 text-emerald-400" />
              <kbd className="text-[10px] font-bold text-emerald-400">Alt+R</kbd>
              <span>New Snippet</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSound((s) => !s)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 transition ${
                sound
                  ? "border-accent/40 bg-accent/15 text-accent"
                  : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
              }`}
            >
              {sound ? (
                <>
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Sound ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-3.5 w-3.5" />
                  <span>Sound OFF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setFocusMode((f) => !f)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 transition ${
                focusMode
                  ? "border-amber-500/40 bg-amber-500/20 text-amber-200"
                  : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
              }`}
            >
              {focusMode ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span>Exit Zen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Focus Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Custom Passage Input Drawer */}
        <AnimatePresence>
          {showCustomInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 rounded-3xl border border-white/10 bg-[#121620] p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-semibold text-accent uppercase">
                  Custom Practice Input
                </span>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="font-mono text-xs text-slate-400 hover:text-white"
                >
                  ✕ Close
                </button>
              </div>
              <textarea
                rows={3}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Paste any custom PowerScript, code, or article snippet here..."
                className="w-full resize-none rounded-xl border border-white/10 bg-[#0b0e14] p-3 font-mono text-sm text-white outline-none focus:border-accent"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => test.restart()}
                  className="rounded-xl bg-accent px-5 py-2 font-mono text-xs font-bold text-ink-950 hover:brightness-110"
                >
                  Apply & Start Typing
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =========================================================================
            5. SUMMARY TILES (SUBTLE, EXPANDED ON DEMAND)
        ========================================================================= */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Live Pace Progression Chart */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#121620]/60 p-5 shadow-glass-sm backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
                Pace Graph (Live WPM)
              </span>
              <span className="font-mono text-xs text-accent">{test.wpm} WPM</span>
            </div>
            <div className="h-36 w-full">
              <LiveWpmGraph points={test.wpmSeries} />
            </div>
          </div>

          {/* Weak Keys & Quick Drill */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#121620]/60 p-5 shadow-glass-sm backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                  Weak Key Radar
                </span>
                <span className="font-mono text-[11px] text-slate-500">Auto-detected</span>
              </div>
              <WeakKeyStats
                sessionMistakes={test.sessionMistakes || {}}
                summaryLine={weakLine}
                lifetimeLine={lifetimeWeakSummary}
              />
            </div>
            {topWeak.length > 0 && (
              <button
                type="button"
                onClick={onPracticeWeak}
                className="mt-4 w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 font-mono text-xs font-bold text-amber-200 transition hover:bg-amber-500/20"
              >
                ⚡ Drill Weak Keys Now
              </button>
            )}
          </div>
        </div>
      </main>

      {/* RESULT MODAL UPON FINISH */}
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
