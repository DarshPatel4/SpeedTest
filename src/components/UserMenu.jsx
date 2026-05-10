import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const dropdownWidth = 224;

  useEffect(() => {
    const h = (e) => {
      const target = e.target;
      const clickedButton = buttonRef.current?.contains(target);
      const clickedDropdown = dropdownRef.current?.contains(target);
      if (!clickedButton && !clickedDropdown) setOpen(false);
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const left = Math.max(12, Math.min(window.innerWidth - dropdownWidth - 12, rect.right - dropdownWidth));
      setDropdownPos({ top: rect.bottom + 8, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  const initial = user?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-ink-925/70 px-4 py-2.5 text-xs font-semibold text-mist-100 shadow-glass-sm transition hover:bg-ink-900"
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/20 font-mono font-bold text-accent"
          aria-hidden
        >
          {initial}
        </span>
        <span className="hidden sm:inline">{user?.name || "User"}</span>
        <svg
          className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                position: "fixed",
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: dropdownWidth,
              }}
              className="z-[9999] overflow-hidden rounded-2xl border border-white/10 bg-ink-900/95 shadow-glass backdrop-blur-xl"
            >
              <div className="border-b border-white/5 px-4 py-3">
                <p className="font-mono text-sm font-semibold text-mist-100">{user?.name}</p>
                <p className="font-mono text-xs text-mist-500">{user?.email}</p>
                <p className="mt-1 font-mono text-[10px] text-accent">
                  Level {user?.level ?? 1} · {user?.xp ?? 0} XP
                </p>
              </div>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="block w-full px-4 py-3 text-left font-mono text-sm text-mist-100 transition hover:bg-white/10"
              >
                Profile
              </Link>
              <Link
                to="/leaderboard"
                onClick={() => setOpen(false)}
                className="block w-full px-4 py-3 text-left font-mono text-sm text-mist-100 transition hover:bg-white/10"
              >
                Global Leaderboard
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  setOpen(false);
                }}
                className="w-full px-4 py-3 text-left font-mono text-sm text-rose-400 transition hover:bg-white/10"
              >
                Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
