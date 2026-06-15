class Problem < ApplicationRecord
  has_many :user_problems, dependent: :destroy
  has_many :users, through: :user_problems

  validates :slug, :title, :difficulty, :topic, :source, :platform, presence: true
  validates :slug, uniqueness: true
end
