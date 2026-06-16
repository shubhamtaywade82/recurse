# frozen_string_literal: true

require "test_helper"

class UsageLimiterTest < ActiveSupport::TestCase
  setup do
    @user = create_user!(email: "limiter@example.com", plan: "free")
    @limiter = UsageLimiter.new(@user)
  end

  test "free plan allows coach messages under limit" do
    assert @limiter.allow?(:coach_messages)
  end

  test "free plan blocks coach messages at monthly limit" do
    session = @user.coach_sessions.create!(title: "Limit Test")
    UsageLimiter::LIMITS["free"][:coach_messages].times do |index|
      session.messages.create!(sender: "user", content: "Question #{index}")
    end

    refute @limiter.allow?(:coach_messages)
  end

  test "free plan blocks mock interviews after one per month" do
    @user.mock_interviews.create!(interview_type: "dsa", status: "completed", transcript: [])

    refute @limiter.allow?(:mock_interviews)
  end

  test "team plan has unlimited coach messages" do
    team_user = create_user!(email: "team@example.com", plan: "team")
    limiter = UsageLimiter.new(team_user)

    session = team_user.coach_sessions.create!(title: "Unlimited")
    15.times { |i| session.messages.create!(sender: "user", content: "Q#{i}") }

    assert limiter.allow?(:coach_messages)
  end

  test "deny raises usage limit exceeded error" do
    session = @user.coach_sessions.create!(title: "Limit Test")
    UsageLimiter::LIMITS["free"][:coach_messages].times do |index|
      session.messages.create!(sender: "user", content: "Question #{index}")
    end

    assert_raises(UsageLimiter::UsageLimitExceeded) do
      @limiter.deny!(:coach_messages)
    end
  end
end
