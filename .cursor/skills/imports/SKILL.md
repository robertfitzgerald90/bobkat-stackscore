---
name: imports
description: >-
  Implements CSV import and idempotent seeds in this repo — prospect CSV
  preview/dedupe, prisma seed modules, demo scripts. Use for CSV/seed work
  (Excel and import rollback are not implemented).
---

# Import Framework

## Scope

**StackScore repository.** Import support is **CSV-focused** with preview/dedupe; **no Excel** and **no batch rollback**. Portable idea: preview → validate → execute with idempotent upserts.

## Purpose

Import external data using the existing CSV preview/validate/execute flow and idempotent seed patterns.

## When to use

- CSV prospect / outreach import
- Extending `prisma/seed.ts` or seed modules
- Demo client seeding
- One-off data scripts in `scripts/`

## When not to use

- Schema DDL → `prisma-postgres`
- Single-record CRUD → `enterprise-crud` / `api-server-actions`
- Website form POST ingress → `integration-endpoints`

## Repository locations to inspect

| Area | Path |
|------|------|
| CSV parse/validate | `src/lib/communications/outreach/csv-import.ts` |
| Duplicates | `duplicate-detection.ts` |
| Execute | `quick-invite.ts`, `send-invitation.ts` |
| UI | `src/components/communications/csv-import-view.tsx` |
| API | `src/app/api/v1/admin/prospects/import/route.ts` |
| Seeds | `prisma/seed.ts`, `seed-v2.ts`, `seed-technology-catalog.ts`, `prisma/demo/` |
| Demo script | `scripts/seed-demo-client.ts` |
| Docs | `docs/communications/COMM-003-ASSESSMENT-CAMPAIGNS.md` |

## Required implementation workflow

```
CSV (only — Excel ABSENT)
  ↓
Normalization (header aliases in parseCsvContent)
  ↓
Matching / duplicates (findDuplicateByEmail)
  ↓
Validation (Zod row schema; required First/Last/Company/Email)
  ↓
Dry run (previewOnly: true → previewCsvImport)
  ↓
Execute (per-row invite; skipDuplicates option)
  ↓
Conflict reporting (row errors + duplicate flags in preview UI)
  ↓
Rollback — ABSENT (do not invent batch undo; use careful preview + skip)
```

1. Parse → validate → preview before commit.
2. Seeds: upsert by stable codes/IDs; respect `SEED_FULL_RESET` / `SEED_RESET_ASSESSMENTS` (never on production).
3. One-off scripts: document destructiveness in header; require explicit approval for shared DBs.

## Required architecture

- Idempotent upserts in seeds/catalog/demo constants.
- Row-level failures preferred over silent full-batch fail.
- Audit significant admin imports when siblings do (`recordAdminAuditEvent`).

## Validation commands

```bash
npm test -- tests/communications/
npm run db:seed
npm run seed:demo-client
npm run lint
```

## Definition of done

- [ ] Preview shows errors/duplicates before execute
- [ ] Dedupe on email
- [ ] Seed/import re-run safe where applicable
- [ ] No Excel parser invented without product decision
- [ ] No PII CSVs committed

## Common implementation mistakes

- Skipping preview
- Naive comma-split CSVs
- `SEED_FULL_RESET` on Neon
- Claiming rollback exists

## Example invocation

> "Extend prospect CSV columns with industry — use **imports** and csv-import preview flow."
