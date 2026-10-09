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
      className="relative inline-block h-[1.15em] w-[2.5px] animate-caret align-[-0.14em] rounded-full bg-accent shadow-[0_0_16px_rgba(56,189,248,0.9)]"
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
      className="relative w-full rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-ink-950/70 p-7 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10"
      transition={{ layout: { type: "spring", stiffness: 320, damping: 32 } }}
    >
      <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-mist-400">
            Active Practice Buffer
          </span>
        </div>
        <span className="font-mono text-xs text-mist-400">
          <span className="font-bold text-accent">{cursor}</span> / {sourceText.length} chars
        </span>
      </div>

      <div
        ref={wrapRef}
        className="min-h-[8.5rem] select-none text-left font-mono text-[1.25rem] leading-[2] tracking-wider sm:text-[1.45rem]"
        style={{ wordBreak: "break-word" }}
      >
        {windowStart > 0 ? (
          <span className="text-mist-600">··· </span>
        ) : null}
        {chars.map(({ ch, inWord, status, i }) => {
          let cls = "inline rounded px-[1px] transition-colors duration-75 ";
          if (inWord) cls += "bg-accent/15 ring-1 ring-accent/20 rounded ";
          if (status === "pending") {
            cls += "text-mist-500 hover:text-mist-400";
          } else if (status === "correct") {
            cls += "text-emerald-400 font-medium drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]";
          } else if (status === "wrong") {
            cls +=
              "bg-rose-500/25 text-rose-200 underline decoration-rose-400 decoration-2 underline-offset-4";
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

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3 text-xs text-mist-400">
        <div className="flex items-center gap-2">
          <kbd className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] text-mist-200 shadow-sm">
            Tab
          </kbd>
          <span>Quick Restart</span>
          <span className="text-mist-600">·</span>
          <kbd className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] text-mist-200 shadow-sm">
            Esc
          </kbd>
          <span>Reset Test</span>
        </div>
        <span className="font-mono text-[11px] text-mist-400">
          Tip: Smooth rhythm beats burst typing.
        </span>
      </div>
    </motion.div>
  );
}
