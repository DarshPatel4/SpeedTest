import { motion } from "framer-motion";
import { TypingHero } from "./TypingHero.jsx";

export function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-ink-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative hidden flex-1 lg:flex">
        <TypingHero />
      </div>

      <motion.div
        className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-[min(480px,45%)] lg:border-l lg:border-white/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-sm">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
