import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, Trophy, BarChart3, Flame, Zap } from "lucide-react";
import { useXPLevel } from "../hooks/useXPLevel.js";
import { useStreak } from "../hooks/useStreak.js";
import { useAuth } from "../context/AuthContext.jsx";
import { UserMenu } from "./UserMenu.jsx";

const NAV_ITEMS = [
  { to: "/", label: "Typing Test", icon: Keyboard, end: true },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/challenge", label: "Daily Challenge", icon: Flame },
];

function navLinkClass(isActive) {
  return `relative flex items-center gap-2 rounded-xl px-3.5 py-2 font-mono text-xs font-semibold transition-all duration-200 ${
    isActive
      ? "bg-white/10 text-accent shadow-sm"
      : "text-mist-400 hover:bg-white/5 hover:text-mist-100"
  }`;
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalXP, level } = useXPLevel();
  const { streak } = useStreak();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0b0e14]/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent via-sky-400 to-indigo-500 text-ink-950 font-black shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-transform duration-300 group-hover:scale-105">
            <Zap className="h-5 w-5 fill-ink-950 text-ink-950" />
          </div>
          <div>
            <span className="font-sans text-base font-bold tracking-tight text-white">
              Type<span className="text-accent">flow</span>
            </span>
            <span className="block text-[9px] font-mono tracking-widest text-mist-500 uppercase">
              Speed & Precision
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden items-center gap-1 rounded-2xl border border-white/5 bg-white/[0.02] p-1 shadow-inner md:flex">
          {NAV_ITEMS.map((item) => {
            const IconComp = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => navLinkClass(isActive)}
              >
                <IconComp className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Stats & Auth Controls */}
        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-1.5 font-mono text-xs text-mist-300">
            <span className="text-accent font-semibold">Lvl {level}</span>
            <span className="text-mist-600">·</span>
            <span>{totalXP} XP</span>
            <span className="text-mist-600">·</span>
            <span className="flex items-center gap-1 text-orange-400 font-bold">
              <Flame className="h-3.5 w-3.5 text-orange-400 fill-orange-400" />
              <span>{streak}d</span>
            </span>
          </div>

          {user ? (
            <UserMenu />
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-gradient-to-r from-accent to-sky-400 px-4 py-2 font-mono text-xs font-bold text-ink-950 shadow-glass-sm transition-all duration-200 hover:brightness-110"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="rounded-xl border border-white/10 bg-white/5 p-2 text-mist-100 transition hover:bg-white/10 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 bg-[#0b0e14]/95 px-4 py-4 md:hidden"
          >
            <div className="flex flex-col gap-1.5">
              {NAV_ITEMS.map((item) => {
                const IconComp = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => navLinkClass(isActive)}
                  >
                    <IconComp className="h-4 w-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="font-mono text-xs text-mist-400">Level {level} · {totalXP} XP</span>
                {user ? (
                  <NavLink
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="font-mono text-xs font-bold text-accent"
                  >
                    View Profile →
                  </NavLink>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg bg-accent px-3 py-1.5 font-mono text-xs font-bold text-ink-950"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
