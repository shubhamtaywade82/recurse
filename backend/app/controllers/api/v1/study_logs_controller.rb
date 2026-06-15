class Api::V1::StudyLogsController < ApplicationController
  def index
    logs = current_user.study_logs.order(date: :desc)
    render json: { study_logs: logs }
  end

  def create
    date = params[:date]
    log = current_user.study_logs.find_or_initialize_by(date: date)
    log.assign_attributes(study_log_params)

    if log.save
      render json: { study_log: log }
    else
      render json: { errors: log.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def study_log_params
    params.permit(:dsa_minutes, :sd_minutes, :lld_minutes, :ai_minutes)
  end
end
