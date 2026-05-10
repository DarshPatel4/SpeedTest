import { useCallback, useMemo, useState } from "react";

const KEY = "typeflow-analytics-history-v1";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function save(rows) {
  try {
    localStorage.setItem(KEY, JSON.stringify(rows.slice(-200)));
  } catch {
    // ignore
  }
}

export function useAnalytics() {
  const [history, setHistory] = useState(load);

  const appendTest = useCallback((entry) => {
    const row = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      at: new Date().toISOString(),
      ...entry,
    };
    setHistory((prev) => {
      const next = [...prev, row];
      save(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    save([]);
  }, []);

  const stats = useMemo(() => {
    const tests = history.length;
    if (tests === 0) {
      return {
        tests: 0,
        avgWpm: 0,
        avgAccuracy: 0,
        bestWpm: 0,
        chartWpm: [],
        chartAcc: [],
      };
    }
    let wpmSum = 0;
    let accSum = 0;
    let best = 0;
    history.forEach((h) => {
      wpmSum += h.wpm || 0;
      accSum += h.accuracy || 0;
      if ((h.wpm || 0) > best) best = h.wpm;
    });
    const chartWpm = history.map((h, i) => ({
      i: i + 1,
      wpm: h.wpm,
      t: new Date(h.at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    }));
    const chartAcc = history.map((h, i) => ({
      i: i + 1,
      acc: h.accuracy,
      t: new Date(h.at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    }));
    return {
      tests,
      avgWpm: Math.round(wpmSum / tests),
      avgAccuracy: Math.round((accSum / tests) * 10) / 10,
      bestWpm: best,
      chartWpm,
      chartAcc,
    };
  }, [history]);

  return { history, appendTest, clearHistory, stats };
}
