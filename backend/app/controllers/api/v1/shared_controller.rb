class Api::V1::SharedController < ApplicationController
  # No authenticate_user! needed as this is a public controller
  def show_interview
    interview = MockInterview.find_by!(share_token: params[:share_token])
    
    render json: {
      mock_interview: {
        interview_type: interview.interview_type,
        score: interview.score,
        transcript: interview.transcript,
        feedback: interview.feedback,
        created_at: interview.created_at
      },
      eval_result: interview.eval_result
    }
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Shared report not found" }, status: :not_found
  end
end
