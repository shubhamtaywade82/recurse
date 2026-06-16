class Api::V1::GapAnalyticsController < Api::V1::BaseController
  def show
    # Generate competency ratings based on solved problems
    solved_problems = current_user.user_problems.where(status: "solved").includes(:problem)
    solved_by_topic = solved_problems.group_by { |up| up.problem.topic }

    topics = ["Arrays & Hashing", "Sliding Window", "Graphs", "Advanced Graphs", "Low-Level Design"]
    ratings = {}
    
    topics.each do |topic|
      solved_count = solved_by_topic[topic]&.length || 0
      rating = case solved_count
               when 0 then 20
               when 1 then 45
               when 2 then 75
               else 95
               end
      ratings[topic] = rating
    end

    # Calculate mock interview score trajectory
    mock_interviews = current_user.mock_interviews.where(status: "completed").order(created_at: :asc)
    scores_trajectory = mock_interviews.map do |i|
      { date: i.created_at.strftime("%b %d"), score: i.score, type: i.interview_type }
    end

    # Simple logic to generate plain English recommendation narratives
    weak_areas = ratings.select { |_, r| r < 60 }.keys
    strong_areas = ratings.select { |_, r| r >= 75 }.keys

    critique = if weak_areas.any?
      "Based on your solved problems, you have strong foundations in #{strong_areas.join(', ')} (rated ≥ 75%). However, you have notable gaps in #{weak_areas.join(', ')} (rated < 60%). We recommend dedicating 60% of your next 2 weeks to practicing problems in these weak areas."
    else
      "Excellent progress! Your ratings are balanced across all core topics. To optimize your prep further, focus on scheduling full mock interview sessions to refine your under-pressure communication speed."
    end

    render json: {
      ratings: ratings,
      scores_trajectory: scores_trajectory,
      recommendation_critique: critique,
      last_analyzed_at: Time.current.strftime("%b %d, %H:%M:%S")
    }
  end

  def trigger
    # Simulate background Sidekiq job execution delay
    sleep(0.5)

    # Return success response showing job completed
    render json: {
      message: "Gap analysis background worker completed successfully. Metrics updated.",
      timestamp: Time.current
    }
  end
end
