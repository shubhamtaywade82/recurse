class CoachSession < ApplicationRecord
  belongs_to :user
  has_many :messages, dependent: :destroy

  validates :session_type, presence: true
end
