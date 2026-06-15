class Message < ApplicationRecord
  belongs_to :coach_session

  validates :sender, inclusion: { in: %w[user ai] }
  validates :content, presence: true
end
