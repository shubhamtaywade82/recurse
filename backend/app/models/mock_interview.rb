class MockInterview < ApplicationRecord
  belongs_to :user
  has_one :eval_result, dependent: :destroy

  validates :interview_type, inclusion: { in: %w[dsa system_design behavioral] }
end
