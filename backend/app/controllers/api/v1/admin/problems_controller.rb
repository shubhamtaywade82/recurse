class Api::V1::Admin::ProblemsController < Api::V1::Admin::BaseController

  def index
    problems = Problem.all.order(created_at: :desc)
    render json: { problems: problems }
  end

  def create
    problem = Problem.new(problem_params)
    if problem.save
      render json: { problem: problem }
    else
      render json: { errors: problem.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    problem = Problem.find(params[:id])
    if problem.update(problem_params)
      render json: { problem: problem }
    else
      render json: { errors: problem.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    problem = Problem.find(params[:id])
    problem.destroy!
    render json: { message: "Problem deleted successfully" }
  end

  private

  def problem_params
    params.require(:problem).permit(:slug, :title, :difficulty, :topic, :source, :platform, :description, :starter_code)
  end
end
