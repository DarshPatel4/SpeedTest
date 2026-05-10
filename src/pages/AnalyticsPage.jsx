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
      className="w-full min-h-screen space-y-6 pb-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Analytics Dashboard</h1>
        <p className="text-sm text-mist-400">Full-session performance, weak keys, and trend insights.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Metric label="Tests" value={stats.tests} />
            <Metric label="Avg WPM" value={stats.avgWpm} />
            <Metric label="Avg Accuracy" value={`${stats.avgAccuracy}%`} />
          </div>

          <GlassCard>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-mist-400">Weak Keys</p>
            {weakKeys.length === 0 ? (
              <p className="text-sm text-mist-500">No weak key data yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {weakKeys.map(([key, count]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-925/60 px-3 py-2"
                  >
                    <span className="font-mono text-sm text-mist-100">{key}</span>
                    <span className="text-xs text-mist-400">{count} misses</span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-mist-400">Practice Heatmap</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {heatmap.map((cell) => (
                <div
                  key={`${cell.label}-${cell.value}`}
                  className="rounded-lg border border-white/10 px-2 py-2 text-center"
                  style={{
                    backgroundColor:
                      cell.value === 0
                        ? "rgba(148,163,184,0.08)"
                        : `rgba(56,189,248,${Math.min(0.18 + cell.value * 0.08, 0.55)})`,
                  }}
                >
                  <p className="text-[10px] uppercase tracking-[0.15em] text-mist-400">{cell.label}</p>
                  <p className="mt-1 text-sm font-semibold text-mist-100">{cell.value}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-mist-400">WPM Trend</p>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.chartWpm}>
                  <CartesianGrid strokeDasharray="3 6" className="stroke-mist-800" />
                  <XAxis dataKey="i" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="wpm" stroke="#38bdf8" strokeWidth={2.4} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-mist-400">Accuracy Trend</p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.chartAcc}>
                  <CartesianGrid strokeDasharray="3 6" className="stroke-mist-800" />
                  <XAxis dataKey="i" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="acc" stroke="#34d399" strokeWidth={2.4} dot={false} />
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
      transition={{ duration: 0.24 }}
      className={`w-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md ${className}`}
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

function Metric({ label, value }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-mist-400">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </motion.div>
  );
}
