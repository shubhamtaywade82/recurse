class Api::V1::PracticePlansController < ApplicationController
  def show
    # Retrieve user's profile and construct a default or previously generated plan
    profile = current_user.profile || current_user.create_profile!
    plan = generate_plan_structure(
      track: profile.current_track,
      experience: profile.years_experience,
      companies: profile.target_companies
    )
    render json: {
      profile: profile,
      plan: plan
    }
  end

  def generate
    profile = current_user.profile || current_user.create_profile!
    track = params[:track] || profile.current_track
    experience = params[:years_experience]&.to_i || profile.years_experience
    companies = params[:target_companies] || profile.target_companies
    weekly_hours = params[:weekly_hours]&.to_i || 20

    profile.update!(
      current_track: track,
      years_experience: experience,
      target_companies: companies
    )

    plan = generate_plan_structure(
      track: track,
      experience: experience,
      companies: companies,
      weekly_hours: weekly_hours
    )

    # Automatically bulk re-initialize checklist items for this track
    checklist_controller = Api::V1::ChecklistItemsController.new
    checklist_controller.instance_variable_set(:@current_user, current_user)
    checklist_controller.send(:initialize_checklist_for, track)

    render json: {
      message: "Adaptive practice plan generated successfully for #{track} track.",
      plan: plan,
      profile: profile
    }
  end

  private

  def generate_plan_structure(track:, experience:, companies:, weekly_hours: 20)
    # Adjust weights based on years of experience
    # If candidate is highly senior (> 8 years), increase HLD and LLD weights
    dsa_weight = experience > 8 ? 25 : 45
    hld_weight = experience > 8 ? 45 : 30
    lld_weight = 100 - dsa_weight - hld_weight - 10 # remaining for mocks

    # Build weekly schedule adjustments
    weeks = []
    
    if track == "SWE"
      weeks = [
        { week: 1, topic: "Baseline DSA Audit", duration: "Wk 1-2", details: "Review Two Pointers, Sliding Window, and Binary Search templates. Target: 15 Mediums.", hours: { dsa: dsa_weight, hld: hld_weight, lld: lld_weight } },
        { week: 2, topic: "Trees & Graphs Foundations", duration: "Wk 3-4", details: "DFS/BFS traversals, Dijkstra, Topological Sort. Target: Implement Trie from scratch.", hours: { dsa: dsa_weight, hld: hld_weight, lld: lld_weight } },
        { week: 3, topic: "Dynamic Programming (The Filter)", duration: "Wk 5-6", details: "0/1 Knapsack, Grid DP, Stock State Machines. Write recurrence relations on paper.", hours: { dsa: dsa_weight + 10, hld: hld_weight - 5, lld: lld_weight - 5 } },
        { week: 4, topic: "System Design & Scaling", duration: "Wk 7-8", details: "DB Indexing, Consistent Hashing, Message Queues (Kafka). Draw URL Shortener architecture.", hours: { dsa: dsa_weight - 10, hld: hld_weight + 15, lld: lld_weight - 5 } },
        { week: 5, topic: "Advanced LLD & Concurrency", duration: "Wk 9-10", details: "SOLID violations, Design Patterns (Strategy, Builder). Write thread-safe LRU cache.", hours: { dsa: dsa_weight - 15, hld: hld_weight + 5, lld: lld_weight + 10 } },
        { week: 6, topic: "STAR Leadership Stories", duration: "Wk 11-12", details: "Write 8 stories focusing on cross-team disagreement, technical debt payoff, and post-mortems.", hours: { dsa: 15, hld: 20, lld: 15, behavioral: 50 } }
      ]
    elsif track == "AI"
      weeks = [
        { week: 1, topic: "Strict Schema Gates & Async I/O", duration: "Wk 1-2", details: "Pydantic parsing, concurrency batching, temperature=0.0 discipline. Build API schema validator.", hours: { dsa: 10, hld: 40, lld: 30, ai: 20 } },
        { week: 2, topic: "Model Context Protocol (MCP)", duration: "Wk 3-4", details: "Build isolated tool servers communicating over standard transport. Understand client capabilities.", hours: { dsa: 10, hld: 30, lld: 40, ai: 20 } },
        { week: 3, topic: "Stateful Agents & Self-Correction", duration: "Wk 5-6", details: "Implement error context propagation inside ReAct loops to handle tool-call failures automatically.", hours: { dsa: 10, hld: 40, lld: 30, ai: 20 } },
        { week: 4, topic: "Hybrid RAG & Context Compression", duration: "Wk 7-8", details: "Dense vector + BM25 keyword matching, cross-encoder re-ranking. Implement sliding attention window.", hours: { dsa: 10, hld: 50, lld: 20, ai: 20 } },
        { week: 5, topic: "Automated Evaluation & Golden Evals", duration: "Wk 9-10", details: "Golden test cases (100+ edge cases). Run LLM-as-a-Judge for groundedness and context drift.", hours: { dsa: 10, hld: 30, lld: 30, ai: 30 } },
        { week: 6, topic: "OpenTelemetry Traces & Logs", duration: "Wk 11-12", details: "Instrument trace spans across model endpoints. Audit latencies, tool params, and token cost dashboards.", hours: { dsa: 10, hld: 20, lld: 20, ai: 50 } }
      ]
    else # HYBRID
      weeks = [
        { week: 1, topic: "SWE Baseline + Async Gates", duration: "Month 1", details: "Solve 60+ DSA problems + build schema validation gateway.", hours: { dsa: 40, hld: 25, lld: 20, ai: 15 } },
        { week: 2, topic: "Advanced Graphs + RAG", duration: "Month 2", details: "Topological Sort, Dijkstra + Hybrid lexical-vector RAG search.", hours: { dsa: 35, hld: 30, lld: 15, ai: 20 } },
        { week: 3, topic: "SOLID Design + Agent States", duration: "Month 3", details: "Code Parking Lot in OOP + build state-machine agent executor.", hours: { dsa: 25, hld: 30, lld: 25, ai: 20 } },
        { week: 4, topic: "Scale Design + Workflow Engine", duration: "Month 4", details: "Design Rate Limiter, Chat + complete AI workflow engine project.", hours: { dsa: 15, hld: 40, lld: 25, ai: 20 } },
        { week: 5, topic: "Mock Interviews + Evals", duration: "Month 5", details: "6+ mock interviews + setup LLM-as-a-Judge regression tests.", hours: { dsa: 20, hld: 30, lld: 20, ai: 30 } },
        { week: 6, topic: "Behavioral + Signature Prep", duration: "Month 6", details: "STAR leadership template + 2 signature system designs fluent.", hours: { dsa: 15, hld: 35, lld: 10, ai: 40 } }
      ]
    end

    # Apply company-specific tuning notes
    company_notes = if companies.include?("Google")
      "Google tuning: Heavy emphasis on complex algorithmic graphs and strict scaling calculations."
    elsif companies.include?("Meta")
      "Meta tuning: Priority on product design, trade-offs at 1B+ user scale, and fast-paced communication."
    elsif companies.include?("Amazon")
      "Amazon tuning: Core priority on Leadership Principles (LP) and customer obsession stories."
    else
      "Custom tuning: Balanced coverage of DSA logic, scaling systems, and clean OOP architecture."
    end

    {
      weeks: weeks,
      weekly_hours: weekly_hours,
      company_notes: company_notes,
      dsa_ratio: dsa_weight,
      system_design_ratio: hld_weight,
      lld_ratio: lld_weight
    }
  end
end
