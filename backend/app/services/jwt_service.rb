# frozen_string_literal: true

class JwtService
  ALGORITHM = "HS256"
  EXPIRY = 7.days

  def self.secret
    ENV.fetch("JWT_SECRET") { Rails.application.credentials.secret_key_base }
  end

  def self.encode(user_id)
    payload = {
      user_id: user_id,
      exp: EXPIRY.from_now.to_i
    }
    JWT.encode(payload, secret, ALGORITHM)
  end

  def self.decode(token)
    payload, = JWT.decode(token, secret, true, { algorithm: ALGORITHM })
    payload
  rescue JWT::DecodeError, JWT::ExpiredSignature
    nil
  end
end
