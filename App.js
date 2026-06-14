import { useState } from "react";

const TRACKS = {
  SWE: "6-Month SWE",
  AI: "3-Month AI Engineer",
  HYBRID: "6-Month Hybrid",
};

const SWE_MONTHS = [
  {
    month: 1,
    title: "Foundation & Assessment",
    color: "#6366f1",
    weeks: [
      {
        label: "Wk 1–2",
        focus: "Baseline DSA Audit",
        items: [
          "Arrays & Hashing — two pointers, sliding window, prefix sums",
          "Linked Lists — fast/slow pointer, reversal, merge",
          "Stacks & Queues — monotonic stack, queue with stacks",
          "Binary Search — left-biased, right-biased, find-boundary templates",
        ],
        checkpoint: "Solve 80% of NeetCode Arrays & Hashing without hints. Mediums in 25–35 min.",
        time: { dsa: 70, sd: 10, lld: 10, mock: 10 },
      },
      {
        label: "Wk 3–4",
        focus: "Trees & Graphs Foundation",
        items: [
          "Trees — DFS (in/pre/post), BFS, recursive vs iterative",
          "Graphs — DFS, BFS, adjacency list / matrix",
          "Heaps — min/max heap, heapify, top-k patterns",
        ],
        checkpoint: "Build a Trie from scratch. Implement Dijkstra without reference.",
        time: { dsa: 70, sd: 10, lld: 10, mock: 10 },
      },
    ],
    milestone: "60+ problems solved. Comfortable with binary search and tree traversals.",
  },
  {
    month: 2,
    title: "DSA Patterns & Advanced Structures",
    color: "#8b5cf6",
    weeks: [
      {
        label: "Wk 1–2",
        focus: "Dynamic Programming — The Senior Filter",
        items: [
          "0/1 Knapsack — subset sum, partition equal subset",
          "Unbounded Knapsack — coin change, word break",
          "LCS/LIS — longest common subsequence / increasing subsequence",
          "DP on Grids — unique paths, min path sum, dungeon game",
          "DP on Trees — house robber III, binary tree max path",
          "State Machine — buy/sell stock all variants",
        ],
        checkpoint: "30 DP problems across all patterns. Recognize pattern within 2 min.",
        time: { dsa: 70, sd: 15, lld: 10, mock: 5 },
      },
      {
        label: "Wk 3–4",
        focus: "Advanced Graphs & Intervals",
        items: [
          "Union-Find — connected components, redundant connection, Kruskal's MST",
          "Topological Sort — course schedule, alien dictionary",
          "Advanced Intervals — merge, interval scheduling, meeting rooms II",
          "Segment / Fenwick Tree — range queries (conceptual + code for FAANG)",
        ],
        checkpoint: "Solve Alien Dictionary. Design a calendar booking system (LC 729/731).",
        time: { dsa: 70, sd: 15, lld: 10, mock: 5 },
      },
    ],
    milestone: "30+ DP problems, recognize pattern < 2 min, 2–3 hard graph problems solved.",
  },
  {
    month: 3,
    title: "System Design Introduction + LLD Basics",
    color: "#0ea5e9",
    weeks: [
      {
        label: "Wk 1–2",
        focus: "System Design Fundamentals",
        items: [
          "Scaling — horizontal vs vertical, when to use which",
          "Load Balancing — round-robin, least connections, consistent hashing",
          "Caching — cache-aside, write-through, write-behind, eviction policies",
          "Databases — SQL vs NoSQL, indexing, sharding, replication, CAP theorem",
          "CDNs & DNS — geo-routing, edge caching",
          "Message Queues — Kafka, RabbitMQ, SQS",
        ],
        checkpoint: "Design URL shortener end-to-end. Identify every single point of failure.",
        time: { dsa: 40, sd: 35, lld: 20, mock: 5 },
      },
      {
        label: "Wk 3–4",
        focus: "Low-Level Design (LLD) Foundations",
        items: [
          "SOLID Principles — explain each with a real-world violation example",
          "Design Patterns — Factory, Builder, Singleton, Adapter, Strategy, Observer",
          "UML — class diagrams, sequence diagrams (draw.io / PlantUML)",
          "OOP in Practice — parking lot, elevator, vending machine",
        ],
        checkpoint: "Write Parking Lot system in code. Justify every inheritance vs composition call.",
        time: { dsa: 40, sd: 35, lld: 20, mock: 5 },
      },
    ],
    milestone: "Designed URL shortener + Pastebin with full justification. Built Parking Lot in code.",
  },
  {
    month: 4,
    title: "Deep System Design + Advanced LLD",
    color: "#14b8a6",
    weeks: [
      {
        label: "Wk 1–2",
        focus: "High-Level Design — 4 Core Systems",
        items: [
          "News Feed (Twitter/Facebook)",
          "Rate Limiter — token bucket, sliding window log",
          "Chat System (WhatsApp/Slack) — WebSockets, presence, read receipts",
          "Video Streaming (YouTube) — DASH/HLS, CDN, adaptive bitrate",
        ],
        checkpoint: "Each design: traffic estimation, DB schema + justification, failure modes, observability.",
        time: { dsa: 20, sd: 50, lld: 25, mock: 5 },
      },
      {
        label: "Wk 3–4",
        focus: "Advanced LLD & Concurrency",
        items: [
          "Concurrency — thread pools, locks, semaphores, deadlock prevention",
          "Distributed Patterns — circuit breaker, bulkhead, saga pattern",
          "Refactoring — take a god class; refactor using SOLID",
          "API Design — REST vs gRPC vs GraphQL, idempotency, pagination",
        ],
        checkpoint: "Implement thread-safe LRU Cache with TTL. Extend to distributed (Redis-like).",
        time: { dsa: 20, sd: 50, lld: 25, mock: 5 },
      },
    ],
    milestone: "4 major systems designed. Thread-safe LRU Cache with TTL implemented.",
  },
  {
    month: 5,
    title: "Integration & Mock Interviews",
    color: "#f59e0b",
    weeks: [
      {
        label: "Wk 1–2",
        focus: "Problem Solving Under Pressure",
        items: [
          "Day 1: Hard DSA + 'How would you scale to 1B users?'",
          "Day 2: HLD — design a new system from scratch",
          "Day 3: LLD — code a design-pattern-heavy system",
          "Day 4: Debug a broken distributed system scenario",
          "Day 5: Review + deep dive on one weak topic",
        ],
        checkpoint: "2 hard graph/DP/tree problems per week with clean optimal solutions.",
        time: { dsa: 25, sd: 35, lld: 20, mock: 20 },
      },
      {
        label: "Wk 3–4",
        focus: "Mock Interviews",
        items: [
          "6+ mocks this month (Pramp / Interviewing.io / peers)",
          "After each: 3 things done well + 3 to fix",
          "Record yourself — catch filler words and unclear explanations",
          "Pitfalls to fix: jumping to solution without clarifying, ignoring NFRs, over-engineering",
        ],
        checkpoint: "6 mocks completed. Solve hard DSA in 30 min. Draw HLD in 15 min.",
        time: { dsa: 25, sd: 35, lld: 20, mock: 20 },
      },
    ],
    milestone: "6+ mocks done. Can solve hard DSA in 30 min, draw HLD in 15 min.",
  },
  {
    month: 6,
    title: "Polish & Company-Specific Prep",
    color: "#ef4444",
    weeks: [
      {
        label: "Wk 1–2",
        focus: "Company-Specific Tuning",
        items: [
          "Google — graphs, DP, scale problems, Googliness",
          "Meta — system design heavy, product sense, move-fast mentality",
          "Amazon — LP stories, Leadership Principles, bar-raiser focus",
          "Netflix — distributed systems, chaos engineering, high availability",
          "Startups — breadth, multiple hats, pragmatism",
        ],
        checkpoint: "Prepare 2 'signature designs' you can draw fluently in 15 min.",
        time: { dsa: 20, sd: 30, lld: 10, mock: 40 },
      },
      {
        label: "Wk 3–4",
        focus: "Behavioral & Leadership",
        items: [
          "Leading without authority",
          "Resolving a technical disagreement",
          "Handling a production incident",
          "Mentoring/coaching a junior",
          "Trade-off that hurt metrics short-term",
          "Dealing with ambiguous requirements",
          "Refactoring / technical debt payoff",
          "Cross-team collaboration failure → success",
        ],
        checkpoint: "8–10 STAR stories polished. Apply the 'Why?' drill 3 levels deep on every design decision.",
        time: { dsa: 20, sd: 30, lld: 10, mock: 40 },
      },
    ],
    milestone: "8–10 behavioral stories polished. Company-specific prep done. 2 signature designs fluent.",
  },
];

