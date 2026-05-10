import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";

function wordRangeAt(text, index) {
  if (!text.length) return [0, 0];
  const i = Math.min(Math.max(index, 0), text.length - 1);
  let s = i;
  while (s > 0 && text[s - 1] !== " ") s--;
  let e = i;
  while (e < text.length && text[e] !== " ") e++;
  return [s, e];
}

function Caret() {
  return (
    <span
      className="relative inline-block h-[1.1em] w-[2px] animate-caret align-[-0.12em] bg-accent shadow-[0_0_14px_rgba(56,189,248,0.55)]"
      aria-hidden
    />
  );
}

export function TypingBox({ sourceText, typed, phase }) {
  const cursor = typed.length;
  const wrapRef = useRef(null);

  const windowStart = Math.max(0, cursor - 80);
  const windowEnd = Math.min(sourceText.length, cursor + 260);
  const [ws, we] = useMemo(
    () => wordRangeAt(sourceText, cursor),
    [sourceText, cursor]
  );

  const chars = useMemo(() => {
    const out = [];
    for (let i = windowStart; i < windowEnd; i++) {
      const ch = sourceText[i];
      const inWord = i >= ws && i < we;
      let status = "pending";
      if (i < typed.length) {
        status = typed[i] === ch ? "correct" : "wrong";
      }
      out.push({ ch, inWord, status, i });
    }
    return out;
  }, [sourceText, typed, cursor, ws, we, windowStart, windowEnd]);

  useEffect(() => {
    const el = wrapRef.current?.querySelector("[data-caret-anchor]");
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [cursor, windowStart]);

  return (
    <motion.div
      layout
      className="relative w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-panel dark:bg-ink-900/35"
      transition={{ layout: { type: "spring", stiffness: 320, damping: 32 } }}
    >
      <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-[0.28em] text-mist-500 dark:text-mist-400">
        Type the passage
      </p>
      <div
        ref={wrapRef}
        className="min-h-[7.5rem] text-left font-mono text-[1.2rem] leading-[1.9] tracking-wide sm:text-[1.35rem]"
        style={{ wordBreak: "break-word" }}
      >
        {windowStart > 0 ? (
          <span className="text-mist-400 dark:text-mist-600">··· </span>
        ) : null}
        {chars.map(({ ch, inWord, status, i }) => {
          const base =
            "inline rounded px-[1px] transition-colors duration-100";
          let cls = `${base} `;
          if (inWord) cls += "bg-accent/10 dark:bg-accent/15 ";
          if (status === "pending") {
            cls += "text-mist-400 dark:text-mist-500";
          } else if (status === "correct") {
            cls += "text-emerald-600 dark:text-good";
          } else if (status === "wrong") {
            cls +=
              "bg-rose-500/15 text-rose-700 underline decoration-rose-400/80 decoration-2 underline-offset-4 dark:bg-bad/20 dark:text-rose-200";
          }

          const showCaret = i === cursor && phase === "running";

          return (
            <span key={i} className="inline">
              {showCaret ? (
                <span data-caret-anchor="1">
                  <Caret />
                </span>
              ) : null}
              <span className={cls}>{ch === " " ? "\u00a0" : ch}</span>
            </span>
          );
        })}
        {cursor === sourceText.length && phase === "running" ? (
          <span data-caret-anchor="1">
            <Caret />
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-center text-xs text-mist-500 dark:text-mist-400">
        <kbd className="rounded-md border border-mist-200 bg-mist-100/80 px-1.5 py-0.5 font-mono text-[10px] text-ink-800 dark:border-white/10 dark:bg-white/5 dark:text-mist-200">
          Tab
        </kbd>{" "}
        restart ·{" "}
        <kbd className="rounded-md border border-mist-200 bg-mist-100/80 px-1.5 py-0.5 font-mono text-[10px] text-ink-800 dark:border-white/10 dark:bg-white/5 dark:text-mist-200">
          Esc
        </kbd>{" "}
        reset
      </p>
    </motion.div>
  );
}
