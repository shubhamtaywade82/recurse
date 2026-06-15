class User < ApplicationRecord
  has_secure_password

  has_one :profile, dependent: :destroy
  has_many :study_logs, dependent: :destroy
  has_many :checklist_items, dependent: :destroy
  has_many :user_problems, dependent: :destroy
  has_many :problems, through: :user_problems
  has_many :coach_sessions, dependent: :destroy
  has_many :mock_interviews, dependent: :destroy
  has_many :eval_results, dependent: :destroy

  validates :email, presence: true, uniqueness: true
  validates :plan, inclusion: { in: %w[free pro team] }

  after_create :create_default_profile
  after_create :seed_default_checklist

  def create_default_profile
    create_profile!(years_experience: 5, target_companies: ["Google", "Meta", "Netflix"], current_track: "SWE")
  end

  def seed_default_checklist
    seed_checklist_for("SWE")
  end

  def seed_checklist_for(track)
    items_data = User.roadmap_tasks_for(track)
    items_data.each do |item|
      checklist_items.find_or_create_by!(
        track: track,
        month: item[:month],
        week_label: item[:week_label],
        item_text: item[:text]
      )
    end
  end

  def self.roadmap_tasks_for(track)
    if track == "SWE"
      [
        { month: 1, week_label: "Wk 1–2", text: "Arrays & Hashing - two pointers, sliding window, prefix sums" },
        { month: 1, week_label: "Wk 1–2", text: "Stacks & Queues - monotonic stack, queue with stacks" },
        { month: 1, week_label: "Wk 3–4", text: "Trees - DFS (in/pre/post), BFS, recursive vs iterative" },
        { month: 1, week_label: "Wk 3–4", text: "Graphs - DFS, BFS, adjacency list / matrix representation" },
        { month: 2, week_label: "Wk 1–2", text: "0/1 Knapsack & Unbounded Knapsack patterns" },
        { month: 2, week_label: "Wk 1–2", text: "LCS/LIS & DP on Grids / State Machine stock patterns" },
        { month: 2, week_label: "Wk 3–4", text: "Union-Find & Topological Sort course schedule problems" },
        { month: 2, week_label: "Wk 3–4", text: "Advanced Intervals - merge, scheduling, meeting rooms II" },
        { month: 3, week_label: "Wk 1–2", text: "System Design - horizontal vs vertical, consistent hashing, caching policies" },
        { month: 3, week_label: "Wk 3–4", text: "Low-Level Design - SOLID principles, design patterns (Factory, Builder)" },
        { month: 4, week_label: "Wk 1–2", text: "HLD - News Feed, Rate Limiter, WebSockets Chat, Video HLS streaming" },
        { month: 4, week_label: "Wk 3–4", text: "LLD - Concurrency thread pools, locks, distributed Saga / Circuit Breaker" },
        { month: 5, week_label: "Wk 1–2", text: "Pressure Practice - 45m timed sessions (2 hard DSA / week)" },
        { month: 5, week_label: "Wk 3–4", text: "Mock Interviews - 6+ mocks (record, review filler words)" },
        { month: 6, week_label: "Wk 1–2", text: "Company Prep - signature designs, LP stories for Amazon/FAANG" },
        { month: 6, week_label: "Wk 3–4", text: "Behavioral - 8-10 stories in STAR format, 'Why?' drill 3 levels deep" }
      ]
    elsif track == "AI"
      [
        { month: 1, week_label: "Wk 1–2", text: "Async I/O Engineering - concurrent batching and streaming limits" },
        { month: 1, week_label: "Wk 1–2", text: "Strict Schema Decoding - JSON Schema / Pydantic at gateway edge" },
        { month: 1, week_label: "Wk 3–4", text: "MCP Standardization - JSON-RPC client-server capability negotiation" },
        { month: 1, week_label: "Wk 3–4", text: "KV Cache primacies - invariant schema top 15%, user requests bottom 15%" },
        { month: 2, week_label: "Wk 1–2", text: "Advanced RAG - BM25 lexical + dense vector, cross-encoder re-ranking" },
        { month: 2, week_label: "Wk 1–2", text: "Context Management - prompt compression, dynamic sliding windows" },
        { month: 2, week_label: "Wk 3–4", text: "Stateful Orchestration - agent workflows, self-correction context loops" },
        { month: 2, week_label: "Wk 3–4", text: "Failure modes - MoE router instability, gateway circuit breakers" },
        { month: 3, week_label: "Wk 1–2", text: "Programmatic Evals - Golden datasets (100+ edge cases), LLM-as-a-Judge" },
        { month: 3, week_label: "Wk 1–2", text: "Telemetry - OpenTelemetry tracing, span latencies, token consumption" },
        { month: 3, week_label: "Wk 3–4", text: "AI System Design - scale limits, runtime quantization (FP32 -> INT8)" },
        { month: 3, week_label: "Wk 3–4", text: "Mock Loops - live interview screens, trade-off comparisons" }
      ]
    else # HYBRID
      [
        { month: 1, week_label: "M1", text: "60+ DSA problems + async I/O and schema validation basics" },
        { month: 2, week_label: "M2", text: "30+ DP problems + advanced graphs + RAG / MCP tool isolation" },
        { month: 3, week_label: "M3", text: "URL shortener + Parking Lot + LLM eval gate framework" },
        { month: 4, week_label: "M4", text: "4 major systems + thread-safe LRU Cache + AI workflow engine" },
        { month: 5, week_label: "M5", text: "6+ mock interviews + hard DSA in 30 min + RAG eval platform" },
        { month: 6, week_label: "M6", text: "10 STAR behavioral stories + 2 signature system designs fluent" }
      ]
    end
  end
end
