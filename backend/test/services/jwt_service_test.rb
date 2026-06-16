# frozen_string_literal: true

require "test_helper"

class JwtServiceTest < ActiveSupport::TestCase
  test "encodes and decodes user id" do
    user = create_user!(email: "jwt@example.com")
    token = JwtService.encode(user.id)
    payload = JwtService.decode(token)

    assert_equal user.id, payload["user_id"]
  end

  test "returns nil for invalid token" do
    assert_nil JwtService.decode("not-a-valid-token")
  end
end
