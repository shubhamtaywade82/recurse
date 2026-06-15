class Api::V1::MessagesController < ApplicationController
  def create
    session = current_user.coach_sessions.find(params[:coach_session_id])
    content = params[:content]

    if content.blank?
      render json: { error: "Message content cannot be blank" }, status: :unprocessable_entity
      return
    end

    # Call AI RAG Coach Service
    service = Ai::StudyCoachService.new(current_user, session, content)
    ai_message = service.call

    render json: {
      user_message: session.messages.where(sender: "user").last,
      ai_message: ai_message
    }
  end
end
