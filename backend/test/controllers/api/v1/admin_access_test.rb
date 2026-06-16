# frozen_string_literal: true

require "test_helper"

class Api::V1::AdminAccessTest < ActionDispatch::IntegrationTest
  setup do
    @user = create_user!(email: "regular@example.com")
    @admin = create_user!(email: "admin@example.com", admin: true, plan: "team")
  end

  test "non-admin cannot access admin users index" do
    get "/api/v1/admin/users", headers: auth_headers_for(@user), as: :json
    assert_response :forbidden
  end

  test "admin can access admin users index" do
    get "/api/v1/admin/users", headers: auth_headers_for(@admin), as: :json
    assert_response :success
    assert json_response["users"].is_a?(Array)
  end

  test "non-admin cannot access admin system metrics" do
    get "/api/v1/admin/users/system_metrics", headers: auth_headers_for(@user), as: :json
    assert_response :forbidden
  end

  test "admin can access system metrics" do
    get "/api/v1/admin/users/system_metrics", headers: auth_headers_for(@admin), as: :json
    assert_response :success
    assert json_response.key?("total_users")
  end
end
