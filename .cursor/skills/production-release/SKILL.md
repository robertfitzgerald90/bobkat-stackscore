---
name: production-release
description: >-
  Verifies deploy readiness for this app on Vercel + Neon — lint, tsc, tests,
  build, migrate deploy, smoke. Use before production deploy or when diagnosing
  Vercel/Neon build failures.
---

# Production Release

## Scope

**StackScore deploy topology** (Vercel + Neon, `scripts/vercel-build.mjs`, host `stackscore.tech`). Portable ideas: migrate-on-build, smoke health/auth, rollback app vs forward-fix DB. Do not assume Neon/Vercel in unrelated repos.

## Purpose

Confirm migrations, env, build, and smoke checks before/after production deploy using repo scripts.

## When to use

- Pre-deploy checklist
- `vercel-build` / `migrate deploy` failures
- Post-deploy verification

## When not to use

| Situation | Use instead |
|-----------|-------------|
| Feature implementation | domain skills + `repository-auditor` |
| Schema design / new migration authoring | `prisma-postgres` |
| Unit-test authoring only | `testing-validation` |

## Repository locations to inspect

| Area | Path |
|------|------|
| Build | `scripts/vercel-build.mjs`, `package.json` |
| Smoke | `scripts/smoke-check.ts` |
| Env names | `.env.example`, `src/lib/env.ts` |
| Docs | `docs/50-Development/DEPLOY.md`, `ENVIRONMENTS.md` |
| Health | `src/app/api/v1/health/route.ts` |

## Required implementation workflow

1. Local gate:
   ```bash
   npm run lint
   npx tsc --noEmit
   npm test
   npm run build
   ```
   (No `typecheck` script — `tsc --noEmit` is supported via TypeScript.)
2. Migrations applied: `npm run db:migrate:deploy` (or rely on Vercel build).
3. Vercel Production env (Build + Runtime): `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_APP_URL`, plus feature secrets by **name** from `.env.example`.
4. Build command: `npm run vercel-build` → generate → migrate deploy (unless `SKIP_PRISMA_MIGRATE=1`) → `next build`.
5. Smoke: `npm run smoke` or `npm run smoke -- <baseUrl>` (production host is environment-specific).
6. Rollback: Vercel prior deployment for app; DB via new forward migration (`prisma-postgres`) — never rewrite migration history.

## Required architecture (this repo)

- Node 20.x; production DB Neon; local Postgres separate (ENVIRONMENTS.md)
- Route Handlers + Prisma migrate deploy — not `db push` on production

## Validation commands

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
npm run db:migrate:deploy
npm run vercel-build
npm run smoke
```

All `npm run *` above exist in `package.json` except `tsc` / `prisma` invoked via `npx`.

## Definition of done

- [ ] Lint, `tsc --noEmit`, tests, build succeed
- [ ] Target DB has migrations applied
- [ ] Smoke health + auth CSRF checks pass against intended base URL
- [ ] New required env **names** documented in `.env.example` if added

## Common implementation mistakes

- `DATABASE_URL` missing from Vercel **Build**
- `db push` on Neon instead of migrate deploy
- `SKIP_PRISMA_MIGRATE=1` without manual migrate
- Skipping smoke after deploy

## Example invocation

> "Vercel failed during prisma migrate deploy — use **production-release** and vercel-build.mjs notes."
