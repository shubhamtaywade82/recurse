class ContentChunk < ApplicationRecord
  validates :source_type, inclusion: { in: %w[dsa system_design lld ai] }
  validates :title, :content, presence: true
end
