ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module AuthTestHelper
  def auth_headers_for(user)
    { "Authorization" => "Bearer #{JwtService.encode(user.id)}" }
  end

  def json_response
    JSON.parse(@response.body)
  end

  def create_user!(email: "user@example.com", password: "password123", plan: "free", admin: false, name: "Test User")
    User.create!(email: email, name: name, password: password, plan: plan, admin: admin)
  end
end

module OllamaTestHelper
  def with_ollama_client(fake_client)
    original_new = Ollama::Client.method(:new)
    Ollama::Client.define_singleton_method(:new) { |**| fake_client }
    yield
  ensure
    Ollama::Client.define_singleton_method(:new, original_new)
  end

  def stub_ollama_chat(content)
    fake_response = Struct.new(:message).new(Struct.new(:content).new(content))
    fake_client = Object.new
    fake_client.define_singleton_method(:chat) { |**| fake_response }

    with_ollama_client(fake_client) { yield }
  end

  def stub_ollama_failure
    fake_client = Object.new
    fake_client.define_singleton_method(:chat) { |**| raise StandardError, "Ollama unavailable" }

    with_ollama_client(fake_client) { yield }
  end
end

module ActiveSupport
  class TestCase
    parallelize(workers: 1)

    include AuthTestHelper
    include OllamaTestHelper
  end
end

class ActionDispatch::IntegrationTest
  include AuthTestHelper
  include OllamaTestHelper
end
