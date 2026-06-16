# Changelog

All notable changes to PrepEdge are documented in this file.

## [0.1.0] - 2026-06-15

### Added

- Open-source release packaging: root README, LICENSE (MIT), CONTRIBUTING, SECURITY, `.env.example`
- Docker Compose self-host stack (`db`, `backend`, `frontend`; optional `ollama` profile)
- JWT authentication replacing email-as-token auth
- `Api::V1::BaseController` with global authentication enforcement
- Server-side usage limits (`UsageLimiter`) for coach messages, mock interviews, and hints
- Rack::Attack rate limiting on auth and AI endpoints
- CORS restricted via `FRONTEND_ORIGIN` environment variable
- 32 Minitest tests covering auth, protected routes, coach, mocks, admin, usage limits
- Root GitHub Actions CI workflow (backend tests/lint/security + frontend lint/build)

### Changed

- Admin-only plan changes by default; `ALLOW_MOCK_BILLING` enables self-service for self-host
- Database seeds use `SEED_ADMIN_*` and `SEED_USER_*` environment variables
- Frontend supports `VITE_API_BASE_URL` for production API routing
- Frontend handles HTTP 402 plan limit responses from the API

### Fixed

- Removed unrelated trading tables from schema (legacy DB pollution)
- CI now triggers on `master` and `main` branches

### Alpha limitations (unchanged behavior, now documented)

- Keyword-based RAG (not pgvector)
- Simulated DSA code execution
- Synchronous AI coach (no SSE)
- Mock billing without Stripe

### Roadmap

- **v0.2.0** — pgvector RAG, real embeddings, persist practice plans
- **v0.3.0** — Solid Queue background jobs
- **v0.4.0** — Sandboxed code execution
- **v0.5.0** — SSE streaming coach
- **v1.0.0** — Optional Stripe billing and observability
