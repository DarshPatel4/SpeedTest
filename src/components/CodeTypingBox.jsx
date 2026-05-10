import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { getSyntaxTypesForChars, syntaxClass } from "../utils/codeTokens.js";

function lineRangeAt(text, index) {
  if (!text.length) return [0, 0];
  const i = Math.min(Math.max(index, 0), text.length - 1);
  let s = i;
  while (s > 0 && text[s - 1] !== "\n") s--;
  let e = i;
  while (e < text.length && text[e] !== "\n") e++;
  return [s, e];
}

function Caret() {
  return (
    <span
      className="relative inline-block h-[1.1em] w-[2px] animate-caret align-[-0.12em] bg-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.65)]"
      aria-hidden
    />
  );
}

export function CodeTypingBox({ sourceText, typed, phase, language }) {
  const cursor = typed.length;
  const wrapRef = useRef(null);

  const types = useMemo(
    () => getSyntaxTypesForChars(sourceText, language || "javascript"),
    [sourceText, language]
  );

  const windowStart = Math.max(0, cursor - 120);
  const windowEnd = Math.min(sourceText.length, cursor + 320);
  const [ls, le] = useMemo(
    () => lineRangeAt(sourceText, cursor),
    [sourceText, cursor]
  );

  const chars = useMemo(() => {
    const out = [];
    for (let i = windowStart; i < windowEnd; i++) {
      const ch = sourceText[i];
      const onLine = i >= ls && i < le;
      let status = "pending";
      if (i < typed.length) {
        status = typed[i] === ch ? "correct" : "wrong";
      }
      const syn = types[i] ?? "plain";
      out.push({ ch, onLine, status, i, syn });
    }
    return out;
  }, [sourceText, typed, cursor, ls, le, windowStart, windowEnd, types]);

  useEffect(() => {
    wrapRef.current?.querySelector("[data-caret-anchor]")?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [cursor, windowStart]);

  return (
    <motion.div
      layout
      className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0d1117] p-1 shadow-panel ring-1 ring-black/30 dark:ring-white/10"
      transition={{ layout: { type: "spring", stiffness: 320, damping: 32 } }}
    >
      <div className="flex items-center justify-between rounded-t-[1.35rem] border-b border-white/5 bg-[#161b22] px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-400/90" />
          <span className="h-2 w-2 rounded-full bg-amber-400/90" />
          <span className="h-2 w-2 rounded-full bg-emerald-400/90" />
        </div>
        <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-mist-500">
          {language || "code"}
        </span>
      </div>
      <div className="rounded-b-[1.35rem] bg-[#0d1117] p-6 pt-5">
        <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-[0.28em] text-mist-500">
          Type the snippet
        </p>
        <div
          ref={wrapRef}
          className="min-h-[8rem] whitespace-pre-wrap break-words font-mono text-[0.95rem] leading-relaxed sm:text-[1.02rem]"
        >
          {windowStart > 0 ? (
            <span className="text-mist-600">··· </span>
          ) : null}
          {chars.map(({ ch, onLine, status, i, syn }) => {
            let synCls = syntaxClass(syn);
            let statusCls = "";
            if (status === "correct") {
              statusCls = "text-emerald-400";
              synCls = "";
            } else if (status === "wrong") {
              statusCls =
                "bg-rose-500/25 text-rose-200 underline decoration-rose-400/90 decoration-2 underline-offset-[3px]";
              synCls = "";
            } else if (status === "pending") {
              statusCls = synCls;
            }
            const showCaret = i === cursor && phase === "running";
            const base =
              "rounded px-[1px] transition-colors duration-100 " +
              (onLine && status === "pending"
                ? "bg-sky-500/10 ring-1 ring-inset ring-sky-500/15 "
                : "");

            return (
              <span key={i} className="inline">
                {showCaret ? (
                  <span data-caret-anchor="1">
                    <Caret />
                  </span>
                ) : null}
                <span
                  className={`${base} ${status === "pending" ? synCls : ""} ${statusCls}`}
                >
                  {ch === "\n" ? (
                    "\n"
                  ) : ch === "\t" ? (
                    <span className="inline-block w-[0.6em] border-l border-mist-700/60 text-mist-600">
                      {"→"}
                    </span>
                  ) : ch === " " ? (
                    "\u00a0"
                  ) : (
                    ch
                  )}
                </span>
              </span>
            );
          })}
          {cursor === sourceText.length && phase === "running" ? (
            <span data-caret-anchor="1">
              <Caret />
            </span>
          ) : null}
        </div>
        <p className="mt-4 text-center text-[11px] text-mist-500">
          <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-mist-300">
            Alt+R
          </kbd>{" "}
          restart · Tab types indent · Enter breaks line
        </p>
      </div>
    </motion.div>
  );
}
