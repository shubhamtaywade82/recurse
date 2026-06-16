# frozen_string_literal: true

require "test_helper"

class Api::V1::SubscriptionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = create_user!(email: "billing@example.com", plan: "free")
    @admin = create_user!(email: "billing-admin@example.com", plan: "team", admin: true)
  end

  test "admin can change user plan" do
    post "/api/v1/subscriptions/upgrade",
         headers: auth_headers_for(@admin),
         params: { user_id: @user.id, plan: "pro" },
         as: :json

    assert_response :success
    assert_equal "pro", @user.reload.plan
  end

  test "non-admin cannot change plan when mock billing disabled" do
    Rails.application.config.allow_mock_billing = false

    post "/api/v1/subscriptions/upgrade",
         headers: auth_headers_for(@user),
         params: { plan: "pro" },
         as: :json

    assert_response :forbidden
  ensure
    Rails.application.config.allow_mock_billing = true
  end
end
