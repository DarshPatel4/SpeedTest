export const CODE_SNIPPETS = [
  {
    id: "js1",
    language: "javascript",
    difficulty: "easy",
    title: "Fetch JSON",
    code: `async function loadUser(id) {\n  const res = await fetch(\`/api/users/\${id}\`);\n  if (!res.ok) throw new Error("bad");\n  return res.json();\n}`,
  },
  {
    id: "js2",
    language: "javascript",
    difficulty: "medium",
    title: "Debounce",
    code: `function debounce(fn, ms) {\n  let t;\n  return (...args) => {\n    clearTimeout(t);\n    t = setTimeout(() => fn(...args), ms);\n  };\n}`,
  },
  {
    id: "js3",
    language: "javascript",
    difficulty: "hard",
    title: "Memoize",
    code: `const memo = (f) => {\n  const c = new Map();\n  return (k) => c.has(k) ? c.get(k) : (c.set(k, f(k)), c.get(k));\n};`,
  },
  {
    id: "py1",
    language: "python",
    difficulty: "easy",
    title: "Read lines",
    code: `def read_lines(path: str) -> list[str]:\n    with open(path, "r", encoding="utf-8") as f:\n        return f.read().splitlines()`,
  },
  {
    id: "py2",
    language: "python",
    difficulty: "medium",
    title: "Group by",
    code: `from collections import defaultdict\n\ndef group_by(items, key):\n    g = defaultdict(list)\n    for x in items:\n        g[key(x)].append(x)\n    return dict(g)`,
  },
  {
    id: "py3",
    language: "python",
    difficulty: "hard",
    title: "Context manager",
    code: `import time\nfrom contextlib import contextmanager\n\n@contextmanager\ndef timer(name: str):\n    t0 = time.perf_counter()\n    yield\n    print(f"{name}: {time.perf_counter() - t0:.3f}s")`,
  },
  {
    id: "html1",
    language: "markup",
    difficulty: "easy",
    title: "Semantic block",
    code: `<article class="card">\n  <header>\n    <h2>Title</h2>\n    <time datetime="2025-01-01">Jan 1</time>\n  </header>\n  <p>Hello <strong>world</strong>.</p>\n</article>`,
  },
  {
    id: "css1",
    language: "css",
    difficulty: "medium",
    title: "Flex center",
    code: `.center {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 100vh;\n  gap: 1rem;\n}`,
  },
  {
    id: "js4",
    language: "javascript",
    difficulty: "easy",
    title: "Sum",
    code: `export const sum = (nums) =>\n  nums.reduce((a, b) => a + b, 0);\n\nconsole.assert(sum([1, 2, 3]) === 6);`,
  },
  {
    id: "py4",
    language: "python",
    difficulty: "easy",
    title: "Clamp",
    code: `def clamp(x: float, lo: float, hi: float) -> float:\n    return max(lo, min(hi, x))\n\nassert clamp(1.5, 0, 1) == 1.0`,
  },
  {
    id: "html2",
    language: "markup",
    difficulty: "medium",
    title: "Form",
    code: `<form action="/login" method="post">\n  <label for="email">Email</label>\n  <input id="email" name="email" type="email" required />\n  <button type="submit">Sign in</button>\n</form>`,
  },
  {
    id: "css2",
    language: "css",
    difficulty: "hard",
    title: "Grid",
    code: `.layout {\n  display: grid;\n  grid-template-columns: repeat(12, 1fr);\n  column-gap: 1.5rem;\n  row-gap: 1rem;\n}\n.span-6 { grid-column: span 6; }`,
  },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickCodeLanguageForDifficulty(difficulty) {
  const pool = CODE_SNIPPETS.filter((s) => s.difficulty === difficulty);
  const use = pool.length ? pool : CODE_SNIPPETS;
  const langs = [...new Set(use.map((s) => s.language))];
  return langs[Math.floor(Math.random() * langs.length)];
}

export function buildCodeTypingText(difficulty, minChars = 900) {
  const lang = pickCodeLanguageForDifficulty(difficulty);
  const pool = CODE_SNIPPETS.filter(
    (s) => s.language === lang && s.difficulty === difficulty
  );
  const wide =
    pool.length > 0
      ? pool
      : CODE_SNIPPETS.filter((s) => s.language === lang);
  const parts = shuffle(wide.length ? wide : CODE_SNIPPETS);
  let out = "";
  let i = 0;
  while (out.length < minChars && i < parts.length * 5) {
    const p = parts[i % parts.length];
    out += (out ? "\n\n" : "") + p.code;
    i++;
  }
  return { text: out, language: lang };
}

export function appendMoreCode(base, difficulty, language) {
  const pool = CODE_SNIPPETS.filter(
    (s) => s.language === language && s.difficulty === difficulty
  );
  const wide =
    pool.length > 0
      ? pool
      : CODE_SNIPPETS.filter((s) => s.language === language);
  const parts = shuffle(wide.length ? wide : CODE_SNIPPETS);
  const extra = parts[0]?.code ?? "";
  if (!extra) return base;
  return base + (base.endsWith("\n") ? "\n" : "\n\n") + extra;
}