const AI_PHASES = [
  {
    phase: 1,
    weeks: "1–4",
    title: "Structured Execution & Model Context Layers",
    color: "#6366f1",
    focus: "Inputs, Outputs, and Protocol Design",
    items: [
      "Async I/O Engineering — concurrent batching, streaming, strict latency limits",
      "Strict Schema Decoding — JSON Schema / Pydantic, validate at gateway edge",
      "MCP Standardization — JSON-RPC tool-calling, decouple from library adapters",
      "Inference Basics — tokenizer → embedding → transformer → output head → sampler",
      "Deterministic Config — temperature=0.0 for schema-bound code integrations",
      "KV Cache Optimization — invariants in top 15%, user requests in last 15%",
    ],
    deliverable: "Small API: accepts user request → model → enforces typed schema → validates before mutation.",
    checkpoint: "Explain why schema validation happens before side effects. No hand-waving.",
  },
  {
    phase: 2,
    weeks: "5–8",
    title: "High-Fidelity Context Routing & Multi-Agent State Machines",
    color: "#0ea5e9",
    focus: "Vector Mechanics and Stateful Workflows",
    items: [
      "Advanced RAG — BM25 + dense hybrid retrieval, cross-encoder re-ranking",
      "Context Management — prompt compression, dynamic sliding windows",
      "Stateful Orchestration — agent graph flows, explicit validation gates before mutations",
      "MCP Architecture — isolated containerized MCP servers, LLM as decoupled client",
      "ReAct Loops — structured reason + act alternation with bounded steps",
      "Failure Modes — circuit breakers, MoE router instability, load fallback",
    ],
    deliverable: "Working RAG pipeline with hybrid retrieval, reranking, and MCP tool isolation.",
    checkpoint: "Agent executor: max_steps, self-correction via error injection into context, tool isolation.",
  },
  {
    phase: 3,
    weeks: "9–12",
    title: "Automated Evaluation, Observability & Live Design Drills",
    color: "#14b8a6",
    focus: "LLMOps and System Architecture Screening",
    items: [
      "Golden Datasets — 100–500 validated edge cases, version-controlled",
      "LLM-as-Judge — automated eval: groundedness ≥ 0.90, context adherence ≥ 0.95",
      "Telemetry Tracing — OpenTelemetry / Langfuse / Arize: spans, latencies, token cost",
      "System Design Drills — compliance agent, document ingestion, recommendation pipeline",
      "Trade-off Articulation — small fine-tuned model vs large API for each sub-task",
      "Interview Structure — clarify → metrics → constraints → arch → guardrails → evals → cost → failures",
    ],
    deliverable: "Project 1: AI workflow engine (MCP + schema + state machine + audit). Project 2: RAG + eval platform.",
    checkpoint: "Every prompt change can be regression-tested. Every component has a trace span.",
  },
];

