import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { appendMoreCode, buildCodeTypingText } from "../data/codeSnippets.js";
import { buildTypingText } from "../data/paragraphs.js";
import {
  computeAccuracyFromStrings,
  computeCpm,
  computeWpm,
  countErrors,
  countMatches,
} from "../utils/metrics.js";
import { computeSessionMistakes } from "./useTypingStats.js";

function appendMoreText(base, difficulty) {
  const extra = buildTypingText(difficulty, 600);
  return base + (base.endsWith(" ") ? "" : " ") + extra;
}

function initialSource(customText, mode, difficulty) {
  if (customText?.trim()) return { text: customText.trim(), lang: null };
  if (mode === "code") {
    const t = buildCodeTypingText(difficulty);
    return { text: t.text, lang: t.language };
  }
  return { text: buildTypingText(difficulty), lang: null };
}

export function useTypingTest({
  durationSec,
  difficulty,
  customText,
  soundEnabled,
  playKey,
  mode = "normal",
}) {
  const initial = useRef(null);
  if (initial.current === null) {
    initial.current = initialSource(customText, mode, difficulty);
  }
  const [codeLanguage, setCodeLanguage] = useState(initial.current.lang);
  const [sourceText, setSourceText] = useState(initial.current.text);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState("idle");
  const [timeLeft, setTimeLeft] = useState(durationSec);
  const [wpmSeries, setWpmSeries] = useState([]);
  const [tick, setTick] = useState(0);

  const startAtRef = useRef(null);
  const frozenElapsedRef = useRef(0);
  const typedRef = useRef("");
  const phaseRef = useRef(phase);
  const sourceRef = useRef(sourceText);
  const timerIdRef = useRef(null);
  const sampleIdRef = useRef(null);
  const rafRef = useRef(null);
  const modeRef = useRef(mode);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    sourceRef.current = sourceText;
  }, [sourceText]);

  useEffect(() => {
    typedRef.current = typed;
  }, [typed]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (phase !== "idle") return;
    setTimeLeft(durationSec);
  }, [durationSec, phase]);

  useEffect(() => {
    if (phaseRef.current !== "idle") return;
    if (customText?.trim()) {
      setCodeLanguage(null);
      return;
    }
    if (mode === "code") {
      const { text, language } = buildCodeTypingText(difficulty);
      setSourceText(text);
      setCodeLanguage(language);
    } else {
      setSourceText(buildTypingText(difficulty));
      setCodeLanguage(null);
    }
    setTyped("");
    setWpmSeries([]);
    frozenElapsedRef.current = 0;
    startAtRef.current = null;
  }, [difficulty, customText, mode]);

  const elapsedSec = useMemo(() => {
    if (phase === "idle") return 0;
    if (phase === "finished") return frozenElapsedRef.current;
    if (!startAtRef.current) return 0;
    return Math.max(0, (Date.now() - startAtRef.current) / 1000);
  }, [phase, tick, timeLeft]);

  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => setTick((x) => x + 1), 120);
    return () => clearInterval(id);
  }, [phase]);

  const correctChars = useMemo(
    () => countMatches(typed, sourceText),
    [typed, sourceText]
  );

  const errors = useMemo(
    () => countErrors(typed, sourceText),
    [typed, sourceText]
  );

  const wpm = useMemo(
    () => computeWpm(correctChars, Math.max(elapsedSec, 0.05)),
    [correctChars, elapsedSec]
  );

  const cpm = useMemo(
    () => computeCpm(correctChars, Math.max(elapsedSec, 0.05)),
    [correctChars, elapsedSec]
  );

  const accuracy = useMemo(
    () => computeAccuracyFromStrings(typed, sourceText),
    [typed, sourceText]
  );

  const sessionMistakes = useMemo(() => {
    if (phase !== "finished") return null;
    return computeSessionMistakes(typed, sourceText);
  }, [phase, typed, sourceText]);

  const finish = useCallback(() => {
    if (startAtRef.current) {
      frozenElapsedRef.current = Math.max(
        0,
        (Date.now() - startAtRef.current) / 1000
      );
    }
    setPhase("finished");
    if (timerIdRef.current) clearInterval(timerIdRef.current);
    if (sampleIdRef.current) clearInterval(sampleIdRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    timerIdRef.current = null;
    sampleIdRef.current = null;
  }, []);

  useEffect(() => {
    if (phase !== "running") return;
    timerIdRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          finish();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
    };
  }, [phase, finish]);

  useEffect(() => {
    if (phase !== "running") return;
    sampleIdRef.current = setInterval(() => {
      const elapsed = startAtRef.current
        ? (Date.now() - startAtRef.current) / 1000
        : 0;
      const t = typedRef.current;
      const src = sourceRef.current;
      const cc = countMatches(t, src);
      const point = computeWpm(cc, Math.max(elapsed, 0.25));
      setWpmSeries((prev) => {
        const next = [...prev, { t: Math.round(elapsed), wpm: point }];
        return next.slice(-40);
      });
    }, 1000);
    return () => {
      if (sampleIdRef.current) clearInterval(sampleIdRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "running") return;
    const c = customText?.trim();
    if (c) {
      if (typed.length >= sourceText.length - 40) {
        setSourceText((s) => s + (s.endsWith(" ") ? "" : " ") + c);
      }
      return;
    }
    if (typed.length >= sourceText.length - 120) {
      if (mode === "code" && codeLanguage) {
        setSourceText((s) => appendMoreCode(s, difficulty, codeLanguage));
      } else if (mode !== "code") {
        setSourceText((s) => appendMoreText(s, difficulty));
      }
    }
  }, [
    typed.length,
    sourceText.length,
    phase,
    difficulty,
    customText,
    mode,
    codeLanguage,
  ]);

  const restart = useCallback(() => {
    if (timerIdRef.current) clearInterval(timerIdRef.current);
    if (sampleIdRef.current) clearInterval(sampleIdRef.current);
    startAtRef.current = null;
    frozenElapsedRef.current = 0;
    setTyped("");
    setPhase("idle");
    setTimeLeft(durationSec);
    setWpmSeries([]);
    setTick(0);
    if (customText?.trim()) {
      setSourceText(customText.trim());
      setCodeLanguage(null);
    } else if (mode === "code") {
      const { text, language } = buildCodeTypingText(difficulty);
      setSourceText(text);
      setCodeLanguage(language);
    } else {
      setSourceText(buildTypingText(difficulty));
      setCodeLanguage(null);
    }
  }, [durationSec, difficulty, customText, mode]);

  const injectChar = useCallback(
    (ch, fromIdle) => {
      if (fromIdle) {
        startAtRef.current = Date.now();
        frozenElapsedRef.current = 0;
        setPhase("running");
        setTimeLeft(durationSec);
        setWpmSeries([]);
        const expect = sourceRef.current[0];
        setTyped(ch);
        if (soundEnabled && playKey) playKey(ch === expect);
        return;
      }
      setTyped((t) => {
        const next = t + ch;
        const idx = t.length;
        const expect = sourceRef.current[idx];
        if (soundEnabled && playKey) playKey(ch === expect);
        return next;
      });
    },
    [durationSec, playKey, soundEnabled]
  );

  const onKey = useCallback(
    (e) => {
      if (phase === "finished") return;

      if (e.key === "Tab" && modeRef.current !== "code") {
        e.preventDefault();
        restart();
        return;
      }

      if (e.altKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        restart();
        return;
      }

      if (e.ctrlKey || e.metaKey) return;

      if (e.key === "Escape") {
        e.preventDefault();
        restart();
        return;
      }

      if (modeRef.current === "code" && e.key === "Tab") {
        e.preventDefault();
        if (phase === "idle") injectChar("\t", true);
        else if (phase === "running") injectChar("\t", false);
        return;
      }

      if (modeRef.current === "code" && e.key === "Enter") {
        e.preventDefault();
        if (phase === "idle") injectChar("\n", true);
        else if (phase === "running") injectChar("\n", false);
        return;
      }

      const isPrintable = e.key.length === 1;

      if (phase === "idle") {
        if (e.key === "Backspace") return;
        if (!isPrintable) return;
        injectChar(e.key, true);
        e.preventDefault();
        return;
      }

      if (phase !== "running") return;

      if (e.key === "Backspace") {
        e.preventDefault();
        setTyped((t) => t.slice(0, -1));
        return;
      }

      if (!isPrintable) return;

      e.preventDefault();
      injectChar(e.key, false);
    },
    [phase, restart, injectChar]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  return {
    sourceText,
    typed,
    phase,
    timeLeft,
    wpm,
    cpm,
    accuracy,
    errors,
    correctChars,
    wpmSeries,
    restart,
    elapsedSec,
    mode,
    codeLanguage,
    sessionMistakes,
  };
}
