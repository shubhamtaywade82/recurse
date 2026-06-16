# frozen_string_literal: true

class Rack::Attack
  throttle("auth/ip", limit: 10, period: 1.minute) do |req|
    req.ip if req.path.start_with?("/api/v1/auth")
  end

  throttle("ai/ip", limit: 30, period: 1.minute) do |req|
    req.ip if req.path.match?(%r{/api/v1/(coach_sessions/.*/messages|mock_interviews)})
  end
end
