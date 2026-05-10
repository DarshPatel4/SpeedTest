import { apiUrl, authFetch } from "./client.js";

export async function saveScore(payload) {
  const res = await authFetch("/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to save score");
  return data;
}

export async function fetchLeaderboard() {
  const res = await fetch(apiUrl("/api/leaderboard"));
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to fetch leaderboard");
  return data.leaderboard || [];
}

export async function fetchProfileStats(userId) {
  const res = await fetch(apiUrl(`/api/profile/${userId}/stats`));
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to fetch stats");
  return data.stats;
}
