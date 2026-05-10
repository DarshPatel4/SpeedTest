import { useCallback, useEffect, useMemo, useState } from "react";
import { PARAGRAPHS } from "../data/paragraphs.js";

const KEY = "typeflow-streak-v1";
const DAILY_BEST_KEY = "typeflow-daily-best-v1";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function loadStreak() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { lastCompletedDay: null, streak: 0 };
    const o = JSON.parse(raw);
    return {
      lastCompletedDay: o.lastCompletedDay ?? null,
      streak: typeof o.streak === "number" ? o.streak : 0,
    };
  } catch {
    return { lastCompletedDay: null, streak: 0 };
  }
}

function saveStreak(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function loadDailyBest() {
  try {
    const raw = localStorage.getItem(DAILY_BEST_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw);
    return o && typeof o === "object" ? o : {};
  } catch {
    return {};
  }
}

function saveDailyBest(map) {
  try {
    localStorage.setItem(DAILY_BEST_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function hashDay(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getDailyChallengeText() {
  const day = todayStr();
  const idx = hashDay(`typeflow-daily-${day}`) % PARAGRAPHS.length;
  return { text: PARAGRAPHS[idx].text, dateKey: day };
}

export function useStreak() {
  const [state, setState] = useState(loadStreak);
  const [dailyBest, setDailyBest] = useState(loadDailyBest);
  const fallbackDailyChallenge = useMemo(() => getDailyChallengeText(), []);
  const [dailyChallenge, setDailyChallenge] = useState(fallbackDailyChallenge);

  useEffect(() => {
    let active = true;
    fetch("/api/daily-challenge")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("No challenge"))))
      .then((data) => {
        if (!active) return;
        const challenge = data?.challenge;
        if (!challenge?.text || !challenge?.dateKey) return;
        setDailyChallenge({
          text: String(challenge.text),
          dateKey: String(challenge.dateKey),
        });
      })
      .catch(() => {
        // Keep deterministic fallback challenge when API is unavailable.
      });
    return () => {
      active = false;
    };
  }, []);

  const recordTestCompleted = useCallback(() => {
    const today = todayStr();
    const y = yesterdayStr();
    setState((prev) => {
      if (prev.lastCompletedDay === today) {
        saveStreak(prev);
        return prev;
      }
      let nextStreak;
      if (prev.lastCompletedDay === null) {
        nextStreak = 1;
      } else if (prev.lastCompletedDay === y) {
        nextStreak = prev.streak + 1;
      } else {
        nextStreak = 1;
      }
      const data = { lastCompletedDay: today, streak: nextStreak };
      saveStreak(data);
      return data;
    });
  }, []);

  const recordDailyBest = useCallback((wpm) => {
    const day = todayStr();
    setDailyBest((prev) => {
      const cur = prev[day] ?? 0;
      if (wpm <= cur) return prev;
      const next = { ...prev, [day]: wpm };
      saveDailyBest(next);
      return next;
    });
  }, []);

  const todayBest = dailyBest[todayStr()] ?? null;

  return {
    streak: state.streak,
    lastCompletedDay: state.lastCompletedDay,
    recordTestCompleted,
    dailyChallenge,
    todayBest,
    recordDailyBest,
  };
}
