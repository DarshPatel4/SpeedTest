import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SAMPLE_PASSAGES = [
  // ==========================================
  // PowerScript (PowerBuilder) Paragraphs & Snippets
  // ==========================================
  {
    date_key: "pb-dw-retrieve-01",
    source: "powerscript",
    text: `// Retrieve DataWindow with SQLCA transaction
Long ll_rows
dw_1.SetTransObject(SQLCA)
ll_rows = dw_1.Retrieve()

IF ll_rows < 0 THEN
  MessageBox("Database Error", "Failed to retrieve employee records.")
END IF`,
    metadata: {
      title: "DataWindow Retrieve & Error Handling",
      language: "powerscript",
      category: "code",
      difficulty: "easy",
    },
  },
  {
    date_key: "pb-msgbox-prompt-02",
    source: "powerscript",
    text: `// Prompt user with confirmation box
Integer li_response
li_response = MessageBox("Save Changes", "Do you wish to commit pending modifications?", Question!, YesNoCancel!)

IF li_response = 1 THEN
  Parent.TriggerEvent("ue_save_data")
END IF`,
    metadata: {
      title: "MessageBox Prompt & Event Trigger",
      language: "powerscript",
      category: "code",
      difficulty: "easy",
    },
  },
  {
    date_key: "pb-dw-filter-03",
    source: "powerscript",
    text: `// Client-side DataWindow filter evaluation
String ls_filter
ls_filter = "status = 'ACTIVE' AND account_balance > 0"
dw_customers.SetFilter(ls_filter)
dw_customers.Filter()`,
    metadata: {
      title: "DataWindow Dynamic Filter",
      language: "powerscript",
      category: "code",
      difficulty: "easy",
    },
  },
  {
    date_key: "pb-insert-commit-04",
    source: "powerscript",
    text: `// DataWindow row insertion and SQL transaction commit
Long ll_new_row
ll_new_row = dw_1.InsertRow(0)
dw_1.SetItem(ll_new_row, "entry_date", Today())
dw_1.SetItem(ll_new_row, "status_code", "PENDING")
dw_1.ScrollToRow(ll_new_row)

IF dw_1.Update() = 1 THEN
  COMMIT USING SQLCA;
ELSE
  ROLLBACK USING SQLCA;
  MessageBox("Transaction Failed", SQLCA.SQLErrText)
END IF`,
    metadata: {
      title: "Insert Row & Two-Phase Commit",
      language: "powerscript",
      category: "code",
      difficulty: "medium",
    },
  },
  {
    date_key: "pb-choose-case-05",
    source: "powerscript",
    text: `// Choose Case control structure evaluation
String ls_description
CHOOSE CASE li_status_code
  CASE 10, 20
    ls_description = "Priority Processing"
  CASE 30
    ls_description = "Standard Review"
  CASE 40
    ls_description = "Archived Record"
  CASE ELSE
    ls_description = "Unknown Status"
END CHOOSE`,
    metadata: {
      title: "Choose Case Control Structure",
      language: "powerscript",
      category: "code",
      difficulty: "medium",
    },
  },
  {
    date_key: "pb-for-loop-rowcount-06",
    source: "powerscript",
    text: `// Iterate DataWindow rows to compute aggregate total
Long ll_i, ll_total_count
Decimal{2} ldc_invoice_total = 0.00

ll_total_count = dw_items.RowCount()
FOR ll_i = 1 TO ll_total_count
  ldc_invoice_total += dw_items.GetItemNumber(ll_i, "item_price")
NEXT`,
    metadata: {
      title: "DataWindow Loop & Accumulator",
      language: "powerscript",
      category: "code",
      difficulty: "medium",
    },
  },
  {
    date_key: "pb-embedded-sql-07",
    source: "powerscript",
    text: `// Embedded SQL with exception and transaction rollback
Long ll_order_id = 5021
String ls_customer_name
DateTime ldt_ordered_at

TRY
  SELECT customer_name, order_date
    INTO :ls_customer_name, :ldt_ordered_at
    FROM sales_orders
   WHERE order_id = :ll_order_id
   USING SQLCA;

  IF SQLCA.SQLCode = 0 THEN
    dw_orders.SetItem(1, "cust_name", ls_customer_name)
    COMMIT USING SQLCA;
  ELSE
    ROLLBACK USING SQLCA;
    MessageBox("Query Warning", "Order not located: " + SQLCA.SQLErrText)
  END IF
CATCH (Throwable ex)
  MessageBox("Runtime Exception", ex.GetMessage())
FINALLY
  This.SetRedraw(True)
END TRY`,
    metadata: {
      title: "Embedded SQL & Exception Handler",
      language: "powerscript",
      category: "code",
      difficulty: "hard",
    },
  },
  {
    date_key: "pb-window-parm-08",
    source: "powerscript",
    text: `// Inter-window parameter passing and DataStore refresh
s_cust_param lstr_payload
lstr_payload.cust_id = dw_master.GetItemNumber(dw_master.GetRow(), "id")
lstr_payload.access_mode = "MODIFY"

OpenWithParm(w_customer_editor, lstr_payload)

IF Message.DoubleParm = 1 THEN
  dw_master.SetRedraw(False)
  dw_master.Retrieve()
  dw_master.SetRedraw(True)
END IF`,
    metadata: {
      title: "Window Communication & DataStore Sync",
      language: "powerscript",
      category: "code",
      difficulty: "hard",
    },
  },
  {
    date_key: "pb-find-row-09",
    source: "powerscript",
    text: `// Locate record in DataWindow using expression search
Long ll_found
String ls_expr
ls_expr = "department_id = 40 AND is_manager = 1"
ll_found = dw_dept.Find(ls_expr, 1, dw_dept.RowCount())

IF ll_found > 0 THEN
  dw_dept.ScrollToRow(ll_found)
  dw_dept.SelectRow(ll_found, True)
END IF`,
    metadata: {
      title: "DataWindow Find & Row Selection",
      language: "powerscript",
      category: "code",
      difficulty: "medium",
    },
  },
  {
    date_key: "pb-sort-datastore-10",
    source: "powerscript",
    text: `// Server-side DataStore sorting and buffer reset
DataStore lds_cache
lds_cache = CREATE DataStore
lds_cache.DataObject = "d_cached_inventory"
lds_cache.SetTransObject(SQLCA)
lds_cache.Retrieve()

lds_cache.SetSort("sku_code A, quantity D")
lds_cache.Sort()`,
    metadata: {
      title: "DataStore Creation & Multi-Column Sort",
      language: "powerscript",
      category: "code",
      difficulty: "medium",
    },
  },

  // ==========================================
  // JavaScript Practice Snippets
  // ==========================================
  {
    date_key: "js-debounce-01",
    source: "javascript",
    text: `// High-frequency event debounce wrapper
function debounce(fn, delayMs = 300) {
  let timerId = null;
  return function (...args) {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delayMs);
  };
}`,
    metadata: {
      title: "Function Debounce Wrapper",
      language: "javascript",
      category: "code",
      difficulty: "easy",
    },
  },
  {
    date_key: "js-promise-retry-02",
    source: "javascript",
    text: `// Async retry helper with exponential backoff
async function retryWithBackoff(task, maxRetries = 3, delay = 500) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await task();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, delay * 2 ** (attempt - 1)));
    }
  }
}`,
    metadata: {
      title: "Async Retry with Exponential Backoff",
      language: "javascript",
      category: "code",
      difficulty: "medium",
    },
  },
  {
    date_key: "js-array-pipeline-03",
    source: "javascript",
    text: `// Aggregate transaction metrics by currency
function summarizeTransactions(orders) {
  return orders.reduce((acc, { currency, amount, status }) => {
    if (status !== "settled") return acc;
    if (!acc[currency]) acc[currency] = { total: 0, count: 0 };
    acc[currency].total += amount;
    acc[currency].count += 1;
    return acc;
  }, {});
}`,
    metadata: {
      title: "Array Reduce & Order Aggregator",
      language: "javascript",
      category: "code",
      difficulty: "medium",
    },
  },
  {
    date_key: "js-lru-cache-04",
    source: "javascript",
    text: `// LRU cache implementation using Map ordering
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.store = new Map();
  }
  get(key) {
    if (!this.store.has(key)) return null;
    const value = this.store.get(key);
    this.store.delete(key);
    this.store.set(key, value);
    return value;
  }
  set(key, value) {
    if (this.store.has(key)) this.store.delete(key);
    else if (this.store.size >= this.capacity) {
      this.store.delete(this.store.keys().next().value);
    }
    this.store.set(key, value);
  }
}`,
    metadata: {
      title: "LRU Cache Data Structure",
      language: "javascript",
      category: "code",
      difficulty: "hard",
    },
  },
  {
    date_key: "js-event-emitter-05",
    source: "javascript",
    text: `// Lightweight typed event pub/sub broker
class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  on(event, listener) {
    if (!this.events.has(event)) this.events.set(event, new Set());
    this.events.get(event).add(listener);
    return () => this.events.get(event)?.delete(listener);
  }
  emit(event, ...payload) {
    this.events.get(event)?.forEach((fn) => fn(...payload));
  }
}`,
    metadata: {
      title: "Event Emitter Pub/Sub Broker",
      language: "javascript",
      category: "code",
      difficulty: "medium",
    },
  },

  // ==========================================
  // Python Practice Snippets
  // ==========================================
  {
    date_key: "py-context-manager-01",
    source: "python",
    text: `# Context manager for timed benchmark execution
import time
from contextlib import contextmanager

@contextmanager
def benchmark_timer(label: str):
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        print(f"[{label}] Execution finished in {elapsed:.4f}s")`,
    metadata: {
      title: "Context Manager Timer",
      language: "python",
      category: "code",
      difficulty: "easy",
    },
  },
  {
    date_key: "py-generator-stream-02",
    source: "python",
    text: `# Generator for streaming batched chunks of data
from typing import Iterable, List, TypeVar

T = TypeVar("T")

def chunk_stream(items: Iterable[T], chunk_size: int = 100):
    batch: List[T] = []
    for item in items:
        batch.append(item)
        if len(batch) >= chunk_size:
            yield batch
            batch = []
    if batch:
        yield batch`,
    metadata: {
      title: "Batch Generator Stream",
      language: "python",
      category: "code",
      difficulty: "medium",
    },
  },
  {
    date_key: "py-dataclass-validator-03",
    source: "python",
    text: `# Dataclass model with post-initialization invariants
from dataclasses import dataclass
from typing import Optional

@dataclass(frozen=True)
class UserProfile:
    user_id: str
    email: str
    wpm_record: int = 0
    display_name: Optional[str] = None

    def __post_init__(self):
        if "@" not in self.email:
            raise ValueError(f"Invalid email: {self.email}")
        if self.wpm_record < 0:
            raise ValueError("WPM record cannot be negative")`,
    metadata: {
      title: "Immutable Dataclass Validator",
      language: "python",
      category: "code",
      difficulty: "medium",
    },
  },
  {
    date_key: "py-binary-search-04",
    source: "python",
    text: `# Binary search algorithm with left-boundary matching
from typing import Sequence

def binary_search_leftmost(array: Sequence[int], target: int) -> int:
    left, right = 0, len(array)
    while left < right:
        mid = (left + right) // 2
        if array[mid] < target:
            left = mid + 1
        else:
            right = mid
    return left if left < len(array) and array[left] == target else -1`,
    metadata: {
      title: "Binary Search Left Boundary",
      language: "python",
      category: "code",
      difficulty: "hard",
    },
  },

  // ==========================================
  // Modern Typing Prose & Speed Passages
  // ==========================================
  {
    date_key: "prose-rhythm-flow-01",
    source: "prose",
    text: "The secret to typing at immense speeds is not moving your fingers faster, but moving them with rhythmic calm. True velocity is born from eliminating friction, looking ahead by three words, and letting muscle memory glide across keys without tension.",
    metadata: {
      title: "The Art of Rhythm",
      language: "english",
      category: "prose",
      difficulty: "easy",
    },
  },
  {
    date_key: "prose-cybernetics-02",
    source: "prose",
    text: "Mechanical switches resonate beneath quiet hands as electrical impulses transform abstract thoughts into digital reality. Every keystroke is a subtle stroke of architecture, connecting logic, human intuition, and relentless engineering.",
    metadata: {
      title: "Cybernetic Cadence",
      language: "english",
      category: "prose",
      difficulty: "medium",
    },
  },
  {
    date_key: "prose-deep-focus-03",
    source: "prose",
    text: "Deep work demands a state of flow where distractions dissolve and your attention narrows to the task at hand. By practicing with disciplined cadence, your speed accelerates naturally while error rates plummet toward zero.",
    metadata: {
      title: "Deep Flow State",
      language: "english",
      category: "prose",
      difficulty: "medium",
    },
  },
  {
    date_key: "prose-technical-mastery-04",
    source: "prose",
    text: "High-performance software systems require meticulous attention to concurrency, memory allocation, and algorithmic complexity. Elegant architectures minimize latency while guaranteeing transaction safety across distributed networks under heavy production load.",
    metadata: {
      title: "Architectural Precision",
      language: "english",
      category: "prose",
      difficulty: "hard",
    },
  },

  // ==========================================
  // Today's Official Daily Challenge
  // ==========================================
  {
    date_key: new Date().toISOString().slice(0, 10),
    source: "daily",
    text: "PowerBuilder applications leverage PowerScript for event-driven business logic, robust DataWindow manipulations, and low-latency database transactions.",
    metadata: {
      title: "Today's Official Challenge",
      language: "powerscript",
      category: "challenge",
      difficulty: "medium",
    },
  },
];

