class ApplicationController < ActionController::API
  def current_user
    @current_user ||= authenticate_user_from_header
  end

  def authenticate_user!
    if current_user.nil?
      render json: { error: "Unauthorized access" }, status: :unauthorized
    end
  end

  def authenticate_admin!
    authenticate_user!
    return if performed?

    unless current_user.admin?
      render json: { error: "Forbidden: Admins only" }, status: :forbidden
    end
  end

  private

  def authenticate_user_from_header
    auth_header = request.headers["Authorization"]
    return nil if auth_header.blank?

    token = auth_header.split(" ").last
    # Supports simple token authentication based on email
    User.find_by(email: token)
  end
end
