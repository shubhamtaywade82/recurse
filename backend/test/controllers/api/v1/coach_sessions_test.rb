# frozen_string_literal: true

require "test_helper"

class Api::V1::CoachSessionsTest < ActionDispatch::IntegrationTest
  setup do
    @user = create_user!(email: "coach@example.com", plan: "pro")
  end

  test "creates coach session" do
    post "/api/v1/coach_sessions",
         headers: auth_headers_for(@user),
         params: { title: "DSA Review" },
         as: :json

    assert_response :success
    assert_equal "DSA Review", json_response["coach_session"]["title"]
  end

  test "sends coach message using ollama fallback" do
    session = @user.coach_sessions.create!(title: "Test Session")

    stub_ollama_failure do
      post "/api/v1/coach_sessions/#{session.id}/messages",
           headers: auth_headers_for(@user),
           params: { content: "Explain CAP theorem" },
           as: :json
    end

    assert_response :success
    assert json_response["ai_message"]["content"].present?
    assert_equal 2, session.messages.count
  end

  test "rejects blank coach message" do
    session = @user.coach_sessions.create!(title: "Test Session")

    post "/api/v1/coach_sessions/#{session.id}/messages",
         headers: auth_headers_for(@user),
         params: { content: "" },
         as: :json

    assert_response :unprocessable_entity
  end
end
