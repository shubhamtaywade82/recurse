class Api::V1::CoachSessionsController < ApplicationController
  def index
    sessions = current_user.coach_sessions.order(created_at: :desc)
    render json: { coach_sessions: sessions }
  end

  def show
    session = current_user.coach_sessions.find(params[:id])
    render json: {
      coach_session: session,
      messages: session.messages.order(created_at: :asc)
    }
  end

  def create
    session = current_user.coach_sessions.create!(
      session_type: params[:session_type] || "general",
      title: params[:title] || "Study Coaching - #{Time.current.strftime('%b %d, %Y')}"
    )
    # Seed introductory message
    session.messages.create!(
      sender: "ai",
      content: "Hello! I am your PrepEdge Study Coach. Ask me any question about DSA patterns, System Design, LLD, or LLMOps architectures."
    )
    render json: { coach_session: session }
  end
end
