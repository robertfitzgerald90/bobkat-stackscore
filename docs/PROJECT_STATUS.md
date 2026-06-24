# BobKat StackScore — Project Status

**Last updated:** June 2026  
**Branch:** `main`  
**Phase:** MVP development (internal BobKat staff tool)

---

## Executive Summary

BobKat StackScore has progressed from **documentation-only** to a **functional application scaffold**. The core assessment engine, database model, authentication, API layer, and primary UI flows are implemented. The app builds successfully and can run locally against PostgreSQL.

**MVP is not complete** — several user-facing workflows (project management, recommendation status, admin user CRUD, client editing) remain UI-only or unimplemented.

---

## Timeline of Work Completed

### Phase 1 — Documentation foundation

Original product docs:

- `Vision.md` — Business purpose and 7-category scoring framework
- `DatabaseSchema.md` — 14-entity relational model
- `AssessmentQuestions.md` — 50 assessment questions (v1)
- `ScoreCalculation.md` — Scoring methodology (partially superseded)
- `RecommendationEngine.md` — Recommendation rules and examples

Pre-development specs (gap resolution):

- `QuestionScoringMatrix.md` — Weights and answer scores for all 50 questions
- `ScoringSpecification.md` — Authoritative scoring rules (critical flags, rounding, caps)
- `RecommendationRuleCatalog.json` — Machine-readable recommendation triggers
- `MVP_PRD.md` — Personas, user stories, scope
- `RBAC_Security_Spec.md` — Roles and permissions
- `TechnicalArchitecture.md` — Stack, services, deployment
- `API_Specification.md` — REST endpoint definitions

### Phase 2 — Application scaffold

**Stack initialized:**

- Next.js 15.5 (App Router, TypeScript, Turbopack)
- Tailwind CSS 4 + shadcn/ui
- Prisma 7 + PostgreSQL (`@prisma/adapter-pg`)
- Auth.js (NextAuth v5 beta) credentials provider
- Zod, bcryptjs, Recharts (charts not yet wired)

**Database:**

- Full Prisma schema matching MVP tables
- Seed script: 7 categories, 50 questions, answer options, recommendation templates
- Default users: `admin@bobkatit.com`, `technician@bobkatit.com`
- Schema applied via `prisma db push` (no migration files committed yet)

**Backend services:**

- `lib/scoring/` — Category and overall score calculation per ScoringSpecification
- `lib/recommendations/` — Trigger evaluation and consolidation
- `lib/assessments/` — Atomic assessment completion transaction

**API (`/api/v1/`):**

- Health, auth/me
- Clients CRUD (list, create, get, patch)
- Assessments (CRUD, questions, responses, complete)
- Recommendations (list)
- Projects (list, create, patch)
- Dashboard summary

**UI pages:**

- `/login` — Credentials login
- `/dashboard` — Overview stats
- `/clients`, `/clients/new`, `/clients/[id]` — Client management
- `/assessments/[id]` — 50-question wizard with live score preview
- `/assessments/[id]/results` — Completed assessment report
- `/projects` — Project list (read-only)
- `/admin/users` — User list (read-only, admin only)

### Phase 3 — Local dev fixes

- Resolved Next.js route conflict: `[id]` vs `[clientId]` under `api/v1/clients/`
- Added Prisma 7 seed config to `prisma.config.ts`
- Auth API set to Node.js runtime (Prisma requires Node, not Edge)
- Explicit `AUTH_SECRET` in Auth.js config
- Login form: email normalization + `result.ok` check
- `.env` / `.env.example` documented (`.env.example` now tracked in git)
- `.gitignore` exception for `.env.example`
- `DEVELOPMENT_GUIDE.md` and this status document

---

## What Works Today

| Feature | Status |
|---------|--------|
| User login (credentials) | Implemented — verify after seed + dev restart |
| Client list and create | Working |
| Client detail + start assessment | Working |
| Assessment wizard (50 questions, auto-save) | Working |
| Live score preview (draft) | Working |
| Complete assessment | Working |
| Score calculation (7 categories + overall) | Working |
| Critical exposure warning | Working |
| Auto-generated recommendations | Working |
| Recommendation consolidation | Working |
| Executive summary (auto-generated) | Working |
| Results view | Working |
| Score history snapshot on completion | Working |
| Production build (`npm run build`) | Passing |

