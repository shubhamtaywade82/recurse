class Api::V1::ProblemsController < Api::V1::BaseController
  def index
    problems = Problem.all.map do |p|
      up = current_user.user_problems.find_by(problem_id: p.id)
      p.as_json.merge(
        status: up&.status || "unattempted",
        time_taken_secs: up&.time_taken_secs || 0,
        attempts: up&.attempts || 0,
        solved_at: up&.solved_at
      )
    end
    render json: { problems: problems }
  end

  def show
    problem = Problem.find_by!(slug: params[:id])
    up = current_user.user_problems.find_by(problem_id: problem.id)
    render json: {
      problem: problem.as_json.merge(
        status: up&.status || "unattempted",
        code: up&.code || problem.starter_code,
        notes: up&.notes || "",
        attempts: up&.attempts || 0,
        time_taken_secs: up&.time_taken_secs || 0
      )
    }
  end
end