const HYBRID_DATA = [
  { month: "M1", dsa: 65, sd: 15, lld: 10, ai: 10 },
  { month: "M2", dsa: 55, sd: 20, lld: 10, ai: 15 },
  { month: "M3", dsa: 30, sd: 30, lld: 15, ai: 25 },
  { month: "M4", dsa: 15, sd: 35, lld: 20, ai: 30 },
  { month: "M5", dsa: 15, sd: 25, lld: 15, ai: 25 },
  { month: "M6", dsa: 10, sd: 20, lld: 10, ai: 30 },
];

const RED_FLAGS = [
  { icon: "⚠", flag: "Skipping trade-offs", detail: "Seniors must justify every choice with alternatives considered." },
  { icon: "📊", flag: "No observability", detail: "Missing monitoring/logging in system design = automatic fail." },
  { icon: "🔁", flag: "Over-optimizing DSA", detail: "Don't spend 4 hours on one hard problem — learn the pattern, move on." },
  { icon: "✏️", flag: "LLD without code", detail: "You must write runnable code for LLD rounds, not just diagrams." },
  { icon: "💬", flag: "Vague behavioral answers", detail: "'I worked hard' is not a story. Show conflict, action, measurable result." },
  { icon: "🤖", flag: "Prompt-only AI solutions", detail: "Production AI needs schemas, guardrails, evals, and rollback — not vibes." },
];

