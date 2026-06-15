class ChecklistItem < ApplicationRecord
  belongs_to :user

  validates :track, :month, :week_label, :item_text, presence: true
  validates :item_text, uniqueness: { scope: [:user_id, :track, :month, :week_label] }
end
