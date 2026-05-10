import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchProfileStats } from "../api/scores.js";

export function ProfilePage() {
  const { user, updateProfile, sessions, loadSessions, logoutAll } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [stats, setStats] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user?._id) return;
    fetchProfileStats(user._id)
      .then(setStats)
      .catch(() => undefined);
  }, [user?._id]);

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
      setMsg("Profile updated");
    } catch (error) {
      setErr(error.message || "Profile update failed");
    }
  };

  return (
    <div className="min-h-screen bg-mist-100 px-4 py-10 text-ink-900 dark:bg-ink-950 dark:text-mist-100 sm:px-6">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-ink-900/45 p-6 shadow-glass">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <form onSubmit={onSave} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-white/10 bg-ink-925 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Avatar URL
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="rounded-xl border border-white/10 bg-ink-925 px-3 py-2"
            />
          </label>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button className="rounded-xl bg-accent px-4 py-2 font-semibold text-ink-950">
              Save profile
            </button>
            {msg && <span className="text-emerald-300">{msg}</span>}
            {err && <span className="text-rose-300">{err}</span>}
          </div>
        </form>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Stat title="XP" value={stats?.xp ?? user?.xp ?? 0} />
          <Stat title="Level" value={stats?.level ?? user?.level ?? 1} />
          <Stat title="Streak" value={stats?.streak ?? user?.streak ?? 0} />
          <Stat title="Tests" value={stats?.testCount ?? 0} />
          <Stat title="Avg WPM" value={avgWpm} />
          <Stat title="Email" value={user?.email || "-"} />
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Active sessions</h2>
            <button
              type="button"
              onClick={async () => {
                await logoutAll();
              }}
              className="rounded-xl border border-rose-500/30 bg-rose-950/30 px-3 py-2 text-xs font-semibold text-rose-300"
            >
              Logout all devices
            </button>
          </div>
          <div className="space-y-2">
            {sessions.map((s) => (
              <div key={s.id} className="rounded-xl border border-white/10 bg-ink-925/60 px-4 py-3 text-sm">
                <div className="font-medium">{s.device}</div>
                <div className="text-mist-400">
                  Expires: {new Date(s.expiresAt).toLocaleString()}
                </div>
              </div>
            ))}
            {sessions.length === 0 && <div className="text-sm text-mist-500">No active sessions.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-925/70 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-mist-500">{title}</div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
    </div>
  );
}