const RESOURCES = [
  { cat: "DSA", items: ["NeetCode 150", "LeetCode Top Interview / Hard tagged", "Cracking the Coding Interview (reference)"] },
  { cat: "System Design", items: ["Designing Data-Intensive Applications (DDIA) — Kleppmann", "System Design Primer (GitHub: donnemartin)", "ByteByteGo newsletter / YouTube"] },
  { cat: "LLD", items: ["Head First Design Patterns", "Refactoring.Guru", "Clean Code / Clean Architecture — Martin"] },
  { cat: "AI Engineering", items: ["OpenAI structured outputs docs", "MCP spec (JSON-RPC 2.0)", "Langfuse / Arize Phoenix docs", "OpenTelemetry tracing guide"] },
  { cat: "Mocks", items: ["Pramp (free, good for practice)", "Interviewing.io (anonymous, senior focus)", "Record yourself — catch filler words"] },
];

function TimeBar({ time }) {
  const colors = { dsa: "#6366f1", sd: "#0ea5e9", lld: "#14b8a6", mock: "#f59e0b" };
  const labels = { dsa: "DSA", sd: "Sys Design", lld: "LLD", mock: "Mock/Review" };
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", height: 14, background: "#1e1e2e" }}>
        {Object.entries(time).map(([k, v]) => (
          <div key={k} style={{ width: `${v}%`, background: colors[k], transition: "width 0.4s" }} title={`${labels[k]}: ${v}%`} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 5, flexWrap: "wrap" }}>
        {Object.entries(time).map(([k, v]) => (
          <span key={k} style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: colors[k] }} />
            {labels[k]} {v}%
          </span>
        ))}
      </div>
    </div>
  );
}

