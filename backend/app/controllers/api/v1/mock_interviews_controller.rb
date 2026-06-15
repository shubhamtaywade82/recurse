class Api::V1::MockInterviewsController < ApplicationController
  QUESTIONS = {
    "dsa" => {
      q1: "Hello! Welcome to your DSA round. Today, I'd like you to design a sliding window maximum algorithm. You are given an array of integers `nums` and a window size `k`. We want to return the maximum element in each window. Can you explain your approach and how we can achieve O(N) time complexity?",
      q2: "Thanks for that. How would you handle a memory constraint or a stream of data where k is extremely large?"
    },
    "system_design" => {
      q1: "Welcome to the System Design loop. Today, let's design an API Rate Limiter that can handle 100,000 queries per second (QPS) for a large multi-tenant SaaS. What are the key requirements you would clarify, and what high-level architecture would you propose?",
      q2: "Good. How would you handle distributed rate-limiting synchronization issues across multiple geographical regions?"
    },
    "behavioral" => {
      q1: "Hi! Welcome to the Behavioral/Leadership round. Tell me about a time you had a significant technical disagreement with another senior engineer or architect. What was the conflict, and how did you resolve it?",
      q2: "Interesting. Looking back, is there anything you would have done differently to reach a decision faster?"
    }
  }.freeze

  def index
    interviews = current_user.mock_interviews.order(created_at: :desc).map do |i|
      {
        id: i.id,
        interview_type: i.interview_type,
        status: i.status,
        score: i.score,
        created_at: i.created_at,
        eval_result: i.eval_result
      }
    end
    render json: { mock_interviews: interviews }
  end

  def show
    interview = current_user.mock_interviews.find(params[:id])
    render json: {
      mock_interview: interview,
      eval_result: interview.eval_result
    }
  end

  def create
    type = params[:interview_type] || "dsa"
    unless %w[dsa system_design behavioral].include?(type)
      render json: { error: "Invalid interview type" }, status: :unprocessable_entity
      return
    end

    first_question = QUESTIONS[type][:q1]
    
    interview = current_user.mock_interviews.create!(
      interview_type: type,
      status: "in_progress",
      transcript: [{ role: "interviewer", content: first_question }]
    )

    render json: { mock_interview: interview }
  end

  def update
    interview = current_user.mock_interviews.find(params[:id])
    answer = params[:answer]

    if interview.status == "completed"
      render json: { error: "Interview is already completed" }, status: :unprocessable_entity
      return
    end

    if answer.blank?
      render json: { error: "Answer cannot be blank" }, status: :unprocessable_entity
      return
    end

    transcript = interview.transcript
    transcript << { "role" => "candidate", "content" => answer }

    # Check how many candidate turns have occurred
    candidate_turns = transcript.count { |t| t["role"] == "candidate" }

    if candidate_turns == 1
      # Offer follow-up question
      followup = QUESTIONS[interview.interview_type][:q2]
      transcript << { "role" => "interviewer", "content" => followup }
      interview.update!(transcript: transcript)

      render json: { mock_interview: interview, finished: false }
    else
      # Complete the interview and score it
      interview.status = "completed"
      eval_data = Ai::InterviewEvaluatorService.evaluate(transcript, interview.interview_type)
      
      interview.score = eval_data[:score]
      interview.feedback = eval_data[:feedback]
      interview.transcript = transcript
      interview.save!

      # Save EvalResult record
      interview.create_eval_result!(
        user: current_user,
        groundedness: eval_data[:groundedness],
        relevance: eval_data[:relevance],
        rubric_scores: eval_data[:rubric_scores]
      )

      render json: { mock_interview: interview, eval_result: interview.eval_result, finished: true }
    end
  end
end
