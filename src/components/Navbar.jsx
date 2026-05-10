import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useXPLevel } from "../hooks/useXPLevel.js";
import { useStreak } from "../hooks/useStreak.js";
import { useAuth } from "../context/AuthContext.jsx";
import { UserMenu } from "./UserMenu.jsx";

const NAV_ITEMS = [
  { to: "/", label: "Typing", end: true },
  { to: "/analytics", label: "Analytics" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/challenge", label: "Challenge" },
];

function navLinkClass(isActive) {
  return `rounded-xl px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-accent/20 text-accent shadow-[0_0_0_1px_rgba(56,189,248,0.25)]"
      : "text-mist-300 hover:bg-white/10 hover:text-mist-50"
  }`;
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalXP, level } = useXPLevel();
  const { streak } = useStreak();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/65 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_14px_rgba(56,189,248,0.9)]" />
          <span className="font-semibold tracking-tight text-mist-50">Typeflow</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => navLinkClass(isActive)}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-mist-300">
            <span className="font-mono">Lvl {level}</span>
            <span className="mx-2 text-mist-500">|</span>
            <span>{totalXP} XP</span>
            <span className="mx-2 text-mist-500">|</span>
            <span>🔥 {streak}</span>
          </div>
          {user ? <UserMenu /> : null}
        </div>

        <button
          type="button"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-mist-100 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-white/10 bg-ink-950/95 px-4 py-3 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => navLinkClass(isActive)}
                >
                  {item.label}
                </NavLink>
              ))}
              <NavLink to="/settings" onClick={() => setMobileOpen(false)} className={({ isActive }) => navLinkClass(isActive)}>
                Settings
              </NavLink>
              <NavLink to="/profile" onClick={() => setMobileOpen(false)} className={({ isActive }) => navLinkClass(isActive)}>
                Profile
              </NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
