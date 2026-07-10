# Assessment Engine — Production Upgrade Changelog

**Date:** June 23, 2026  
**Scope:** Assessment foundation — DOC-114 alignment, scoring engine, Technology Profile, UX polish, admin management  
**Build status:** `npm run build` ✓ · `npm test` ✓ (9 tests)

---

## Summary

The assessment engine was upgraded from a functional MVP to a **documentation-aligned production foundation**. Every Q01–Q50 question now carries DOC-114 metadata, scoring includes maturity tiers and v2 category mapping, Technology Profile is a first-class entity (replacing the DOC-118 proxy), the wizard UX was refined for daily consultant use, and admins can manage the question bank from the UI.

---

## 1. Database Schema (`prisma/schema.prisma`)

### New enums
| Enum | Purpose |
|------|---------|
| `ResponseType` | `binary`, `ternary`, `maturity` — DOC-114 response models |
| `MaturityTier` | `nascent` → `optimized` — DOC-113 maturity display |
| `TrendDirection` | `improving`, `stable`, `declining` — profile trend |
| `ProfileSnapshotTrigger` | Snapshot reason (`assessment_completed`, etc.) |

### `AssessmentCategory` — new fields
- `v2CategoryCode` — DOC-114 taxonomy code (e.g. `business_continuity`)
- `v2DisplayName` — DOC-114 display label

### `AssessmentQuestion` — new fields (DOC-114 standard)
- `v2QuestionId` — immutable v2 ID (e.g. `SEC-001`)
- `capability` — measured technology capability
- `purpose` — assessment objective
- `responseType` — answer model
- `evidenceRequired` — evidence guidance for assessors
- `relatedService`, `relatedPlaybook` — commercial linkage
- `relatedTechnologies` — string array of common technologies
- `adminNotes` — internal guidance

### New models
| Model | Purpose |
|-------|---------|
| `TechnologyProfile` | One active profile per client (DOC-113) |
| `TechnologyProfileSnapshot` | Immutable history on assessment completion |

### Client relation
- `Client.technologyProfile` — auto-created on new client

**Migration required:** Run `npm run db:push` (or `db:migrate`) then `npm run db:seed` to apply schema and backfill metadata + profiles.

---

## 2. Assessment Library — DOC-114 Alignment

### New files
| File | Role |
|------|------|
| `src/lib/assessment-library/metadata.ts` | **Source of truth** for Q01–Q50 DOC-114 fields |
| `src/lib/assessment-library/category-mapping.ts` | v1 → v2 category aggregation (DOC-118) |
| `src/lib/assessment-library/validate.ts` | Runtime validation against metadata catalog |

### Coverage
- **50/50** questions mapped with `v2QuestionId`, capability, purpose, evidence, service, playbook
- v2 IDs: `SEC-001`–`SEC-010`, `BCP-001`–`BCP-014`, `INF-001`–`INF-007`, `OPS-001`–`OPS-007`, `DOC-001`–`DOC-007`, `SIT-001`–`SIT-005`
- v2 category merge: **Backup + BCDR → Business Continuity** (weighted average)
- **Endpoint → Operations**, **Strategic → Strategic IT**

### Seed (`prisma/seed.ts`)
- Applies all DOC-114 metadata on upsert
- Sets category v2 display fields
- Runs `backfillTechnologyProfiles()` for existing clients

---

## 3. Scoring Engine

### New: `src/lib/scoring/maturity.ts`
- `getMaturityTier(score)` — DOC-113 tiers (distinct from Rating bands)
- `MATURITY_TIER_LABELS` — display labels

### Enhanced: `src/lib/scoring/index.ts`
- Re-exports maturity helpers alongside existing DOC-111A math
- **Unchanged:** weighted category scoring, critical exposure flag (no score penalty per DOC-111A)

### v2 display scoring
- `aggregateV2CategoryScores()` — merges v1 results into DOC-114 taxonomy
- `calculateV2OverallScore()` — informational v2 weighted score

---

## 4. Technology Profile Service

### New: `src/lib/technology-profile/index.ts`

| Function | Behavior |
|----------|----------|
| `ensureTechnologyProfile(clientId)` | Creates profile shell |
| `syncProfileFromAssessment(assessmentId)` | Updates profile + creates snapshot on completion |
| `getTechnologyProfile(clientId)` | Full profile view for UI |
| `backfillTechnologyProfiles()` | Migrates existing clients |

### Profile fields populated on assessment complete
- Overall StackScore, maturity tier, v2 category scores (JSON)
- Risk summary (critical/high/medium/low counts + exposure flag)
- Trend direction (±3 point threshold vs prior assessment)
- Next recommended assessment (+12 months)
- Open recommendation count, critical finding count

