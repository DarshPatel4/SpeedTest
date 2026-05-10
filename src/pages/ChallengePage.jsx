import { useNavigate } from "react-router-dom";
import { useStreak } from "../hooks/useStreak.js";

export function ChallengePage() {
  const navigate = useNavigate();
  const { dailyChallenge, todayBest, streak } = useStreak();

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">Daily Challenge</h1>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glass">
        <p className="text-xs uppercase tracking-[0.2em] text-mist-400">{dailyChallenge.dateKey}</p>
        <p className="mt-3 text-lg leading-relaxed text-mist-100">{dailyChallenge.text}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-mist-300">
          <span className="rounded-xl bg-white/10 px-3 py-1">🔥 Streak: {streak}</span>
          <span className="rounded-xl bg-white/10 px-3 py-1">Best today: {todayBest ?? "-"} WPM</span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-6 rounded-2xl bg-accent px-5 py-3 font-semibold text-ink-950 transition hover:brightness-110"
        >
          Start Challenge
        </button>
      </div>
    </section>
  );
}
