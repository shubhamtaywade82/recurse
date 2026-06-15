class UserProblem < ApplicationRecord
  belongs_to :user
  belongs_to :problem
  has_many :hint_requests, dependent: :destroy

  validates :status, inclusion: { in: %w[attempted solved] }
  validates :problem_id, uniqueness: { scope: :user_id }
end
