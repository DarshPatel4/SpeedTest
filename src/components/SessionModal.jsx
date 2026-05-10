import { AnimatePresence, motion } from "framer-motion";

export function SessionModal({ open, onExtend, onLogout }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-ink-900 p-6 shadow-glass"
          >
            <h3 className="text-xl font-semibold text-mist-50">Session expiring soon</h3>
            <p className="mt-2 font-mono text-sm text-mist-400">
              Your session is about to expire. Extend now to stay signed in.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onExtend}
                className="flex-1 rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-ink-950 transition hover:brightness-110"
              >
                Extend Session
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex-1 rounded-2xl border border-white/15 bg-ink-925 px-4 py-3 text-sm font-semibold text-mist-100 transition hover:bg-ink-800"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
