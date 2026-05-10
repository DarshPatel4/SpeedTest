import { useCallback, useMemo, useState } from "react";

const KEY = "typeflow-weak-keys-v1";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const o = JSON.parse(raw);
    return o && typeof o === "object" ? o : {};
  } catch {
    return {};
  }
}

function save(map) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function formatExpectedKey(ch) {
  if (ch === " ") return "space";
  if (ch === "\n") return "↵";
  if (ch === "\t") return "tab";
  if (ch === "\r") return "cr";
  return ch;
}

export function useTypingStats() {
  const [aggregate, setAggregate] = useState(load);

  const mergeSessionMistakes = useCallback((counts) => {
    if (!counts || typeof counts !== "object") return;
    setAggregate((prev) => {
      const next = { ...prev };
      for (const [k, v] of Object.entries(counts)) {
        if (typeof v === "number" && v > 0) {
          next[k] = (next[k] || 0) + v;
        }
      }
      save(next);
      return next;
    });
  }, []);

  const topWeakKeys = useCallback((n = 6) => {
    const entries = Object.entries(aggregate)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1]);
    return entries.slice(0, n);
  }, [aggregate]);

  const clearWeakKeys = useCallback(() => {
    setAggregate({});
    save({});
  }, []);

  const summary = useMemo(() => {
    const top = Object.entries(aggregate)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([k]) => k);
    if (top.length === 0) return null;
    return `You often miss: ${top.join(", ")}`;
  }, [aggregate]);

  return {
    aggregate,
    mergeSessionMistakes,
    topWeakKeys,
    clearWeakKeys,
    summary,
  };
}

export function computeSessionMistakes(typed, source) {
  const counts = {};
  const len = Math.min(typed.length, source.length);
  for (let i = 0; i < len; i++) {
    if (typed[i] !== source[i]) {
      const k = formatExpectedKey(source[i]);
      counts[k] = (counts[k] || 0) + 1;
    }
  }
  return counts;
}

export function buildWeakKeyPractice(keys) {
  const clean = keys.filter(Boolean).slice(0, 12);
  if (clean.length === 0) return "";
  const block = clean.join("  ");
  return Array(10).fill(`Focus ${block}  `).join("").trim();
}
