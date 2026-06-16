class Api::V1::ProfilesController < Api::V1::BaseController
  def show
    profile = current_user.profile || current_user.create_profile!
    render json: {
      profile: profile,
      user: current_user.as_json(only: [:email, :name, :plan])
    }
  end

  def update
    profile = current_user.profile || current_user.create_profile!
    if profile.update(profile_params)
      render json: { profile: profile }
    else
      render json: { errors: profile.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def profile_params
    params.require(:profile).permit(:years_experience, :current_track, target_companies: [])
  end
end
