# frozen_string_literal: true

class Api::V1::Admin::BaseController < Api::V1::BaseController
  before_action :authenticate_admin!
end
