import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Terminal, Code2, Info } from "lucide-react";
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
      className="relative inline-block h-[1.15em] w-[2.5px] animate-caret align-[-0.14em] rounded-full bg-accent shadow-[0_0_16px_rgba(56,189,248,0.9)]"
      aria-hidden
    />
  );
}

export function CodeTypingBox({ sourceText, typed, phase, language }) {
  const cursor = typed.length;
  const wrapRef = useRef(null);

  const types = useMemo(
    () => getSyntaxTypesForChars(sourceText, language || "powerscript"),
    [sourceText, language]
  );

  const windowStart = Math.max(0, cursor - 120);
  const windowEnd = Math.min(sourceText.length, cursor + 340);
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

  const isPowerScript = language === "powerscript";

  return (
    <motion.div
      layout
      className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0d1117] p-1 shadow-2xl ring-1 ring-white/10"
      transition={{ layout: { type: "spring", stiffness: 320, damping: 32 } }}
    >
      {/* IDE Window Title Bar */}
      <div className="flex items-center justify-between rounded-t-[1.35rem] border-b border-white/10 bg-[#161b22] px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="h-3 w-3 rounded-full bg-rose-500/90 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
          <span className="h-3 w-3 rounded-full bg-amber-500/90 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
          <span className="h-3 w-3 rounded-full bg-emerald-500/90 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          <span className="ml-3 font-mono text-xs text-mist-400">
            {isPowerScript ? "PowerBuilder 2022 / PowerScript Editor" : "Code Snippet Practice"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isPowerScript ? (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/15 px-3 py-1 font-mono text-xs font-bold text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <Terminal className="h-3 w-3 text-amber-400" />
              <span>PowerScript</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs font-semibold uppercase text-accent">
              <Code2 className="h-3 w-3 text-accent" />
              <span>{language || "code"}</span>
            </span>
          )}
          <span className="font-mono text-xs text-mist-400">
            <span className="font-bold text-accent">{cursor}</span> / {sourceText.length}
          </span>
        </div>
      </div>

      <div className="rounded-b-[1.35rem] bg-[#0d1117] p-6 pt-5">
        <div
          ref={wrapRef}
          className="min-h-[9rem] select-none whitespace-pre-wrap break-words font-mono text-[1.02rem] leading-relaxed tracking-wide sm:text-[1.12rem]"
        >
          {windowStart > 0 ? (
            <span className="text-mist-600">··· </span>
          ) : null}
          {chars.map(({ ch, onLine, status, i, syn }) => {
            let synCls = syntaxClass(syn);
            let statusCls = "";
            if (status === "correct") {
              statusCls = "text-emerald-400 font-medium drop-shadow-[0_0_6px_rgba(52,211,153,0.35)]";
              synCls = "";
            } else if (status === "wrong") {
              statusCls =
                "bg-rose-500/25 text-rose-200 underline decoration-rose-400 decoration-2 underline-offset-[3px]";
              synCls = "";
            } else if (status === "pending") {
              statusCls = synCls;
            }
            const showCaret = i === cursor && phase === "running";
            const base =
              "rounded px-[1px] transition-colors duration-75 " +
              (onLine && status === "pending"
                ? "bg-sky-500/10 ring-1 ring-inset ring-sky-500/20 "
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
                    <span className="inline-block w-[0.8em] border-l border-mist-700/60 font-sans text-xs text-mist-600">
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

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3 font-mono text-xs text-mist-400">
          <div className="flex items-center gap-2">
            <kbd className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-mist-300">
              Alt+R
            </kbd>
            <span>Restart</span>
            <span className="text-mist-600">·</span>
            <kbd className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-mist-300">
              Tab
            </kbd>
            <span>Types 2 spaces/indent</span>
            <span className="text-mist-600">·</span>
            <kbd className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-mist-300">
              Enter
            </kbd>
            <span>New line</span>
          </div>
          {isPowerScript ? (
            <span className="flex items-center gap-1.5 text-amber-300/80">
              <Info className="h-3 w-3 text-amber-400" />
              <span>PowerBuilder Tip: Keywords in PowerScript are case-insensitive.</span>
            </span>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
