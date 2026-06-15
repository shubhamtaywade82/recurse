class Profile < ApplicationRecord
  belongs_to :user

  validates :current_track, inclusion: { in: %w[SWE AI HYBRID] }
end
