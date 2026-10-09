import { motion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAnalytics } from "../hooks/useAnalytics.js";
import { useTypingStats } from "../hooks/useTypingStats.js";

export function AnalyticsPage() {
  const { history, stats } = useAnalytics();
  const { topWeakKeys } = useTypingStats();
  const weakKeys = topWeakKeys(8);
  const heatmap = buildHeatmap(history);

  return (
    <motion.section
      className="w-full min-h-screen space-y-6 pb-12"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            Telemetry Dashboard
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Typing Speed Analytics
        </h1>
        <p className="text-sm text-slate-400">
          Historical velocity, error radar, and weekly cadence telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Metric label="Completed Tests" value={stats.tests} />
            <Metric label="Average WPM" value={stats.avgWpm} accent="text-accent" />
            <Metric label="Accuracy" value={`${stats.avgAccuracy}%`} accent="text-emerald-400" />
          </div>

          <GlassCard>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-amber-300 font-semibold">
              Weak Key Radar
            </p>
            {weakKeys.length === 0 ? (
              <p className="font-mono text-xs text-slate-500">
                No weak keys logged yet. Complete more runs to populate error diagnostics.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {weakKeys.map(([key, count]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-2.5"
                  >
                    <span className="font-mono text-sm font-bold text-white">{key}</span>
                    <span className="font-mono text-xs text-rose-400">{count} misses</span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-accent font-semibold">
              Practice Heatmap Activity
            </p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {heatmap.map((cell) => (
                <div
                  key={`${cell.label}-${cell.value}`}
                  className="rounded-xl border border-white/5 px-2 py-2 text-center"
                  style={{
                    backgroundColor:
                      cell.value === 0
                        ? "rgba(255,255,255,0.02)"
                        : `rgba(56,189,248,${Math.min(0.2 + cell.value * 0.1, 0.65)})`,
                  }}
                >
                  <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">{cell.label}</p>
                  <p className="mt-1 font-mono text-sm font-bold text-white">{cell.value}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-accent font-semibold">
              WPM Speed Trend
            </p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.chartWpm}>
                  <CartesianGrid strokeDasharray="3 6" className="stroke-white/5" />
                  <XAxis dataKey="i" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0b0e14",
                      borderColor: "rgba(255,255,255,0.15)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Line type="monotone" dataKey="wpm" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-emerald-400 font-semibold">
              Accuracy Precision Trend
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.chartAcc}>
                  <CartesianGrid strokeDasharray="3 6" className="stroke-white/5" />
                  <XAxis dataKey="i" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0b0e14",
                      borderColor: "rgba(255,255,255,0.15)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Line type="monotone" dataKey="acc" stroke="#34d399" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.section>
  );
}

function GlassCard({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`w-full rounded-3xl border border-white/[0.08] bg-[#121620]/80 p-5 shadow-2xl backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

function buildHeatmap(history) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "AM", "Noon", "PM", "Night", "Late"];
  const map = Object.fromEntries(labels.map((l) => [l, 0]));
  history.forEach((item) => {
    const d = new Date(item.at);
    const day = d.getDay();
    const dayLabel = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day];
    if (map[dayLabel] != null) map[dayLabel] += 1;
    const h = d.getHours();
    const slot = h < 9 ? "AM" : h < 13 ? "Noon" : h < 18 ? "PM" : h < 23 ? "Night" : "Late";
    map[slot] += 1;
  });

  return labels.map((label) => ({ label, value: map[label] || 0 }));
}

function Metric({ label, value, accent = "text-white" }) {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#121620]/80 p-5 shadow-2xl backdrop-blur-xl">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className={`mt-2 font-mono text-3xl font-extrabold ${accent}`}>{value}</p>
    </div>
  );
}