### Wired into
- `completeAssessment()` — syncs profile after transaction
- `POST /api/v1/clients` — creates profile with new client
- Seed backfill for existing data

### New UI: `src/components/technology-profile/technology-profile-panel.tsx`
- Displayed on **Client detail page** as the central hub
- StackScore gauge, maturity tier, trend, DOC-114 category bars, critical exposure warning

---

## 5. Assessment UX Polish

### Wizard (`assessment-wizard.tsx`)
| Improvement | Detail |
|-------------|--------|
| Progress bar | Top-level completion percentage |
| One-question focus | Single card with prev/next navigation |
| DOC-114 badges | Question code, v2 ID, capability |
| Evidence field | Dedicated textarea with evidence guidance |
| Loading state | Spinner instead of plain text |
| Auto-advance | "Next Question" after answering |

### New component
- `assessment-progress-bar.tsx` — reusable progress indicator

### API enrichment
- `GET /assessments/[id]/questions` returns capability, v2QuestionId, purpose, evidenceRequired, responseType

---

## 6. Admin Management

### New page: `/admin/assessment-library`
- Sidebar link (admin only): **Assessment Library**
- DOC-114 alignment status card (pass/fail validation)
- Expandable category browser with all 50 questions
- Question editor sheet (text, capability, purpose, evidence, help text, admin notes, active toggle)
- Category activate/deactivate

### New API routes
| Route | Methods |
|-------|---------|
| `/api/v1/admin/assessment-library` | GET — full library + validation |
| `/api/v1/admin/assessment-library/questions/[id]` | GET, PATCH |
| `/api/v1/admin/assessment-library/categories/[id]` | PATCH |

---

## 7. Testing & Tooling

| Addition | Detail |
|----------|--------|
| `vitest.config.ts` | Test runner with `@/` alias |
| `npm test` / `npm run test:watch` | Scripts in package.json |
| `tests/scoring/index.test.ts` | **9 tests** — DOC-111A example, critical exposure, maturity tiers, v2 mapping, DOC-114 catalog validation |

---

## 8. Files Changed / Added

### Added (18 files)
```
src/lib/assessment-library/metadata.ts
src/lib/assessment-library/category-mapping.ts
src/lib/assessment-library/validate.ts
src/lib/scoring/maturity.ts
src/lib/technology-profile/index.ts
src/components/assessments/assessment-progress-bar.tsx
src/components/technology-profile/technology-profile-panel.tsx
src/components/admin/assessment-library-management.tsx
src/app/(dashboard)/admin/assessment-library/page.tsx
src/app/api/v1/admin/assessment-library/route.ts
src/app/api/v1/admin/assessment-library/questions/[id]/route.ts
src/app/api/v1/admin/assessment-library/categories/[id]/route.ts
vitest.config.ts
docs/ASSESSMENT_ENGINE_CHANGELOG.md
```

### Modified (key files)
```
prisma/schema.prisma
prisma/seed.ts
package.json
src/lib/scoring/index.ts
src/lib/assessments/index.ts
src/app/api/v1/clients/route.ts
src/app/api/v1/assessments/[id]/questions/route.ts
src/app/(dashboard)/clients/[id]/page.tsx
src/components/assessments/assessment-wizard.tsx
src/components/layout/app-sidebar.tsx
tests/scoring/index.test.ts
```

---

## 9. Deployment Steps

```bash
npm install
npm run db:push      # Apply schema changes
npm run db:seed      # Backfill DOC-114 metadata + Technology Profiles
npm test             # Verify scoring engine
npm run build        # Verify production build
```

---

## 10. What Remains (Next Roadmap Phase)

These are **intentionally deferred** to the platform roadmap (M1–M11):

| Item | Status |
|------|--------|
| Productivity category questions (DOC-114D) | Not in v1 bank — net-new |
| Full DOC-114A–G library expansion beyond Q50 | Future Phase 4 |
| Service Catalog entity (replace string services) | M3 |
| Assessment immutability enforcement UI | Partial — API blocks draft edits only |
| Technology Journey PDF closing page (DOC-126) | Reporting phase |
| Role-based dashboards / Today's Focus (DOC-127) | M7 |
| Prisma committed migrations | Recommended next engineering task |

---

## 11. Architecture Notes

- **v1 scoring remains authoritative** for assessments (DOC-111A weights). v2 category display is additive.
- **Rating ≠ Maturity Tier** — overall score uses Rating bands; profile categories use Maturity tiers (DOC-118).
- **Technology Profile scores are system-calculated only** — no manual override (DOC-113).
- **Snapshots are insert-only** — historical profiles preserved on every assessment completion.

---

*This changelog documents the Assessment Engine production upgrade. Proceed with the implementation roadmap (M0–M11) when ready.*
