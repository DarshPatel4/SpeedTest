import { motion } from "framer-motion";

export function AuthContainer({ children }) {
  return (
    <motion.div
      className="w-full rounded-3xl border border-white/10 bg-ink-925/50 p-8 shadow-glass backdrop-blur-xl"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}
