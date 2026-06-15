Rails.application.routes.draw do
  # Reveal health status
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      # Authentication
      post "auth/login", to: "auth#login"
      post "auth/register", to: "auth#register"

      # Public Sharing
      get "shared/mock_interviews/:share_token", to: "shared#show_interview"

      # User Profile
      get "profile", to: "profiles#show"
      patch "profile", to: "profiles#update"

      # Subscriptions
      post "subscriptions/upgrade", to: "subscriptions#upgrade"

      # Study logs
      resources :study_logs, only: [:index, :create]

      # Checklists
      resources :checklist_items, only: [:index] do
        post :toggle, on: :member
        post :bulk_create, on: :collection
      end

      # DSA Practice
      resources :problems, only: [:index, :show] do
        resources :user_problems, only: [:create] do
          post :submit_code, on: :member
          resources :hint_requests, only: [:create]
        end
      end

      # AI Coach Sessions
      resources :coach_sessions, only: [:index, :create, :show] do
        resources :messages, only: [:create]
      end

      # Mock Interviews
      resources :mock_interviews, only: [:index, :create, :show, :update]

      # Gap Analytics
      get "gap_analytics", to: "gap_analytics#show"
      post "gap_analytics/trigger", to: "gap_analytics#trigger"

      # Dynamic Practice Plans
      get "practice_plan", to: "practice_plans#show"
      post "practice_plan/generate", to: "practice_plans#generate"

      # ADMIN PANEL ENDPOINTS
      namespace :admin do
        resources :users, only: [:index, :update, :destroy] do
          get :system_metrics, on: :collection
        end
        resources :problems, only: [:index, :create, :update, :destroy]
        resources :content_chunks, only: [:index, :create, :update, :destroy]
      end
    end
  end
end
