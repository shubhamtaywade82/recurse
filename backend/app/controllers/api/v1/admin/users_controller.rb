class Api::V1::Admin::UsersController < ApplicationController
  before_action :authenticate_admin!

  def index
    users = User.all.includes(:profile).map do |u|
      {
        id: u.id,
        email: u.email,
        name: u.name,
        plan: u.plan,
        admin: u.admin,
        created_at: u.created_at,
        profile: u.profile
      }
    end
    render json: { users: users }
  end

  def update
    user = User.find(params[:id])
    if user.update(user_params)
      render json: { user: user }
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    user = User.find(params[:id])
    user.destroy!
    render json: { message: "User deleted successfully" }
  end

  def system_metrics
    total_users = User.count
    pro_users = User.where(plan: "pro").count
    team_users = User.where(plan: "team").count
    
    total_study_minutes = StudyLog.sum(:dsa_minutes) + StudyLog.sum(:sd_minutes) + StudyLog.sum(:lld_minutes) + StudyLog.sum(:ai_minutes)
    total_study_hours = (total_study_minutes / 60.0).round(1)

    completed_interviews = MockInterview.where(status: "completed")
    total_interviews = completed_interviews.count
    avg_score = total_interviews > 0 ? completed_interviews.average(:score).round(1) : 0

    render json: {
      total_users: total_users,
      pro_users: pro_users,
      team_users: team_users,
      total_study_hours: total_study_hours,
      total_interviews: total_interviews,
      average_interview_score: avg_score
    }
  end

  private

  def user_params
    params.require(:user).permit(:plan, :admin)
  end
end
