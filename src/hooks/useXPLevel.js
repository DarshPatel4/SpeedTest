import { useCallback, useState } from "react";

const KEY = "typeflow-xp-v1";
const XP_PER_LEVEL = 100;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const n = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function save(n) {
  try {
    localStorage.setItem(KEY, String(n));
  } catch {
    // ignore
  }
}

export function useXPLevel() {
  const [totalXP, setTotalXP] = useState(load);

  const addXP = useCallback((delta) => {
    if (delta <= 0) return;
    setTotalXP((t) => {
      const n = t + delta;
      save(n);
      return n;
    });
  }, []);

  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const progressInLevel = totalXP % XP_PER_LEVEL;
  const progressPct = progressInLevel;

  return {
    totalXP,
    level,
    progressInLevel,
    progressPct,
    addXP,
    xpForNextLevel: XP_PER_LEVEL,
  };
}
