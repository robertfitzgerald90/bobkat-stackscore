---
name: prisma-postgres
description: >-
  Safely changes PostgreSQL schema in this repo via Prisma 7 migrations, then
  updates dependent layers and regenerates the client. Use when editing
  prisma/schema.prisma, migrations, or Neon-bound schema shape.
---

# Prisma / PostgreSQL

## Scope

**StackScore repository paths and scripts.** Portable principles: migrate (don’t push) for shared DBs; never rewrite applied migration history; expand/contract for breaking changes. Do not recreate StackScore models (`Client`, `Assessment`, …) in other apps — map to that app’s schema.

## Purpose

Evolve schema with Prisma migrations, keep Zod/services/APIs/UI/seeds/tests aligned, preserve data, and report deploy steps separately.

## When to use

- Models, enums, fields, indexes, relations in `prisma/schema.prisma`
- New folders under `prisma/migrations/`
- Schema-driven updates across dependent layers

## When not to use

| Situation | Use instead |
|-----------|-------------|
| Logic with no DDL | domain `src/lib` + `documentation-driven-development` |
| CSV/seed only | `imports` |
| Deploy/smoke without schema edit | `production-release` |
| Route handler only | `api-server-actions` |

## Repository locations to inspect

| Area | Path |
|------|------|
| Schema / config | `prisma/schema.prisma`, `prisma.config.ts` |
| Migrations | `prisma/migrations/` (`migration_lock.toml` = postgresql) |
| DB client | `src/lib/db/index.ts`, `connection.ts` → `@/generated/prisma/client` |
| Seeds | `prisma/seed.ts`, `seed-v2.ts`, `seed-technology-catalog.ts`, `prisma/demo/` |
| Dependant layers | `src/lib/**/schemas.ts`, `src/app/api/**`, UI, `src/lib/pdf/**`, `tests/**` |
| Deploy | `scripts/vercel-build.mjs`, DEPLOY.md, ENVIRONMENTS.md |
| Env names | `DATABASE_URL`, `SEED_FULL_RESET`, `SEED_RESET_ASSESSMENTS`, `ALLOW_DEMO_SEED`, `SKIP_PRISMA_MIGRATE` |

## Safeguards (mandatory)

- No `migrate reset` / force-reset against shared or production DBs
- No drop/rename of populated columns without expand→backfill→contract plan
- No editing committed migration SQL — add a new migration
- No `db push` as production substitute (`npm run db:push` local only)
- No fake production seed data; no printing `DATABASE_URL` values
- No schema change without updating dependent layers

## Required sequence

```
- [ ] 1. Inspect model + all references (lib, api, ui, seeds, pdf, tests)
- [ ] 2. Assess backward-compat / migration risk
- [ ] 3. Update prisma/schema.prisma
- [ ] 4. Create migration — npm run db:migrate (folder YYYYMMDDHHMMSS_snake_case)
- [ ] 5. Update Zod, services, APIs, UI types, imports, reports, tests
- [ ] 6. Preserve existing rows/FKs (defaults/backfill; careful onDelete)
- [ ] 7. Keep seeds/imports idempotent (upsert / stable ids)
- [ ] 8. Regenerate client — npm run db:generate
- [ ] 9. Validate — commands below
- [ ] 10. Report deploy/data-migration steps separately
```

**Risk cheat-sheet:** additive/nullable = single migration; rename/type/NOT NULL on live data = multi-step; destructive DROP = stop for approval.

**Client import (this repo):** `@/generated/prisma/client` via `prisma` from `@/lib/db` — not `@prisma/client` in app code.

**Tenancy note:** Customer data hangs off **Client**; there are no Organization/Workspace models. Soft lifecycle uses status / `archivedAt` where present — not `deletedAt`.

## Validation commands

```bash
npx prisma validate
npm run db:generate
npx tsc --noEmit
npm run lint
npm test -- tests/<affected-domain>/
npm run build
```

| Command | In package.json? |
|---------|------------------|
| `npm run db:generate` / `db:migrate` / `db:migrate:deploy` / `db:seed` / `build` / `lint` / `test` | Yes |
| `npx prisma validate` | Prisma CLI (devDependency) |
| `npx tsc --noEmit` | TypeScript (no `typecheck` script) |

Production apply: `npm run db:migrate:deploy` (also via `npm run vercel-build` when `VERCEL=1` unless `SKIP_PRISMA_MIGRATE=1`).

## Deploy-time report (required output)

```markdown
## Deploy-time steps
- [ ] Backup DB
- [ ] npm run db:migrate:deploy (or Vercel vercel-build)
- [ ] Backfill (if any): script/SQL, idempotency
- [ ] Seed? default No
- [ ] npm run smoke [-- <baseUrl>]
```

## Definition of done

- [ ] Steps 1–10 complete; migration history untouched
- [ ] Dependent layers compile; validate/generate/tsc/lint/tests/build pass as listed
- [ ] Deploy steps reported; no secrets committed

## Common implementation mistakes

- `db push` to Neon; editing applied migrations; Zod enums out of sync; `SEED_FULL_RESET` on shared DB

## Example invocation

> "Add optional Prospect.archivedAt — use **prisma-postgres** through deploy-time reporting."
