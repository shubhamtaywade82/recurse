# Contributing to PrepEdge

Thank you for contributing. This project is in **alpha** — we value focused, test-backed changes.

## Development setup

1. Fork and clone the repository
2. Copy `.env.example` to `.env` and set `JWT_SECRET`
3. Start Postgres, then either:
   - `docker compose up --build`, or
   - `foreman start -f Procfile.dev`

## Running tests

```bash
cd backend
JWT_SECRET=test-secret bin/rails test

cd ../frontend
npm run lint
npm run build
```

## Pull request guidelines

- Keep changes scoped to the issue or feature
- Add or update Minitest coverage for backend behavior changes
- Ensure `bin/rubocop`, `bin/brakeman`, and `bin/bundler-audit` pass in `backend/`
- Ensure `npm run lint` passes in `frontend/`
- Do not commit secrets, `master.key`, or real credentials

## Code structure

| Path | Purpose |
|------|---------|
| `backend/app/controllers/api/v1/` | JSON API |
| `backend/app/services/ai/` | Coach, evaluator, hints |
| `backend/app/services/` | JWT, usage limits |
| `frontend/src/App.jsx` | React SPA (monolith; split planned v0.2+) |

## Commit messages

Use clear, imperative subjects. Example:

```
Add server-side hint usage limits for free tier

Enforce UsageLimiter in HintRequestsController and cover with tests.
```
