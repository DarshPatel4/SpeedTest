import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { CODE_SNIPPETS } from "../data/codeSnippets.js";
import { PARAGRAPHS } from "../data/paragraphs.js";

/**
 * Fetches practice paragraphs or code snippets directly from Supabase
 * with seamless fallback to bundled presets.
 */
export async function fetchPassagesFromSupabase({ category = "all", language = "all", difficulty = "all" } = {}) {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from("daily_challenges")
        .select("id, date_key, text, source, metadata");

      if (language !== "all") {
        query = query.or(`source.eq.${language},metadata->>language.eq.${language}`);
      } else if (category !== "all") {
        query = query.or(`source.eq.${category},metadata->>category.eq.${category}`);
      }

      const { data, error } = await query.limit(50);

      if (!error && data && data.length > 0) {
        // Enforce strict language filtering if language was specified
        const strictLang = data.filter((item) => {
          if (language === "all") return true;
          const itemLang = item.metadata?.language || item.source;
          return itemLang === language;
        });

        const poolCandidate = strictLang.length > 0 ? strictLang : data;

        // Filter by difficulty if specified
        const matched = poolCandidate.filter((item) => {
          if (!difficulty || difficulty === "all") return true;
          return item.metadata?.difficulty === difficulty;
        });

        const pool = matched.length > 0 ? matched : poolCandidate;
        return pool.map((item) => ({
          id: item.id || item.date_key,
          text: item.text,
          language: item.metadata?.language || item.source || language,
          category: item.metadata?.category || (item.source === "prose" ? "prose" : "code"),
          difficulty: item.metadata?.difficulty || "medium",
          title: item.metadata?.title || item.date_key,
          fromSupabase: true,
        }));
      }
    } catch (err) {
      console.warn("Could not fetch passages from Supabase:", err.message);
    }
  }

  // Local presets fallback
  if (category === "code" || (language && language !== "all" && language !== "english")) {
    const codePool = CODE_SNIPPETS.filter((s) => language === "all" || s.language === language);
    const byDiff = codePool.filter((s) => !difficulty || difficulty === "all" || s.difficulty === difficulty);
    const finalPool = byDiff.length > 0 ? byDiff : (codePool.length > 0 ? codePool : CODE_SNIPPETS);
    return finalPool.map((c) => ({
      id: c.id,
      text: c.code,
      language: c.language,
      category: "code",
      difficulty: c.difficulty,
      title: c.title,
      fromSupabase: false,
    }));
  }

  const prosePool = PARAGRAPHS.filter((p) => !difficulty || difficulty === "all" || p.difficulty === difficulty);
  const useProse = prosePool.length > 0 ? prosePool : PARAGRAPHS;
  return useProse.map((p, idx) => ({
    id: `p-${idx}`,
    text: p.text,
    language: "english",
    category: "prose",
    difficulty: p.difficulty || "medium",
    title: p.title || `Passage ${idx + 1}`,
    fromSupabase: false,
  }));
}

/**
 * Fetches today's official daily challenge from Supabase
 */
export async function fetchDailyChallengeFromSupabase() {
  const todayKey = new Date().toISOString().slice(0, 10);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("daily_challenges")
        .select("date_key, text, metadata")
        .eq("date_key", todayKey)
        .maybeSingle();

      if (!error && data?.text) {
        return {
          dateKey: data.date_key,
          text: data.text,
          title: data.metadata?.title || "Daily Challenge",
          fromSupabase: true,
        };
      }

      // If today not found, get latest challenge
      const { data: latest } = await supabase
        .from("daily_challenges")
        .select("date_key, text, metadata")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latest?.text) {
        return {
          dateKey: latest.date_key,
          text: latest.text,
          title: latest.metadata?.title || "Daily Challenge",
          fromSupabase: true,
        };
      }
    } catch {
      // fallback
    }
  }

  return {
    dateKey: todayKey,
    text: "PowerBuilder applications leverage PowerScript for event-driven business logic and robust DataWindow manipulations with SQL transactions.",
    title: "Daily Practice Sprint",
    fromSupabase: false,
  };
}
