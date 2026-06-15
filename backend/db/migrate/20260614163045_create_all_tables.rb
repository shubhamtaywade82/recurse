class CreateAllTables < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :email, null: false
      t.string :name
      t.string :stripe_customer_id
      t.string :plan, default: "free"
      t.timestamps
    end
    add_index :users, :email, unique: true

    create_table :profiles do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :years_experience, default: 0
      t.text :target_companies, array: true, default: []
      t.string :current_track, default: "SWE"
      t.timestamps
    end

    create_table :study_logs do |t|
      t.references :user, null: false, foreign_key: true
      t.date :date, null: false
      t.integer :dsa_minutes, default: 0
      t.integer :sd_minutes, default: 0
      t.integer :lld_minutes, default: 0
      t.integer :ai_minutes, default: 0
      t.timestamps
    end
    add_index :study_logs, [:user_id, :date], unique: true

    create_table :checklist_items do |t|
      t.references :user, null: false, foreign_key: true
      t.string :track, null: false
      t.integer :month, null: false
      t.string :week_label, null: false
      t.text :item_text, null: false
      t.boolean :completed, default: false
      t.timestamps
    end
    add_index :checklist_items, [:user_id, :track, :month, :week_label, :item_text], unique: true, name: "index_checklist_items_unique_keys"

    create_table :problems do |t|
      t.string :slug, null: false
      t.string :title, null: false
      t.string :difficulty, null: false
      t.string :topic, null: false
      t.string :source, null: false
      t.string :platform, null: false
      t.text :description
      t.text :starter_code
      t.timestamps
    end
    add_index :problems, :slug, unique: true

    create_table :user_problems do |t|
      t.references :user, null: false, foreign_key: true
      t.references :problem, null: false, foreign_key: true
      t.string :status, default: "attempted"
      t.integer :time_taken_secs, default: 0
      t.integer :attempts, default: 1
      t.text :notes
      t.text :code
      t.datetime :solved_at
      t.timestamps
    end
    add_index :user_problems, [:user_id, :problem_id], unique: true

    create_table :hint_requests do |t|
      t.references :user_problem, null: false, foreign_key: true
      t.integer :hint_level, null: false
      t.text :hint_text
      t.timestamps
    end

    create_table :coach_sessions do |t|
      t.references :user, null: false, foreign_key: true
      t.string :session_type, default: "general"
      t.string :title
      t.timestamps
    end

    create_table :messages do |t|
      t.references :coach_session, null: false, foreign_key: true
      t.string :sender, null: false # "user" or "ai"
      t.text :content, null: false
      t.timestamps
    end

    create_table :mock_interviews do |t|
      t.references :user, null: false, foreign_key: true
      t.string :interview_type, null: false # "dsa", "system_design", "behavioral"
      t.string :status, default: "completed"
      t.jsonb :transcript, default: []
      t.integer :score
      t.jsonb :feedback, default: {}
      t.timestamps
    end

    create_table :eval_results do |t|
      t.references :user, null: false, foreign_key: true
      t.references :mock_interview, null: false, foreign_key: true
      t.float :groundedness
      t.float :relevance
      t.jsonb :rubric_scores, default: {}
      t.timestamps
    end

    create_table :content_chunks do |t|
      t.string :source_type, null: false # "dsa", "system_design", "lld", "ai"
      t.string :title, null: false
      t.text :content, null: false
      t.jsonb :embedding_json
      t.timestamps
    end
  end
end
