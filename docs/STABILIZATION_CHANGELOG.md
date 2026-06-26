# StackScore v1.0 Stabilization Changelog

**Date:** June 2026  
**Goal:** Pilot-ready (1–3 users) before additional roadmap features.

---

## What changed

### Database migrations
- Initial migration: `prisma/migrations/20250626000000_init/`
- Production workflow: `npm run db:migrate:deploy` (replaces `db push` for go-live)
- Existing `db push` databases: baseline with `prisma migrate resolve --applied 20250626000000_init`

### Environment hardening
- `src/lib/env.ts` — Zod validation for `DATABASE_URL`, `AUTH_SECRET`, optional URLs
- `src/instrumentation.ts` — validates env on Node.js server startup
- Production `AUTH_SECRET` must be ≥ 32 characters at **runtime** (not during `next build`)

### Health & smoke checks
- `GET /api/v1/health` — database, auth secret, auth URL checks (503 when unhealthy)
- `npm run smoke` — validates env + health + auth CSRF against running instance

### Tests
- `tests/env.test.ts` — environment validation
- `tests/recommendations/index.test.ts` — recommendation engine coverage
- `tests/scoring/index.test.ts` — scoring engine (existing)

### Documentation
- `docs/DEPLOY.md` — deployment, backup, updates, troubleshooting
- `docs/PILOT_GO_LIVE.md` — pre-flight checklist
- `docs/KNOWN_LIMITATIONS.md` — v1.0 scope boundaries
- `README.md` — migrate-first setup, new scripts

### Package scripts (v1.0.0)
| Script | Purpose |
|--------|---------|
| `db:migrate:deploy` | Apply migrations in production |
| `db:setup` | Migrate + seed fresh install |
| `smoke` | Post-deploy verification |
| `postinstall` | `prisma generate` |

---

## Pilot go-live steps

1. Configure `.env` (see `.env.example`)
2. `npm run db:migrate:deploy` (or baseline + deploy for existing DB)
3. `npm run db:seed` with custom `SEED_ADMIN_PASSWORD`
4. `npm test && npm run build`
5. `npm start` then `npm run smoke`
6. Complete [PILOT_GO_LIVE.md](PILOT_GO_LIVE.md) manual checklist

---

## Not in scope (deferred to roadmap)

TIP, roadmaps, client portal, Today's Focus, integrations, audit log — see [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md).