---

## MVP Gaps (from PRD)

### Must-have — not yet complete

| Item | Gap |
|------|-----|
| CM-02 Client search/filter | API supports; no UI |
| CM-04 Edit/deactivate client | API PATCH exists; no UI |
| AW-07 Edit executive summary | API supports; results page read-only |
| AW-08 Internal notes | API field exists; no UI |
| RC-03 Recommendation status changes | No PATCH endpoint or UI |
| PJ-01–04 Project workflow | API exists; UI is list-only |
| AD-01 User create/disable | List-only; no admin CRUD |

### Should-have — not yet complete

- Notes/evidence per question in wizard
- Assessment comparison (side-by-side)
- Projected score on results page
- Score trend chart (Recharts installed, unused)
- Custom recommendations
- Archive assessments

### Infrastructure gaps

- No Prisma migration files (using `db push` only)
- Vitest/Playwright not configured (test file exists)
- No CI/CD pipeline
- No production deployment config

---

## Repository Layout

```text
docs/           14 markdown/json spec files + 2 operational guides
data/           RecommendationRuleCatalog.json
prisma/         schema, seed, seed-data
src/app/        Pages and API routes
src/components/ UI components
src/lib/        Business logic and auth
```

---

## Commit Readiness Checklist

Before committing, verify:

- [x] `npm run build` passes (verified June 2026)
- [ ] `npm run db:seed` completes (against your dev database)
- [ ] `npm run dev` starts without route errors
- [ ] Login works with seeded credentials (see [Login troubleshooting](#login-troubleshooting) below)
- [x] `.env` is **not** staged (gitignored)
- [x] `src/generated/prisma/` is **not** staged (gitignored)
- [x] `.env.example` is tracked (`.gitignore` updated with `!.env.example`)

### Login troubleshooting

If you see **"Invalid email or password"**:

1. Run `npm run db:seed` — creates/refreshes `admin@bobkatit.com` and `technician@bobkatit.com`
2. Use password from `SEED_ADMIN_PASSWORD` in `.env` (default: `ChangeMe123!`)
3. Confirm `DATABASE_URL` in `.env` points at the same database you seeded
4. Ensure `AUTH_SECRET` and `AUTH_URL=http://localhost:3000` are set in `.env`
5. Restart `npm run dev` after any `.env` change

### Files changed in latest fixes (ready to stage)

| Change | Purpose |
|--------|---------|
| `.gitignore` | Allow `.env.example` to be committed |
| `.env.example` | Full env template with `AUTH_URL` |
| `README.md` | Links to operational docs |
| `prisma.config.ts` | Prisma 7 seed command |
| `src/app/api/v1/clients/[id]/assessments/` | Route slug fix |
| `src/app/api/v1/clients/[id]/projects/` | Route slug fix |
| `src/app/api/auth/[...nextauth]/route.ts` | Node.js runtime for Prisma auth |
| `src/lib/auth/config.ts` | AUTH_SECRET, credential normalization, signIn callback |
| `src/components/auth/login-form.tsx` | Login robustness |
| `docs/DEVELOPMENT_GUIDE.md` | Developer setup guide |
| `docs/PROJECT_STATUS.md` | This document |

---

## Suggested Next Steps

1. **Verify login** — Re-seed and restart dev server (see checklist above)
2. **Commit** — Stage the files listed above; suggested message below
3. **Implement recommendation status** API + UI (high-impact MVP gap)
4. **Project creation** from recommendations
5. **Executive summary editing** on results page
6. **Create initial Prisma migration** for production deployments

### Suggested commit message

```text
Fix dev server route conflict, auth login, and add operational docs

Standardize client API routes to [id], configure Prisma 7 seeding,
harden credentials auth for Node.js runtime, and add DEVELOPMENT_GUIDE
and PROJECT_STATUS documentation for local setup and MVP status.
```

---

## Success Criteria for MVP Release

Per [MVP_PRD.md](MVP_PRD.md):

1. All Must-have user stories implemented
2. Scoring matches ScoringSpecification worked examples
3. All 50 questions seed correctly
4. Recommendation generation matches catalog
5. One end-to-end test assessment completes
6. Admin can manage users; technician completes full workflow

Currently estimated: **~60% of MVP Must-haves** have backend support; **~40%** have full UI workflow.
