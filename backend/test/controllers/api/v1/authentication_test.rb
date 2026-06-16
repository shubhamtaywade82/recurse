# frozen_string_literal: true

require "test_helper"

class Api::V1::AuthenticationTest < ActionDispatch::IntegrationTest
  test "profile requires authentication" do
    get "/api/v1/profile", as: :json
    assert_response :unauthorized
  end

  test "profile rejects invalid jwt token" do
    get "/api/v1/profile", headers: { "Authorization" => "Bearer invalid.token" }, as: :json
    assert_response :unauthorized
  end

  test "profile returns data with valid jwt token" do
    user = create_user!(email: "profile@example.com")

    get "/api/v1/profile", headers: auth_headers_for(user), as: :json

    assert_response :success
    assert_equal user.email, json_response["user"]["email"]
  end

  test "coach sessions require authentication" do
    get "/api/v1/coach_sessions", as: :json
    assert_response :unauthorized
  end

  test "problems require authentication" do
    get "/api/v1/problems", as: :json
    assert_response :unauthorized
  end
end
