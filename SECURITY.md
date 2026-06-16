# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 0.1.x | Yes |

## Reporting a vulnerability

Please **do not** open public GitHub issues for security vulnerabilities.

Email the maintainers privately with:

- Description of the issue
- Steps to reproduce
- Impact assessment
- Suggested fix (if any)

We aim to acknowledge reports within 7 days.

## Known alpha risks (v0.1.0)

These are documented limitations, not unknown bugs:

1. **Simulated code execution** — DSA submissions are not run in a sandbox; do not treat pass/fail as real test results.
2. **Mock billing** — `ALLOW_MOCK_BILLING=true` (default in development/Docker) lets users change plans without payment. Set to `false` on shared/production instances.
3. **Shared mock interviews** — Anyone with a `share_token` URL can view that interview report. Tokens are unguessable but not revocable in v0.1.0.
4. **Ollama fallback content** — When Ollama is unavailable, coach and evaluator use keyword-based simulated responses.

## Self-hosting checklist

- Set a strong `JWT_SECRET`
- Set unique `SEED_ADMIN_PASSWORD` before first `db:seed`
- Set `ALLOW_MOCK_BILLING=false` unless you intend open plan changes
- Set `FRONTEND_ORIGIN` to your real frontend URL
- Enable `FORCE_SSL=true` behind HTTPS termination
- Do not expose the stack to the public internet without reviewing the alpha limitations above
