# PrepEdge

**PrepEdge** is an open-source senior software engineer interview preparation platform. It combines structured 6-month roadmaps (SWE, AI, ByteByteGo, Hybrid tracks), DSA practice, AI study coaching, mock interviews, gap analytics, and adaptive practice plans.

> **Alpha (v0.1.0):** This release is self-hostable and suitable for evaluation. Several features use simulated or keyword-based implementations. See [Alpha limitations](#alpha-limitations) below.

## Features

- Multi-track interview roadmaps with checklist progress
- Daily study logging (DSA, system design, LLD, AI minutes)
- DSA problem bank with Socratic hints (3 levels)
- AI study coach with retrieval-augmented responses (Ollama optional)
- Text-based mock interviews (DSA, system design, behavioral) with rubric scoring
- Gap analytics dashboard and adaptive practice plan generation
- Admin panel for users, problems, and RAG content chunks
- Plan tiers (free / pro / team) with server-side usage limits

## Alpha limitations

| Area | Current behavior | Planned (v0.2.0+) |
|------|------------------|-------------------|
| RAG | Keyword matching; `embedding_json` simulated | pgvector + real embeddings |
| Code submission | Length heuristic (“simulated compiler”) | Sandboxed test runner |
| Study coach | Synchronous responses | SSE streaming |
| Gap analytics | Inline heuristics | Background jobs + AI narratives |
| Billing | Mock upgrade (`ALLOW_MOCK_BILLING`); no Stripe | Optional Stripe module (v1.0) |
| Stack vs vision doc | Rails API + React SPA | See [`IMPLEMENTAION_PLAN.md`](IMPLEMENTAION_PLAN.md) |

## Prerequisites

- **Docker** and **Docker Compose** (recommended), or:
- Ruby **3.3.4**, Node **20+**, PostgreSQL **16**
- **Ollama** (optional) for live local LLM responses — the app falls back to curated simulated content when Ollama is unavailable

## Quick start (Docker Compose)

```bash
git clone <your-repo-url> prepedge
cd prepedge
cp .env.example .env
# Edit JWT_SECRET and seed passwords in .env

docker compose up --build
```

Open **http://localhost:8080**

Default seeded accounts (override via `.env`):

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `password123` |
| User | `user@example.com` | `password123` |

Optional Ollama for live AI:

```bash
docker compose --profile ollama up --build
```

## Local development (without Docker)

```bash
# Terminal 1 — Postgres running locally
cd backend
bundle install
bin/rails db:setup db:seed
JWT_SECRET=dev-secret FRONTEND_ORIGIN=http://localhost:5173 bin/rails server -p 3005

# Terminal 2
cd frontend
npm install
npm run dev
```

Or from the repo root:

```bash
foreman start -f Procfile.dev
```

Frontend: http://localhost:5173 (proxies `/api` to Rails on :3005)

## Environment variables

See [`.env.example`](.env.example). Key variables:

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | Signs API authentication tokens (required) |
| `FRONTEND_ORIGIN` | CORS allowed origin |
| `ALLOW_MOCK_BILLING` | Allow self-service plan changes without Stripe |
| `SEED_ADMIN_*` / `SEED_USER_*` | Database seed credentials |

## Testing

```bash
cd backend
JWT_SECRET=test-secret bin/rails test

cd ../frontend
npm run lint
npm run build
```

CI runs on push/PR to `master` and `main` via [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Security model

- API endpoints require a **JWT** in the `Authorization: Bearer <token>` header (except auth and public shared interview links).
- Plan usage limits are enforced **server-side** (coach messages, mocks, hints).
- Plan upgrades without payment are a **self-host convenience** only; disable with `ALLOW_MOCK_BILLING=false` in production.

See [`SECURITY.md`](SECURITY.md) for reporting vulnerabilities.

## Roadmap

| Version | Focus |
|---------|-------|
| **v0.1.0** | Open-source self-host, security hardening, tests, Docker Compose |
| v0.2.0 | pgvector RAG, real embeddings, persist practice plans |
| v0.3.0 | Solid Queue jobs for analytics and plan regeneration |
| v0.4.0 | Sandboxed code execution for DSA |
| v0.5.0 | SSE streaming coach responses |
| v1.0.0 | Optional Stripe billing, team tier, observability |

Product vision and detailed architecture: [`IMPLEMENTAION_PLAN.md`](IMPLEMENTAION_PLAN.md)

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

[MIT](LICENSE)
