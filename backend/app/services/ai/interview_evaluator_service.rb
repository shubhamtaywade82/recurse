require 'ollama_client'

class Ai::InterviewEvaluatorService
  def self.evaluate(transcript, interview_type)
    # Try using local Ollama model for rich dynamic feedback
    ollama_res = generate_ollama_evaluation(transcript, interview_type)
    return ollama_res if ollama_res.present?

    # Fallback to keyword-based evaluation
    evaluate_simulated(transcript, interview_type)
  end

  private

  def self.generate_ollama_evaluation(transcript, interview_type)
    full_transcript = transcript.map { |t| "#{t['role'] == 'interviewer' ? 'Interviewer' : 'Candidate'}: #{t['content']}" }.join("\n")

    # Define rubrics based on interview type
    rubrics = case interview_type
              when "dsa"
                {
                  score_fields: '"correctness": (integer 1-10), "complexity_analysis": (integer 1-10), "communication": (integer 1-10)',
                  description: "For DSA, evaluate if the candidate correctly implemented or explained the O(N) sliding window maximum algorithm (using a deque/monotonic queue), analyzed time and space complexities, and communicated trade-offs."
                }
              when "system_design"
                {
                  score_fields: '"requirements_clarification": (integer 1-10), "tradeoff_analysis": (integer 1-10), "observability_coverage": (integer 1-10)',
                  description: "For System Design, evaluate if the candidate clarified API Rate Limiter requirements (QPS scale), analyzed trade-offs of different rate limiting algorithms (Token Bucket vs Sliding Window Log), and discussed observability (Prometheus/OpenTelemetry metrics and telemetry)."
                }
              when "behavioral"
                {
                  score_fields: '"star_structure": (integer 1-10), "ownership_and_influence": (integer 1-10), "conflict_resolution": (integer 1-10)',
                  description: "For Behavioral, evaluate if the candidate structured their technical disagreement story around Situation, Task, Action, and Result (STAR), demonstrated ownership/influence, and handled conflict constructively."
                }
              end

    system_prompt = <<~SYSTEM
      You are an expert Senior Software Engineer Interviewer. Evaluate the candidate's answers from the mock interview transcript.
      
      You must respond ONLY with a valid JSON object matching this schema:
      {
        "score": integer (0-100),
        "rubric_scores": {
          #{rubrics[:score_fields]}
        },
        "groundedness": float (0.0 to 1.0, rating how grounded/factual the answers are),
        "relevance": float (0.0 to 1.0, rating how relevant the candidate's responses are to the questions asked),
        "feedback": {
          "summary": "Short 1-2 sentence summary of candidate performance",
          "strengths": ["strength 1", "strength 2"],
          "weaknesses": ["weakness 1", "weakness 2"],
          "recommendations": ["rec 1", "rec 2"]
        }
      }

      Do not include any other text, markdown wrapper, or explanation outside the JSON object.
    SYSTEM

    user_prompt = <<~USER
      Interview Type: #{interview_type}
      Guidelines: #{rubrics[:description]}

      Interview Transcript:
      #{full_transcript}
    USER

    config = Ollama::Config.new
    config.model = "qwen3.5:4b"
    config.timeout = 60
    config.retries = 2
    client = Ollama::Client.new(config: config)
    response = client.chat(
      messages: [
        { role: "system", content: system_prompt },
        { role: "user", content: user_prompt }
      ],
      options: {
        temperature: 0.1
      }
    )

    if response && response.respond_to?(:message) && response.message.respond_to?(:content)
      text = response.message.content.strip
      
      # Clean up potential markdown code block wraps (e.g. ```json ... ```)
      text = text.gsub(/^```json/, '').gsub(/```$/, '').strip
      
      parsed = JSON.parse(text)
      
      # Validate required keys
      required_keys = %w[score rubric_scores groundedness relevance feedback]
      if required_keys.all? { |k| parsed.key?(k) }
        feedback_data = parsed["feedback"]
        {
          score: parsed["score"].to_i,
          rubric_scores: parsed["rubric_scores"].transform_keys(&:to_sym),
          groundedness: parsed["groundedness"].to_f,
          relevance: parsed["relevance"].to_f,
          feedback: {
            summary: feedback_data["summary"],
            strengths: Array(feedback_data["strengths"]),
            weaknesses: Array(feedback_data["weaknesses"]),
            recommendations: Array(feedback_data["recommendations"])
          }
        }
      else
        Rails.logger.warn "Ollama output missing expected JSON keys. Output: #{text}"
        nil
      end
    else
      Rails.logger.warn "Ollama API evaluation returned code #{response.code}"
      nil
    end
  rescue => e
    Rails.logger.warn "Ollama evaluation failed: #{e.message}. Falling back to simulated evaluation."
    nil
  end

  def self.evaluate_simulated(transcript, interview_type)
    candidate_answers = transcript.select { |t| t["role"] == "candidate" || t["role"] == "user" }.map { |t| t["content"] }.join(" ")

    scores = {}
    strengths = []
    weaknesses = []
    recommendations = []

    case interview_type
    when "dsa"
      complexity_score = candidate_answers.include?("deque") || candidate_answers.include?("monotonic") || candidate_answers.include?("o(n)") ? 9 : 5
      correctness_score = candidate_answers.length > 50 ? 8 : 4
      comm_score = candidate_answers.include?("because") || candidate_answers.include?("trade-off") ? 9 : 6

      scores = {
        correctness: correctness_score,
        complexity_analysis: complexity_score,
        communication: comm_score
      }
      total = (correctness_score + complexity_score + comm_score) * 10 / 3

      if complexity_score >= 8
        strengths << "Correctly identified the O(N) monotonic deque approach for sliding window maximum."
      else
        weaknesses << "Did not mention monotonic deque or O(N) constraints. Solved with a sub-optimal nested loop."
        recommendations << "Practice monotonic stack/queue patterns on LeetCode (e.g. Sliding Window Maximum, Next Greater Element)."
      end

      if comm_score >= 8
        strengths << "Clearly explained why the index should be stored in the deque rather than values."
      else
        weaknesses << "Jumped directly into coding without outlining step-by-step logic."
        recommendations << "Use the first 3-5 minutes of a DSA round to clarify constraints and explain your strategy out loud."
      end

    when "system_design"
      req_score = candidate_answers.include?("qps") || candidate_answers.include?("read") || candidate_answers.include?("write") ? 9 : 5
      tradeoff_score = candidate_answers.include?("caching") || candidate_answers.include?("token bucket") || candidate_answers.include?("sliding window") ? 8 : 4
      obs_score = candidate_answers.include?("telemetry") || candidate_answers.include?("prometheus") || candidate_answers.include?("metrics") || candidate_answers.include?("log") ? 9 : 4

      scores = {
        requirements_clarification: req_score,
        tradeoff_analysis: tradeoff_score,
        observability_coverage: obs_score
      }
      total = (req_score + tradeoff_score + obs_score) * 10 / 3

      if req_score >= 8
        strengths << "Successfully performed traffic estimation (QPS and bandwidth requirements) at the start."
      else
        weaknesses << "Omitted traffic and storage constraints estimation."
        recommendations << "Always quantify scale. State assumptions about active users, write-to-read ratio, and write payloads."
      end

      if tradeoff_score >= 8
        strengths << "Provided a comparative analysis of Token Bucket vs Sliding Window Log algorithms."
      else
        weaknesses << "Did not explore alternative rate limiter implementations or trade-offs."
        recommendations << "Compare memory usage and accuracy constraints: e.g. Token Bucket (low memory, bursty) vs Sliding Window Log (high memory, accurate)."
      end

      if obs_score >= 8
        strengths << "Strong inclusion of OpenTelemetry spans, metrics dashboards, and alerting thresholds."
      else
        weaknesses << "Overlooked system observability, monitoring, and database fallback mechanisms."
        recommendations << "Treat observability as a first-class requirement. Define metrics to monitor (CPU, queue lag, error rate) and log formats."
      end

    when "behavioral"
      star_score = candidate_answers.include?("situation") || candidate_answers.include?("task") || candidate_answers.include?("action") || candidate_answers.include?("result") ? 9 : 6
      ownership_score = candidate_answers.include?("i owned") || candidate_answers.include?("metrics") || candidate_answers.include?("percent") ? 8 : 5
      conflict_score = candidate_answers.include?("disagreement") || candidate_answers.include?("collaborate") || candidate_answers.include?("listen") ? 9 : 5

      scores = {
        star_structure: star_score,
        ownership_and_influence: ownership_score,
        conflict_resolution: conflict_score
      }
      total = (star_score + ownership_score + conflict_score) * 10 / 3

      if star_score >= 8
        strengths << "Structured the response perfectly around Situation, Task, Action, and measurable Results."
      else
        weaknesses << "The story felt unstructured. Lacked details on the specific action you took."
        recommendations << "Refine stories using the STAR format. Dedicate 60% of the time to your specific ACTIONS and 20% to measurable RESULTS."
      end

      if conflict_score >= 8
        strengths << "Showed senior leadership traits: active listening, building a prototype to verify trade-offs, and leading alignment."
      else
        weaknesses << "Did not explain how you reached a consensus or how the disagreement was resolved."
        recommendations << "Focus on collaborative decision-making: explain how you gathered data, aligned on metrics, and committed to the final decision."
      end
    end

    groundedness = (candidate_answers.include?("hallucination") || candidate_answers.include?("fake") ? 0.75 : 0.98)
    relevance = (candidate_answers.length > 80 ? 0.95 : 0.60)

    {
      score: total,
      rubric_scores: scores,
      groundedness: groundedness,
      relevance: relevance,
      feedback: {
        summary: "Candidate demonstrated #{total >= 80 ? 'strong senior-level signals' : 'moderate mid-level signals'} with areas of refinement.",
        strengths: strengths,
        weaknesses: weaknesses,
        recommendations: recommendations
      }
    }
  end
end
