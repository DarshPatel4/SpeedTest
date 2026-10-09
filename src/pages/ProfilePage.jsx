import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchProfileStats } from "../api/scores.js";
import { motion } from "framer-motion";

export function ProfilePage() {
  const { user, updateProfile, sessions, loadSessions, logoutAll } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [stats, setStats] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const userId = user?.id || user?._id;
    if (!userId) return;
    fetchProfileStats(userId)
      .then(setStats)
      .catch(() => undefined);
  }, [user?.id, user?._id]);

  useEffect(() => {
    loadSessions().catch(() => undefined);
  }, [loadSessions]);

  const avgWpm = useMemo(() => {
    const arr = stats?.wpmHistory || [];
    if (!arr.length) return 0;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  }, [stats]);

  const onSave = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      await updateProfile({ name, avatarUrl });
      setMsg("Profile saved successfully");
    } catch (error) {
      setErr(error.message || "Profile update failed");
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 text-slate-100 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Runner Profile
            </span>
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Account & Progression
          </h1>
        </div>

        {/* User Card & Form */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#121620]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={onSave} className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 font-mono text-xs text-slate-300">
              Display Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#0b0e14] px-4 py-2.5 font-mono text-sm text-white outline-none focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1.5 font-mono text-xs text-slate-300">
              Avatar Image URL
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.png"
                className="rounded-xl border border-white/10 bg-[#0b0e14] px-4 py-2.5 font-mono text-sm text-white outline-none focus:border-accent"
              />
            </label>
            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <button className="rounded-xl bg-accent px-5 py-2.5 font-mono text-xs font-bold text-ink-950 transition hover:brightness-110">
                Save Profile
              </button>
              {msg && <span className="font-mono text-xs text-emerald-400">{msg}</span>}
              {err && <span className="font-mono text-xs text-rose-400">{err}</span>}
            </div>
          </form>

          {/* Stats Grid */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <StatCard title="Total XP" value={stats?.xp ?? user?.xp ?? 0} />
            <StatCard title="Level" value={stats?.level ?? user?.level ?? 1} />
            <StatCard title="Active Streak" value={`${stats?.streak ?? user?.streak ?? 0} days`} />
            <StatCard title="Completed Tests" value={stats?.testCount ?? 0} />
            <StatCard title="Average WPM" value={avgWpm} />
            <StatCard title="Email" value={user?.email || "Guest User"} />
          </div>

          {/* Active Sessions */}
          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-slate-300">
                Active Sessions
              </h2>
              <button
                type="button"
                onClick={async () => {
                  await logoutAll();
                }}
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 font-mono text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
              >
                Sign Out All Devices
              </button>
            </div>
            <div className="space-y-2">
              {sessions.map((s) => (
                <div key={s.id} className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 font-mono text-xs text-slate-300">
                  <div className="font-semibold text-white">{s.device}</div>
                  <div className="text-slate-500 mt-1">
                    Expires: {new Date(s.expiresAt).toLocaleString()}
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="font-mono text-xs text-slate-500">Active session stored locally.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center">
      <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400">{title}</div>
      <div className="mt-1 font-mono text-xl font-bold text-white">{value}</div>
    </div>
  );
}
