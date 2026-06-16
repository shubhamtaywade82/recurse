class Api::V1::SubscriptionsController < Api::V1::BaseController
  before_action :authorize_plan_change!

  def upgrade
    user = target_user
    return render json: { error: "User not found" }, status: :not_found if user.nil?

    plan = params[:plan]
    if %w[free pro team].include?(plan)
      user.update!(plan: plan)
      render json: {
        message: "Successfully updated #{user.email} to #{plan}",
        user: user.as_json(only: [:email, :name, :plan])
      }
    else
      render json: { error: "Invalid plan type" }, status: :unprocessable_entity
    end
  end

  private

  def authorize_plan_change!
    return if current_user.admin?
    return if Rails.application.config.allow_mock_billing && target_user == current_user

    render json: {
      error: "Plan changes require admin access. Set ALLOW_MOCK_BILLING=true for self-service in self-hosted environments."
    }, status: :forbidden
  end

  def target_user
    if params[:user_id].present?
      User.find_by(id: params[:user_id])
    else
      current_user
    end
  end
end
