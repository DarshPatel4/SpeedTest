import { useEffect, useState } from "react";
import { fetchLeaderboard } from "../api/scores.js";

export function LeaderboardPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLeaderboard().then(setRows).catch((e) => setError(e.message || "Failed to load"));
  }, []);

  return (
    <div className="min-h-screen bg-mist-100 px-4 py-10 text-ink-900 dark:bg-ink-950 dark:text-mist-100 sm:px-6">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-ink-900/45 p-6 shadow-glass">
        <h1 className="text-2xl font-semibold">Global Leaderboard</h1>
        {error && <p className="mt-3 text-rose-300">{error}</p>}
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-925/70 text-mist-400">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">WPM</th>
                <th className="px-4 py-3">Accuracy</th>
                <th className="px-4 py-3">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3">{row.wpm}</td>
                  <td className="px-4 py-3">{row.accuracy}%</td>
                  <td className="px-4 py-3">{row.difficulty}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-mist-500">
                    No leaderboard data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
