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
      className="relative inline-block h-[1.2em] w-[2.5px] animate-caret align-[-0.15em] rounded-full bg-accent shadow-[0_0_16px_rgba(56,189,248,0.9)]"
      aria-hidden
    />
  );
}

export function TypingBox({ sourceText, typed, phase }) {
  const cursor = typed.length;
  const wrapRef = useRef(null);

  const windowStart = Math.max(0, cursor - 80);
  const windowEnd = Math.min(sourceText.length, cursor + 280);
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
      className="relative w-full rounded-3xl border border-white/[0.08] bg-[#121620]/70 p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10"
      transition={{ layout: { type: "spring", stiffness: 320, damping: 32 } }}
    >
      <div
        ref={wrapRef}
        className="min-h-[10rem] select-none text-left font-mono text-[1.35rem] leading-[2.1] tracking-wide sm:text-[1.6rem]"
        style={{ wordBreak: "break-word" }}
      >
        {windowStart > 0 ? (
          <span className="text-slate-600">··· </span>
        ) : null}
        {chars.map(({ ch, inWord, status, i }) => {
          let cls = "inline rounded px-[1px] transition-colors duration-75 ";
          if (inWord) cls += "bg-white/[0.04] ";
          if (status === "pending") {
            cls += "text-slate-500 hover:text-slate-400";
          } else if (status === "correct") {
            cls += "text-slate-100 font-medium drop-shadow-sm";
          } else if (status === "wrong") {
            cls += "bg-rose-500/25 text-rose-300 underline decoration-rose-400 decoration-2 underline-offset-4";
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
    </motion.div>
  );
}
