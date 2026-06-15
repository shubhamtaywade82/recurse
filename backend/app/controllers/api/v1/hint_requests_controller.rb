class Api::V1::HintRequestsController < ApplicationController
  def create
    problem = Problem.find(params[:problem_id])
    up = current_user.user_problems.find_or_create_by!(problem_id: problem.id) do |record|
      record.status = "attempted"
      record.code = problem.starter_code
    end

    hint_level = params[:hint_level].to_i
    hint_text = Ai::SocraticHintService.hint_for(problem.slug, hint_level)

    hint_request = up.hint_requests.create!(
      hint_level: hint_level,
      hint_text: hint_text
    )

    render json: { hint_request: hint_request }
  end
end