async function seed() {
  console.log("🌱 Seeding Supabase database at:", supabaseUrl);

  // 1. Seed Passages into daily_challenges
  console.log("-> Seeding sample passages and PowerScript paragraphs...");
  for (const item of SAMPLE_PASSAGES) {
    const { error } = await supabase.from("daily_challenges").upsert(item, { onConflict: "date_key" });
    if (error) {
      console.warn("  Failed to insert " + item.date_key + ":", error.message);
    } else {
      console.log("  ✓ " + item.date_key + " (" + item.metadata.title + ")");
    }
  }

  // 2. Seed Mock Leaderboard / Top Runners
  console.log("-> Seeding leaderboard snapshot...");
  const sampleTop = [
    { rank: 1, name: "Suresh PB Pro", wpm: 124, accuracy: 99.4, difficulty: "hard", mode: "code" },
    { rank: 2, name: "Elena Flow", wpm: 112, accuracy: 98.6, difficulty: "medium", mode: "normal" },
    { rank: 3, name: "Marcus Speed", wpm: 98, accuracy: 97.8, difficulty: "medium", mode: "code" },
    { rank: 4, name: "Dev_Darsh", wpm: 92, accuracy: 96.5, difficulty: "easy", mode: "normal" },
    { rank: 5, name: "CyberTypist_99", wpm: 88, accuracy: 95.0, difficulty: "medium", mode: "code" },
  ];

  await supabase.from("leaderboard_snapshots").upsert({
    date_key: "latest-global",
    entries: sampleTop,
    total_ranked_users: 5,
    source: "seed",
  }, { onConflict: "date_key" });
  console.log("  ✓ latest-global leaderboard seeded");

  console.log("✅ Seeding completed successfully!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
