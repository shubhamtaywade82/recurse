class ApplicationController < ActionController::API
  def current_user
    @current_user ||= authenticate_user_from_header
  end

  def authenticate_user!
    return if current_user.present?

    render json: { error: "Unauthorized access" }, status: :unauthorized
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
    payload = JwtService.decode(token)
    return nil if payload.blank?

    User.find_by(id: payload["user_id"])
  end
end
