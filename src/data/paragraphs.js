export const PARAGRAPHS = [
  { id: "e01", difficulty: "easy", text: "The sun is warm." },
  { id: "e02", difficulty: "easy", text: "Cats like to nap in soft places." },
  { id: "e03", difficulty: "easy", text: "We walk to the park on weekends." },
  { id: "e04", difficulty: "easy", text: "Fresh bread smells good in the morning." },
  { id: "e05", difficulty: "easy", text: "Rain makes the grass look greener." },
  { id: "e06", difficulty: "easy", text: "A kind word can help a friend feel better." },
  { id: "e07", difficulty: "easy", text: "Birds fly south when winter arrives." },
  { id: "e08", difficulty: "easy", text: "I drink water when I feel thirsty." },
  { id: "e09", difficulty: "easy", text: "The small boat moves slowly on the lake." },
  { id: "e10", difficulty: "easy", text: "We share a simple meal at the table." },
  { id: "e11", difficulty: "easy", text: "Stars shine bright on a clear night sky." },
  { id: "e12", difficulty: "easy", text: "My shoes feel dry after a long walk." },
  { id: "e13", difficulty: "easy", text: "the sun is warm and the sky is clear" },
  { id: "e14", difficulty: "easy", text: "we walk to the park and play on the grass" },
  { id: "e15", difficulty: "easy", text: "a calm mind and slow breath help steady hands" },
  { id: "e16", difficulty: "easy", text: "small steps each day can build a strong habit" },
  { id: "e17", difficulty: "easy", text: "my friend and i share fruit and water after class" },
  { id: "e18", difficulty: "easy", text: "birds sing above while we sit under a tall tree" },

  { id: "m01", difficulty: "medium", text: "Coffee shops hum with quiet conversation: laptops open, cups clink, and time feels a little softer." },
  { id: "m02", difficulty: "medium", text: "Good habits are built slowly; consistency beats intensity, especially on the days you do not feel like showing up." },
  { id: "m03", difficulty: "medium", text: "A well-designed form asks only what it needs, explains why it matters, and never punishes mistakes." },
  { id: "m04", difficulty: "medium", text: "Travel teaches patience: delayed trains, new languages, and the small joy of finding your way without a map." },
  { id: "m05", difficulty: "medium", text: "Music can change a room: a soft piano makes the evening feel wider, and a bright rhythm lifts tired shoulders." },
  { id: "m06", difficulty: "medium", text: "Writing is thinking made visible; editing is the polite refusal to keep every first thought." },
  { id: "m07", difficulty: "medium", text: "Markets move on stories, numbers, and fear; the hardest part is knowing which one is real today." },
  { id: "m08", difficulty: "medium", text: "Friendship needs room to breathe: honest messages, forgiven mistakes, and time without a plan." },
  { id: "m09", difficulty: "medium", text: "Cooking teaches timing: salt early, taste often, and stop before you think you are done." },
  { id: "m10", difficulty: "medium", text: "A calm inbox is a quiet mind: archive, label, and delete what no longer serves your next week." },
  { id: "m11", difficulty: "medium", text: "Cities are layers: old stone, new glass, and the same human wish to belong somewhere." },
  { id: "m12", difficulty: "medium", text: "Sleep is not a luxury; it is the nightly reset that keeps your memory sharp and your mood steady." },

  { id: "h01", difficulty: "hard", text: "Epistemological humility demands proportionality: confidence should scale with evidence, not with incentives (grants, likes, promotions)." },
  { id: "h02", difficulty: "hard", text: "Cryptographic agility matters: rotate keys, deprecate weak suites (SHA-1, MD5), and never roll your own RNG — use /dev/urandom or OS APIs." },
  { id: "h03", difficulty: "hard", text: "Latency p99 can exceed p50 by 10× under load; dashboards that show averages only hide the tail that users actually feel." },
  { id: "h04", difficulty: "hard", text: "Formal verification is expensive; lightweight model checking + property tests often catch 80% of concurrency bugs at 20% of the cost." },
  { id: "h05", difficulty: "hard", text: "Unicode normalization (NFC vs NFD) breaks naive string comparisons; always normalize before hashing filenames or cache keys." },
  { id: "h06", difficulty: "hard", text: "Backpressure is a feature: drop, sample, or queue — but never silently block forever; expose metrics (queue depth, drop rate)." },
  { id: "h07", difficulty: "hard", text: "The halting problem is undecidable; static analyzers therefore approximate — expect false positives, tune rules, and review diffs." },
  { id: "h08", difficulty: "hard", text: "Distributed consensus: Paxos/Raft tolerate f faults with 2f+1 nodes; network partitions force a choice between availability and strong consistency." },
  { id: "h09", difficulty: "hard", text: "Floating-point math is not associative: (0.1 + 0.2) !== 0.3 in IEEE-754; use decimals for money, epsilons for comparisons." },
  { id: "h10", difficulty: "hard", text: "OAuth 2.1 discourages implicit flows; prefer authorization code + PKCE for public clients; validate redirect URIs strictly." },
  { id: "h11", difficulty: "hard", text: "Kernel scheduling: CFS uses vruntime; CPU shares & cgroups matter when containers fight for the same host @ 3.2 GHz." },
  { id: "h12", difficulty: "hard", text: "Regex catastrophes: nested quantifiers (a+)+ can explode CPU; use possessive quantifiers, atomic groups, or RE2 where possible." },
];

export const DIFFICULTY_LEVELS = ["easy", "medium", "hard"];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getParagraphsByDifficulty(difficulty) {
  return PARAGRAPHS.filter((p) => p.difficulty === difficulty);
}

export function buildTypingText(difficulty, minChars = 1200) {
  const pool = getParagraphsByDifficulty(difficulty).map((p) => p.text);
  if (pool.length === 0) {
    const fallback = getParagraphsByDifficulty("medium").map((p) => p.text);
    return buildFromPool(fallback, minChars);
  }
  return buildFromPool(pool, minChars);
}

function buildFromPool(pool, minChars) {
  const parts = shuffle(pool);
  let out = "";
  let i = 0;
  while (out.length < minChars && i < parts.length * 4) {
    const p = parts[i % parts.length];
    out += (out ? " " : "") + p;
    i++;
  }
  return out;
}
