# frozen_string_literal: true

require "test_helper"

class Ai::SocraticHintServiceTest < ActiveSupport::TestCase
  test "returns level-specific hint for known problem slug" do
    hint = Ai::SocraticHintService.hint_for("two-sum", 1)
    assert_match(/Hash Map/i, hint)
  end

  test "returns generic hint for unknown slug" do
    hint = Ai::SocraticHintService.hint_for("unknown-problem", 1)
    assert_match(/constraints/i, hint)
  end

  test "returns level 3 walkthrough for sliding window maximum" do
    hint = Ai::SocraticHintService.hint_for("sliding-window-maximum", 3)
    assert_match(/Deque/i, hint)
  end
end
