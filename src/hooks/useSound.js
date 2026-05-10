import { useCallback, useEffect, useState } from "react";
import { playKeyboardSound } from "../utils/sound.js";

const STORAGE_KEY = "typeflow-sound-enabled";

function loadPref() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === null) return false;
    return v === "1" || v === "true";
  } catch {
    return false;
  }
}

export function useSound() {
  const [enabled, setEnabled] = useState(loadPref);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
    } catch {
      // ignore
    }
  }, [enabled]);

  const playKey = useCallback(
    (ok) => {
      if (!enabled) return;
      try {
        playKeyboardSound(ok);
      } catch {
        // ignore
      }
    },
    [enabled]
  );

  return { enabled, setEnabled, playKey };
}
