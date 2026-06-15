class Api::V1::AuthController < ApplicationController
  def login
    user = User.find_by(email: params[:email])

    if user.nil?
      render json: { error: "Email address not registered. Please sign up first." }, status: :unauthorized
      return
    end

    if user.authenticate(params[:password])
      render json: {
        token: user.email,
        user: {
          email: user.email,
          name: user.name,
          plan: user.plan,
          admin: user.admin
        }
      }
    else
      render json: { error: "Incorrect password. Please try again." }, status: :unauthorized
    end
  end

  def register
    user = User.new(
      email: params[:email],
      name: params[:name],
      password: params[:password],
      plan: "free",
      admin: false
    )

    if user.save
      render json: {
        token: user.email,
        user: {
          email: user.email,
          name: user.name,
          plan: user.plan,
          admin: user.admin
        }
      }
    else
      render json: { error: user.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end
end
