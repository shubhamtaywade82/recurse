# frozen_string_literal: true

class UsageLimiter
  LIMITS = {
    "free" => { coach_messages: 10, mock_interviews: 1, hints: 20 },
    "pro" => { coach_messages: nil, mock_interviews: 10, hints: nil },
    "team" => { coach_messages: nil, mock_interviews: nil, hints: nil }
  }.freeze

  def initialize(user)
    @user = user
  end

  def allow?(feature)
    limit = limit_for(feature)
    return true if limit.nil?

    usage_for(feature) < limit
  end

  def deny!(feature)
    return if allow?(feature)

    raise UsageLimitExceeded, limit_message(feature)
  end

  def usage_for(feature)
    case feature
    when :coach_messages
      coach_messages_this_month
    when :mock_interviews
      mock_interviews_this_month
    when :hints
      hints_this_month
    else
      0
    end
  end

  def limit_for(feature)
    LIMITS.fetch(@user.plan, LIMITS["free"])[feature]
  end

  class UsageLimitExceeded < StandardError
    def initialize(message)
      super
    end
  end

  private

  def month_range
    Time.current.beginning_of_month..Time.current.end_of_month
  end

  def coach_messages_this_month
    Message.joins(:coach_session)
           .where(coach_sessions: { user_id: @user.id }, sender: "user")
           .where(created_at: month_range)
           .count
  end

  def mock_interviews_this_month
    @user.mock_interviews.where(created_at: month_range).count
  end

  def hints_this_month
    HintRequest.joins(user_problem: :user)
               .where(users: { id: @user.id })
               .where(hint_requests: { created_at: month_range })
               .count
  end

  def limit_message(feature)
    limit = limit_for(feature)
    "Monthly #{feature.to_s.humanize.downcase} limit reached (#{limit}/month on #{@user.plan} plan). Upgrade for more access."
  end
end
