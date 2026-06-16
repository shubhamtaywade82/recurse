# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_06_15_120000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "checklist_items", force: :cascade do |t|
    t.boolean "completed", default: false
    t.datetime "created_at", null: false
    t.text "item_text", null: false
    t.integer "month", null: false
    t.string "track", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.string "week_label", null: false
    t.index ["user_id", "track", "month", "week_label", "item_text"], name: "index_checklist_items_unique_keys", unique: true
    t.index ["user_id"], name: "index_checklist_items_on_user_id"
  end

  create_table "coach_sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "session_type", default: "general"
    t.string "title"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_coach_sessions_on_user_id"
  end

  create_table "content_chunks", force: :cascade do |t|
    t.text "content", null: false
    t.datetime "created_at", null: false
    t.jsonb "embedding_json"
    t.string "source_type", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
  end

  create_table "eval_results", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.float "groundedness"
    t.bigint "mock_interview_id", null: false
    t.float "relevance"
    t.jsonb "rubric_scores", default: {}
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["mock_interview_id"], name: "index_eval_results_on_mock_interview_id"
    t.index ["user_id"], name: "index_eval_results_on_user_id"
  end

  create_table "hint_requests", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "hint_level", null: false
    t.text "hint_text"
    t.datetime "updated_at", null: false
    t.bigint "user_problem_id", null: false
    t.index ["user_problem_id"], name: "index_hint_requests_on_user_problem_id"
  end

  create_table "messages", force: :cascade do |t|
    t.bigint "coach_session_id", null: false
    t.text "content", null: false
    t.datetime "created_at", null: false
    t.string "sender", null: false
    t.datetime "updated_at", null: false
    t.index ["coach_session_id"], name: "index_messages_on_coach_session_id"
  end

  create_table "mock_interviews", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.jsonb "feedback", default: {}
    t.string "interview_type", null: false
    t.boolean "is_shared", default: false
    t.integer "score"
    t.string "share_token"
    t.string "status", default: "completed"
    t.jsonb "transcript", default: []
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["share_token"], name: "index_mock_interviews_on_share_token", unique: true
    t.index ["user_id"], name: "index_mock_interviews_on_user_id"
  end

  create_table "problems", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.string "difficulty", null: false
    t.string "platform", null: false
    t.string "slug", null: false
    t.string "source", null: false
    t.text "starter_code"
    t.string "title", null: false
    t.string "topic", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_problems_on_slug", unique: true
  end

  create_table "profiles", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "current_track", default: "SWE"
    t.text "target_companies", default: [], array: true
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.integer "years_experience", default: 0
    t.index ["user_id"], name: "index_profiles_on_user_id"
  end

  create_table "solid_queue_blocked_executions", force: :cascade do |t|
    t.string "concurrency_key", null: false
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.index ["concurrency_key", "priority", "job_id"], name: "index_solid_queue_blocked_executions_for_release"
    t.index ["expires_at", "concurrency_key"], name: "index_solid_queue_blocked_executions_for_maintenance"
    t.index ["job_id"], name: "index_solid_queue_blocked_executions_on_job_id", unique: true
  end

  create_table "solid_queue_claimed_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.bigint "process_id"
    t.index ["job_id"], name: "index_solid_queue_claimed_executions_on_job_id", unique: true
    t.index ["process_id", "job_id"], name: "index_solid_queue_claimed_executions_on_process_id_and_job_id"
  end

  create_table "solid_queue_failed_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "error"
    t.bigint "job_id", null: false
    t.index ["job_id"], name: "index_solid_queue_failed_executions_on_job_id", unique: true
  end

  create_table "solid_queue_jobs", force: :cascade do |t|
    t.string "active_job_id"
    t.text "arguments"
    t.string "class_name", null: false
    t.string "concurrency_key"
    t.datetime "created_at", null: false
    t.datetime "finished_at"
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.datetime "scheduled_at"
    t.datetime "updated_at", null: false
    t.index ["active_job_id"], name: "index_solid_queue_jobs_on_active_job_id"
    t.index ["class_name"], name: "index_solid_queue_jobs_on_class_name"
    t.index ["finished_at"], name: "index_solid_queue_jobs_on_finished_at"
    t.index ["queue_name", "finished_at"], name: "index_solid_queue_jobs_for_filtering"
    t.index ["scheduled_at", "finished_at"], name: "index_solid_queue_jobs_for_alerting"
  end

  create_table "solid_queue_pauses", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "queue_name", null: false
    t.index ["queue_name"], name: "index_solid_queue_pauses_on_queue_name", unique: true
  end

  create_table "solid_queue_processes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "hostname"
    t.string "kind", null: false
    t.datetime "last_heartbeat_at", null: false
    t.text "metadata"
    t.string "name", null: false
    t.integer "pid", null: false
    t.bigint "supervisor_id"
    t.index ["last_heartbeat_at"], name: "index_solid_queue_processes_on_last_heartbeat_at"
    t.index ["name", "supervisor_id"], name: "index_solid_queue_processes_on_name_and_supervisor_id", unique: true
    t.index ["supervisor_id"], name: "index_solid_queue_processes_on_supervisor_id"
  end

  create_table "solid_queue_ready_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.index ["job_id"], name: "index_solid_queue_ready_executions_on_job_id", unique: true
    t.index ["priority", "job_id"], name: "index_solid_queue_poll_all"
    t.index ["queue_name", "priority", "job_id"], name: "index_solid_queue_poll_by_queue"
  end

  create_table "solid_queue_recurring_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.datetime "run_at", null: false
    t.string "task_key", null: false
    t.index ["job_id"], name: "index_solid_queue_recurring_executions_on_job_id", unique: true
    t.index ["task_key", "run_at"], name: "index_solid_queue_recurring_executions_on_task_key_and_run_at", unique: true
  end

  create_table "solid_queue_recurring_tasks", force: :cascade do |t|
    t.text "arguments"
    t.string "class_name"
    t.string "command", limit: 2048
    t.datetime "created_at", null: false
    t.text "description"
    t.string "key", null: false
    t.integer "priority", default: 0
    t.string "queue_name"
    t.string "schedule", null: false
    t.boolean "static", default: true, null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_solid_queue_recurring_tasks_on_key", unique: true
    t.index ["static"], name: "index_solid_queue_recurring_tasks_on_static"
  end

  create_table "solid_queue_scheduled_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.datetime "scheduled_at", null: false
    t.index ["job_id"], name: "index_solid_queue_scheduled_executions_on_job_id", unique: true
    t.index ["scheduled_at", "priority", "job_id"], name: "index_solid_queue_dispatch_all"
  end

  create_table "solid_queue_semaphores", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.string "key", null: false
    t.datetime "updated_at", null: false
    t.integer "value", default: 1, null: false
    t.index ["expires_at"], name: "index_solid_queue_semaphores_on_expires_at"
    t.index ["key", "value"], name: "index_solid_queue_semaphores_on_key_and_value"
    t.index ["key"], name: "index_solid_queue_semaphores_on_key", unique: true
  end

  create_table "study_logs", force: :cascade do |t|
    t.integer "ai_minutes", default: 0
    t.datetime "created_at", null: false
    t.date "date", null: false
    t.integer "dsa_minutes", default: 0
    t.integer "lld_minutes", default: 0
    t.integer "sd_minutes", default: 0
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id", "date"], name: "index_study_logs_on_user_id_and_date", unique: true
    t.index ["user_id"], name: "index_study_logs_on_user_id"
  end

  create_table "user_problems", force: :cascade do |t|
    t.integer "attempts", default: 1
    t.text "code"
    t.datetime "created_at", null: false
    t.text "notes"
    t.bigint "problem_id", null: false
    t.datetime "solved_at"
    t.string "status", default: "attempted"
    t.integer "time_taken_secs", default: 0
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["problem_id"], name: "index_user_problems_on_problem_id"
    t.index ["user_id", "problem_id"], name: "index_user_problems_on_user_id_and_problem_id", unique: true
    t.index ["user_id"], name: "index_user_problems_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.boolean "admin", default: false
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "name"
    t.string "password_digest"
    t.string "plan", default: "free"
    t.string "stripe_customer_id"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "checklist_items", "users"
  add_foreign_key "coach_sessions", "users"
  add_foreign_key "eval_results", "mock_interviews"
  add_foreign_key "eval_results", "users"
  add_foreign_key "hint_requests", "user_problems"
  add_foreign_key "messages", "coach_sessions"
  add_foreign_key "mock_interviews", "users"
  add_foreign_key "profiles", "users"
  add_foreign_key "solid_queue_blocked_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_claimed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_failed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_ready_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_recurring_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_scheduled_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "study_logs", "users"
  add_foreign_key "user_problems", "problems"
  add_foreign_key "user_problems", "users"
end
