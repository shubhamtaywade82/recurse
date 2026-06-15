class HintRequest < ApplicationRecord
  belongs_to :user_problem

  validates :hint_level, presence: true
end
