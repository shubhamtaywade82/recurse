class Api::V1::SubscriptionsController < ApplicationController
  def upgrade
    plan = params[:plan]
    if %w[free pro team].include?(plan)
      current_user.update!(plan: plan)
      render json: { message: "Successfully upgraded to #{plan}", user: current_user.as_json(only: [:email, :name, :plan]) }
    else
      render json: { error: "Invalid plan type" }, status: :unprocessable_entity
    end
  end
end
