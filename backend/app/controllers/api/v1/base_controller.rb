# frozen_string_literal: true

class Api::V1::BaseController < ApplicationController
  before_action :authenticate_user!

  rescue_from UsageLimiter::UsageLimitExceeded do |error|
    render json: { error: error.message }, status: :payment_required
  end
end
