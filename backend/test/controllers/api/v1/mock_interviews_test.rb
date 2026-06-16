# frozen_string_literal: true

require "test_helper"

class Api::V1::MockInterviewsTest < ActionDispatch::IntegrationTest
  setup do
    @user = create_user!(email: "mock@example.com", plan: "pro")
  end

  test "creates mock interview" do
    post "/api/v1/mock_interviews",
         headers: auth_headers_for(@user),
         params: { interview_type: "dsa" },
         as: :json

    assert_response :success
    assert_equal "in_progress", json_response["mock_interview"]["status"]
  end

  test "completes two-turn mock interview and creates eval result" do
    post "/api/v1/mock_interviews",
         headers: auth_headers_for(@user),
         params: { interview_type: "dsa" },
         as: :json
    interview_id = json_response["mock_interview"]["id"]

    stub_ollama_failure do
      patch "/api/v1/mock_interviews/#{interview_id}",
            headers: auth_headers_for(@user),
            params: { answer: "Use a monotonic deque for O(N) sliding window maximum." },
            as: :json
    end
    assert_response :success
    refute json_response["finished"]

    stub_ollama_failure do
      patch "/api/v1/mock_interviews/#{interview_id}",
            headers: auth_headers_for(@user),
            params: { answer: "For streaming data use bounded deque memory and eviction policies." },
            as: :json
    end

    assert_response :success
    assert json_response["finished"]
    assert json_response["eval_result"].present?

    interview = MockInterview.find(interview_id)
    assert_equal "completed", interview.status
    assert interview.eval_result.present?
  end
end
