# frozen_string_literal: true

require "test_helper"

class Api::V1::HintRequestsTest < ActionDispatch::IntegrationTest
  setup do
    @user = create_user!(email: "hints@example.com", plan: "free")
    @problem = Problem.create!(
      slug: "two-sum",
      title: "Two Sum",
      difficulty: "Easy",
      topic: "Arrays & Hashing",
      source: "LeetCode 1",
      platform: "LeetCode",
      description: "Find two numbers",
      starter_code: "def two_sum(nums, target)\nend"
    )
  end

  test "creates hint request for authenticated user" do
    post "/api/v1/problems/#{@problem.id}/user_problems/1/hint_requests",
         headers: auth_headers_for(@user),
         params: { hint_level: 1 },
         as: :json

    assert_response :success
    assert json_response["hint_request"]["hint_text"].present?
  end

  test "enforces free plan hint limit" do
    up = @user.user_problems.create!(problem: @problem, status: "attempted", code: @problem.starter_code)
    UsageLimiter::LIMITS["free"][:hints].times do
      up.hint_requests.create!(hint_level: 1, hint_text: "hint")
    end

    post "/api/v1/problems/#{@problem.id}/user_problems/1/hint_requests",
         headers: auth_headers_for(@user),
         params: { hint_level: 2 },
         as: :json

    assert_response :payment_required
  end
end
