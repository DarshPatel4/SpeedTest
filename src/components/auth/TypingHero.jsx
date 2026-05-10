import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const PHRASES = [
  "Type faster. Stay calm.",
  "WPM × accuracy × flow",
  "Build muscle memory",
  "Code or prose — your call",
];

function useTypingEffect(words, speed = 80, pause = 1800) {
  const [idx, setIdx] = useState(0);
  const [subIdx, setSubIdx] = useState(0);
  const [phase, setPhase] = useState("typing");

  useEffect(() => {
    const word = words[idx % words.length];
    if (phase === "typing") {
      if (subIdx < word.length) {
        const t = setTimeout(() => setSubIdx((s) => s + 1), speed);
        return () => clearTimeout(t);
      }
      setPhase("pause");
    } else {
      const t = setTimeout(() => {
        setPhase("typing");
        setSubIdx(0);
        setIdx((i) => i + 1);
      }, pause);
      return () => clearTimeout(t);
    }
  }, [idx, subIdx, phase, words, speed, pause]);

  return words[idx % words.length].slice(0, subIdx);
}

export function TypingHero() {
  const display = useTypingEffect(PHRASES);

  return (
    <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.35em] text-accent/90">
          Typeflow
        </span>
        <h1 className="mt-4 font-sans text-3xl font-semibold leading-tight tracking-tight text-mist-50 sm:text-4xl">
          {display}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="inline-block h-[1.1em] w-[2px] align-[-0.1em] bg-accent"
          />
        </h1>
        <p className="mt-6 max-w-md font-mono text-sm leading-relaxed text-mist-500">
          Track WPM, accuracy, streaks, and XP. Practice prose or code. Stay in flow.
        </p>
      </motion.div>
    </div>
  );
}
