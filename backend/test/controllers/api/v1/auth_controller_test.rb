# frozen_string_literal: true

require "test_helper"

class Api::V1::AuthControllerTest < ActionDispatch::IntegrationTest
  test "register creates user and returns jwt token" do
    post "/api/v1/auth/register", params: {
      email: "new@example.com",
      name: "New User",
      password: "password123"
    }, as: :json

    assert_response :success
    body = json_response
    assert body["token"].present?
    assert_equal "new@example.com", body["user"]["email"]
    assert_equal "free", body["user"]["plan"]
  end

  test "login returns jwt token for valid credentials" do
    user = create_user!(email: "login@example.com")

    post "/api/v1/auth/login", params: {
      email: user.email,
      password: "password123"
    }, as: :json

    assert_response :success
    body = json_response
    assert body["token"].present?
    assert_equal user.email, body["user"]["email"]
  end

  test "login rejects invalid password" do
    user = create_user!(email: "badlogin@example.com")

    post "/api/v1/auth/login", params: {
      email: user.email,
      password: "wrong-password"
    }, as: :json

    assert_response :unauthorized
    assert_match(/Incorrect password/, json_response["error"])
  end

  test "login rejects unknown email" do
    post "/api/v1/auth/login", params: {
      email: "missing@example.com",
      password: "password123"
    }, as: :json

    assert_response :unauthorized
    assert_match(/not registered/, json_response["error"])
  end
end