function WeekCard({ week }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#13131f", border: "1px solid #2a2a3e", borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
          color: "#e2e8f0",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 14 }}>{week.label} — {week.focus}</span>
        <span style={{ color: "#6366f1", fontSize: 16, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
      </button>
      {open && (
        <div style={{ padding: "0 16px 14px" }}>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {week.items.map((item, i) => (
              <li key={i} style={{ color: "#94a3b8", fontSize: 13, padding: "4px 0", borderBottom: "1px solid #1e1e2e", display: "flex", gap: 8 }}>
                <span style={{ color: "#6366f1", flexShrink: 0 }}>›</span>{item}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 10, background: "#0f172a", borderRadius: 6, padding: "8px 12px" }}>
            <span style={{ color: "#f59e0b", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>CHECKPOINT  </span>
            <span style={{ color: "#cbd5e1", fontSize: 12 }}>{week.checkpoint}</span>
          </div>
          {week.time && <TimeBar time={week.time} />}
        </div>
      )}
    </div>
  );
}

function MonthCard({ data, idx }) {
  const [open, setOpen] = useState(idx === 0);
  return (
    <div style={{ marginBottom: 18, border: `1px solid ${data.color}33`, borderRadius: 12, overflow: "hidden" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", background: `${data.color}18`, border: "none", cursor: "pointer",
          padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: data.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 15, flexShrink: 0,
          }}>
            M{data.month}
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15 }}>{data.title}</div>
          </div>
        </div>
        <span style={{ color: data.color, fontSize: 16, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
      </button>
      {open && (
        <div style={{ padding: 16, background: "#0f0f1a" }}>
          {data.weeks.map((w, i) => <WeekCard key={i} week={w} />)}
          <div style={{ background: `${data.color}15`, borderLeft: `3px solid ${data.color}`, borderRadius: 6, padding: "10px 14px", marginTop: 10 }}>
            <span style={{ color: data.color, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>MILESTONE  </span>
            <span style={{ color: "#e2e8f0", fontSize: 13 }}>{data.milestone}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function PhaseCard({ data }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 18, border: `1px solid ${data.color}33`, borderRadius: 12, overflow: "hidden" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", background: `${data.color}18`, border: "none", cursor: "pointer",
          padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: data.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 12, flexShrink: 0, textAlign: "center", lineHeight: 1.2,
          }}>
            P{data.phase}
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ color: "#94a3b8", fontSize: 11, letterSpacing: 1 }}>WEEKS {data.weeks} · {data.focus}</div>
            <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14 }}>{data.title}</div>
          </div>
        </div>
        <span style={{ color: data.color, fontSize: 16, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
      </button>
      {open && (
        <div style={{ padding: 16, background: "#0f0f1a" }}>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {data.items.map((item, i) => (
              <li key={i} style={{ color: "#94a3b8", fontSize: 13, padding: "5px 0", borderBottom: "1px solid #1e1e2e", display: "flex", gap: 8 }}>
                <span style={{ color: data.color, flexShrink: 0 }}>›</span>{item}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ background: "#0f172a", borderRadius: 6, padding: "8px 12px" }}>
              <span style={{ color: "#6366f1", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>BUILD  </span>
              <span style={{ color: "#cbd5e1", fontSize: 12 }}>{data.deliverable}</span>
            </div>
            <div style={{ background: "#0f172a", borderRadius: 6, padding: "8px 12px" }}>
              <span style={{ color: "#f59e0b", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>PASS WHEN  </span>
              <span style={{ color: "#cbd5e1", fontSize: 12 }}>{data.checkpoint}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniBar({ val, color, total = 100 }) {
  return (
    <div style={{ flex: 1, background: "#1e1e2e", borderRadius: 4, height: 8, overflow: "hidden" }}>
      <div style={{ width: `${(val / total) * 100}%`, height: "100%", background: color, borderRadius: 4 }} />
    </div>
  );
}

function HybridTab() {
  const colors = { dsa: "#6366f1", sd: "#0ea5e9", lld: "#14b8a6", ai: "#f59e0b" };
  const labels = { dsa: "DSA", sd: "Sys Design", lld: "LLD", ai: "AI Eng" };
  return (
    <div>
      <div style={{ background: "#13131f", borderRadius: 12, padding: 20, marginBottom: 18 }}>
        <div style={{ color: "#94a3b8", fontSize: 12, letterSpacing: 1, marginBottom: 6 }}>RECOMMENDED FOR</div>
        <div style={{ color: "#e2e8f0", fontSize: 14 }}>Senior engineers transitioning into AI-native roles. Covers all SWE fundamentals + production AI engineering patterns over 6 months.</div>
      </div>
      <div style={{ background: "#13131f", borderRadius: 12, padding: 20, marginBottom: 18 }}>
        <div style={{ color: "#94a3b8", fontSize: 11, letterSpacing: 1, marginBottom: 14 }}>MONTHLY TIME SPLIT</div>
        {HYBRID_DATA.map((row) => (
          <div key={row.month} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13 }}>{row.month}</span>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {Object.entries(colors).map(([k, c]) => (
                <div key={k} style={{ display: "flex", flexDirection: "column", flex: 1, gap: 3 }}>
                  <span style={{ color: "#64748b", fontSize: 10 }}>{labels[k]}</span>
                  <MiniBar val={row[k]} color={c} />
                  <span style={{ color: c, fontSize: 11, fontWeight: 600 }}>{row[k]}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: "#13131f", borderRadius: 12, padding: 20 }}>
        <div style={{ color: "#94a3b8", fontSize: 11, letterSpacing: 1, marginBottom: 12 }}>6-MONTH MILESTONES</div>
        {[
          { m: "M1", text: "60+ DSA problems · binary search + trees · async I/O + schema validation basics" },
          { m: "M2", text: "30+ DP problems · advanced graphs · RAG pipeline + MCP tool isolation" },
          { m: "M3", text: "URL shortener + Parking Lot designed & coded · LLM eval gate built" },
          { m: "M4", text: "4 major systems designed · LRU cache · AI workflow engine project complete" },
          { m: "M5", text: "6+ mocks done · hard DSA in 30 min · HLD in 15 min · RAG+eval project complete" },
          { m: "M6", text: "10 behavioral stories · 2 signature designs · company-specific prep done" },
        ].map(({ m, text }) => (
          <div key={m} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid #1e1e2e" }}>
            <span style={{ color: "#6366f1", fontWeight: 700, fontSize: 13, flexShrink: 0, width: 28 }}>{m}</span>
            <span style={{ color: "#94a3b8", fontSize: 13 }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChecklistTab() {
  const items = [
    { phase: "M1", text: "60+ problems solved. Binary search and tree traversals feel automatic." },
    { phase: "M2", text: "30+ DP problems. Recognize pattern within 2 min. 2–3 hard graph problems solved." },
    { phase: "M3", text: "URL shortener + Pastebin designed with full justification. Parking Lot coded." },
    { phase: "M4", text: "4 systems designed (feed, chat, rate limiter, video). Thread-safe LRU Cache with TTL." },
    { phase: "M5", text: "6+ mocks done. Hard DSA in 30 min. HLD drawn in 15 min." },
    { phase: "AI1", text: "Schema-enforced API built. MCP server + client working. temperature=0.0 discipline." },
    { phase: "AI2", text: "Hybrid RAG pipeline with reranking. Stateful agent executor with self-correction." },
    { phase: "AI3", text: "Golden eval dataset. Automated LLM-as-Judge. OpenTelemetry trace on every span." },
    { phase: "M6", text: "8–10 behavioral STAR stories polished. 2 signature designs fluent." },
    { phase: "M6", text: "120+ DSA problems total. 4–6 full system designs practiced. 10+ mocks done." },
  ];
  const [checked, setChecked] = useState({});
  const toggle = (i) => setChecked((c) => ({ ...c, [i]: !c[i] }));
  const done = Object.values(checked).filter(Boolean).length;
  return (
    <div>
      <div style={{ background: "#13131f", borderRadius: 10, padding: 16, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>Progress</span>
        <span style={{ color: "#6366f1", fontSize: 20, fontWeight: 800 }}>{done}/{items.length}</span>
      </div>
      <div style={{ background: "#13131f", borderRadius: 6, overflow: "hidden", height: 10, marginBottom: 20 }}>
        <div style={{ width: `${(done / items.length) * 100}%`, height: "100%", background: "linear-gradient(90deg, #6366f1, #14b8a6)", transition: "width 0.4s" }} />
      </div>
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => toggle(i)}
          style={{
            width: "100%", background: checked[i] ? "#13131f" : "#0f0f1a",
            border: `1px solid ${checked[i] ? "#6366f133" : "#2a2a3e"}`,
            borderRadius: 8, padding: "12px 14px", cursor: "pointer",
            display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 8, textAlign: "left",
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: 5, border: `2px solid ${checked[i] ? "#6366f1" : "#3a3a5c"}`,
            background: checked[i] ? "#6366f1" : "transparent", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700,
          }}>
            {checked[i] ? "✓" : ""}
          </div>
          <div>
            <div style={{ color: "#6366f1", fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 2 }}>{item.phase}</div>
            <div style={{ color: checked[i] ? "#64748b" : "#cbd5e1", fontSize: 13, textDecoration: checked[i] ? "line-through" : "none" }}>{item.text}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [track, setTrack] = useState("SWE");
  const [activeTab, setActiveTab] = useState("roadmap");

  const tabs = [
    { id: "roadmap", label: "Roadmap" },
    { id: "checklist", label: "Checklist" },
    { id: "flags", label: "Red Flags" },
    { id: "resources", label: "Resources" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#080810", fontFamily: "'Inter', system-ui, sans-serif",
      color: "#e2e8f0", maxWidth: 760, margin: "0 auto", padding: "0 0 60px",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0f0f1e 0%, #13131f 100%)",
        borderBottom: "1px solid #1e1e2e", padding: "24px 20px 16px",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ color: "#6366f1", fontSize: 10, letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>INTERVIEW PREP ROADMAP</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", marginBottom: 14 }}>Senior Engineer — Complete Path</div>

        {/* Track Selector */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {Object.entries(TRACKS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setTrack(key); setActiveTab("roadmap"); }}
              style={{
                padding: "6px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                background: track === key ? "#6366f1" : "#1e1e2e",
                color: track === key ? "#fff" : "#64748b",
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab Selector */}
        <div style={{ display: "flex", gap: 4 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12,
                background: activeTab === t.id ? "#1e1e2e" : "transparent",
                color: activeTab === t.id ? "#e2e8f0" : "#64748b",
                fontWeight: activeTab === t.id ? 600 : 400,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "18px 16px" }}>
        {activeTab === "roadmap" && track === "SWE" && (
          <div>
            <div style={{ color: "#64748b", fontSize: 12, marginBottom: 16 }}>
              DSA is the filter. System Design and trade-off depth are the differentiators. Communication &gt; perfection.
            </div>
            {SWE_MONTHS.map((m, i) => <MonthCard key={i} data={m} idx={i} />)}
          </div>
        )}

        {activeTab === "roadmap" && track === "AI" && (
          <div>
            <div style={{ color: "#64748b", fontSize: 12, marginBottom: 16 }}>
              Your 5 years of systems experience is 80% of the battle. Focus on the execution layer, not ML math.
            </div>
            {AI_PHASES.map((p, i) => <PhaseCard key={i} data={p} />)}
          </div>
        )}

        {activeTab === "roadmap" && track === "HYBRID" && <HybridTab />}

        {activeTab === "checklist" && <ChecklistTab />}

        {activeTab === "flags" && (
          <div>
            <div style={{ color: "#64748b", fontSize: 12, marginBottom: 16 }}>
              Avoid these in every round. Seniors are assessed on judgment and communication, not just solutions.
            </div>
            {RED_FLAGS.map((f, i) => (
              <div key={i} style={{ background: "#13131f", borderRadius: 10, padding: "14px 16px", marginBottom: 10, borderLeft: "3px solid #ef4444" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20 }}>{f.icon}</span>
                  <div>
                    <div style={{ color: "#ef4444", fontWeight: 700, fontSize: 14 }}>{f.flag}</div>
                    <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>{f.detail}</div>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ background: "#0f172a", borderRadius: 10, padding: 16, marginTop: 8, border: "1px solid #6366f133" }}>
              <div style={{ color: "#6366f1", fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>FINAL PRINCIPLE</div>
              <div style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.6 }}>
                A good design explained clearly beats a perfect design explained poorly. Practice talking while thinking. At the senior level, <strong style={{ color: "#e2e8f0" }}>communication &gt; perfection</strong>.
              </div>
            </div>
          </div>
        )}

        {activeTab === "resources" && (
          <div>
            {RESOURCES.map((r, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ color: "#6366f1", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>{r.cat}</div>
                <div style={{ background: "#13131f", borderRadius: 10, overflow: "hidden" }}>
                  {r.items.map((item, j) => (
                    <div key={j} style={{
                      padding: "10px 14px", borderBottom: j < r.items.length - 1 ? "1px solid #1e1e2e" : "none",
                      color: "#94a3b8", fontSize: 13, display: "flex", gap: 8,
                    }}>
                      <span style={{ color: "#6366f1" }}>›</span>{item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ background: "#13131f", borderRadius: 10, padding: 16, marginTop: 8 }}>
              <div style={{ color: "#f59e0b", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>WEEKLY TIME TARGET</div>
              <div style={{ display: "flex", gap: 12 }}>
                {[["Weekdays", "2.5–3 hrs/day"], ["Weekends", "5–6 hrs/day"], ["Total", "18–24 hrs/wk"]].map(([k, v]) => (
                  <div key={k} style={{ flex: 1, background: "#0f0f1a", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ color: "#64748b", fontSize: 11, marginBottom: 4 }}>{k}</div>
                    <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}