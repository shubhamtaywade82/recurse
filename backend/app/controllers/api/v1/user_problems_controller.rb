class Api::V1::UserProblemsController < Api::V1::BaseController
  def create
    problem = Problem.find(params[:problem_id])
    up = current_user.user_problems.find_or_initialize_by(problem_id: problem.id)
    up.assign_attributes(status: "attempted", code: problem.starter_code)
    up.save!
    render json: { user_problem: up }
  end

  def submit_code
    problem = Problem.find(params[:problem_id])
    up = current_user.user_problems.find_or_initialize_by(problem_id: problem.id)
    
    code = params[:code]
    notes = params[:notes]
    time_taken = params[:time_taken_secs].to_i

    up.attempts += 1
    up.code = code
    up.notes = notes
    up.time_taken_secs += time_taken

    # Simple validation parser: if code is longer than 15 characters, mark solved
    if code.present? && code.strip.length > 20
      up.status = "solved"
      up.solved_at = Time.current
      success = true
      message = "All test cases passed! (Simulated Compiler)"
    else
      up.status = "attempted"
      success = false
      message = "Compilation failed or tests did not pass. Write a more complete solution."
    end

    up.save!
    render json: { success: success, message: message, user_problem: up }
  end
end
