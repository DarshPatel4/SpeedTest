export const CODE_SNIPPETS = [
  // ==========================================
  // PowerScript (PowerBuilder) Practice Snippets
  // ==========================================
  {
    id: "pb1",
    language: "powerscript",
    difficulty: "easy",
    title: "DataWindow Retrieve",
    code: `// Retrieve DataWindow with SQLCA transaction
Long ll_rows
dw_1.SetTransObject(SQLCA)
ll_rows = dw_1.Retrieve()

IF ll_rows < 0 THEN
  MessageBox("Database Error", "Failed to retrieve records.")
END IF`,
  },
  {
    id: "pb2",
    language: "powerscript",
    difficulty: "easy",
    title: "Prompt and Event",
    code: `// Confirmation prompt and user event trigger
Integer li_ans
li_ans = MessageBox("Exit Confirmation", "Do you wish to save changes before exit?", Question!, YesNoCancel!)

IF li_ans = 1 THEN
  Parent.TriggerEvent("ue_save")
END IF`,
  },
  {
    id: "pb3",
    language: "powerscript",
    difficulty: "easy",
    title: "DataWindow Filter",
    code: `// Apply client-side DataWindow filter
String ls_filter
ls_filter = "status = 'ACTIVE' AND balance > 0"
dw_orders.SetFilter(ls_filter)
dw_orders.Filter()`,
  },
  {
    id: "pb4",
    language: "powerscript",
    difficulty: "medium",
    title: "Insert Row & Commit",
    code: `// DataWindow insert row and update transaction
Long ll_new
ll_new = dw_1.InsertRow(0)
dw_1.SetItem(ll_new, "created_date", Today())
dw_1.SetItem(ll_new, "status", "OPEN")
dw_1.ScrollToRow(ll_new)

IF dw_1.Update() = 1 THEN
  COMMIT USING SQLCA;
ELSE
  ROLLBACK USING SQLCA;
  MessageBox("Error", SQLCA.SQLErrText)
END IF`,
  },
  {
    id: "pb5",
    language: "powerscript",
    difficulty: "medium",
    title: "Choose Case Priority",
    code: `// Choose Case control structure in PowerScript
String ls_priority
CHOOSE CASE li_code
  CASE 1, 2
    ls_priority = "Critical"
  CASE 3
    ls_priority = "Elevated"
  CASE 4
    ls_priority = "Routine"
  CASE ELSE
    ls_priority = "Unspecified"
END CHOOSE`,
  },
  {
    id: "pb6",
    language: "powerscript",
    difficulty: "medium",
    title: "Loop & Sum",
    code: `// Iterate DataWindow rows to compute total
Long ll_i, ll_total
Decimal{2} ldc_sum = 0.0

ll_total = dw_items.RowCount()
FOR ll_i = 1 TO ll_total
  ldc_sum += dw_items.GetItemNumber(ll_i, "item_price")
NEXT`,
  },
  {
    id: "pb7",
    language: "powerscript",
    difficulty: "hard",
    title: "Embedded SQL & Exception",
    code: `// Embedded SQL with exception and transaction handling
Long ll_cust_id = 1042
String ls_name
DateTime ldt_last_order

TRY
  SELECT cust_name, last_order
    INTO :ls_name, :ldt_last_order
    FROM customer_master
   WHERE customer_id = :ll_cust_id
   USING SQLCA;

  IF SQLCA.SQLCode = 0 THEN
    dw_cust.SetItem(1, "customer_name", ls_name)
    COMMIT USING SQLCA;
  ELSE
    ROLLBACK USING SQLCA;
    MessageBox("SQL Exception", "Customer not found: " + SQLCA.SQLErrText)
  END IF
CATCH (Throwable ex)
  MessageBox("Runtime Error", ex.GetMessage())
FINALLY
  This.SetRedraw(True)
END TRY`,
  },
  {
    id: "pb8",
    language: "powerscript",
    difficulty: "hard",
    title: "Window Communication & DataStore",
    code: `// Window parameter communication and DataStore refresh
s_cust_param lstr_data
lstr_data.cust_id = dw_1.GetItemNumber(dw_1.GetRow(), "id")
lstr_data.mode = "EDIT"

OpenWithParm(w_customer_detail, lstr_data)

IF Message.DoubleParm = 1 THEN
  dw_1.SetRedraw(False)
  dw_1.Retrieve()
  dw_1.SetRedraw(True)
END IF`,
  },

  // ==========================================
  // JavaScript Snippets
  // ==========================================
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
    id: "js4",
    language: "javascript",
    difficulty: "easy",
    title: "Sum",
    code: `export const sum = (nums) =>\n  nums.reduce((a, b) => a + b, 0);\n\nconsole.assert(sum([1, 2, 3]) === 6);`,
  },

  // ==========================================
  // Python Snippets
  // ==========================================
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
    id: "py4",
    language: "python",
    difficulty: "easy",
    title: "Clamp",
    code: `def clamp(x: float, lo: float, hi: float) -> float:\n    return max(lo, min(hi, x))\n\nassert clamp(1.5, 0, 1) == 1.0`,
  },

  // ==========================================
  // HTML / CSS Snippets
  // ==========================================
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
    id: "css2",
    language: "css",
    difficulty: "hard",
    title: "Grid",
    code: `.layout {\n  display: grid;\n  grid-template-columns: repeat(12, 1fr);\n  column-gap: 1.5rem;\n  row-gap: 1rem;\n}\n.span-6 { grid-column: span 6; }`,
  },
];

export const AVAILABLE_CODE_LANGUAGES = [
  { id: "all", label: "All Languages" },
  { id: "powerscript", label: "PowerScript (PowerBuilder)" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "css", label: "CSS" },
  { id: "markup", label: "HTML" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickCodeLanguageForDifficulty(difficulty, requestedLang = "all") {
  if (requestedLang && requestedLang !== "all") {
    return requestedLang;
  }
  const pool = CODE_SNIPPETS.filter((s) => s.difficulty === difficulty);
  const use = pool.length ? pool : CODE_SNIPPETS;
  const langs = [...new Set(use.map((s) => s.language))];
  return langs[Math.floor(Math.random() * langs.length)];
}

export function buildCodeTypingText(difficulty, minChars = 700, requestedLang = "all") {
  const lang = pickCodeLanguageForDifficulty(difficulty, requestedLang);
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
  while (out.length < minChars && i < parts.length * 6) {
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
