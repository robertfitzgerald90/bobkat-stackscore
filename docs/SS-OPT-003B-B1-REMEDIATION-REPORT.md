# SS-OPT-003B — Batch B1 Production Readiness Remediation Report

**Document ID:** SS-OPT-003B-B1-REMEDIATE  
**Status:** Remediation complete — awaiting deployment approval  
**Date:** October 23, 2026  
**Scope:** DEF-001, DEF-002, DEF-003, DEF-004 from [`SS-OPT-003B-B1-PRODUCTION-READINESS-AUDIT.md`](SS-OPT-003B-B1-PRODUCTION-READINESS-AUDIT.md)  
**Constraints honored:** No production deploy, no production DB sync, no Batch B2, no scoring/weight or catalog content changes, no historical recommendation backfills.

---

## 1. Executive summary

Authorized defects DEF-001–DEF-004 are remediated. Client-facing recommendation delivery now consistently uses `filterClientDeliverableRecommendations` / related helpers at service boundaries for portal lists, assessment PDF, roadmap initiatives, published TIP/proposal assembly, and assessment-complete email. Catalog template sync and optional Improve-title refresh run inside Prisma transactions with rollback on failure.

**Updated readiness recommendation: READY WITH CONDITIONS**

Conditions: (1) deploy application code, (2) manually run idempotent template sync in the target environment after deploy, (3) optional reviewed Improve-title refresh, (4) complete manual browser/email smoke listed below. Do not begin Batch B2 until separately authorized.

---

## 2. Defects resolved

| ID | Severity | Resolution |
| --- | --- | --- |
| DEF-001 | Critical | Client roadmap filter uses `initiative.title` (typed field) instead of missing `recommendation.title` |
| DEF-002 | High | TIP/`assembleTipPlanDetail` seeds recommendations through `filterClientDeliverableRecommendations(role)` after loading template codes |
| DEF-003 | High | Assessment-complete email uses the same centralized client deliverable filter (`role: "client"`) |
| DEF-004 | Medium | Template sync + Improve-title refresh wrapped in `$transaction`; failures throw and roll back |

DEF-005 (staff PDF stubs) and DEF-006 (no edit-origin flag) remain accepted residual risks from the audit.

---

## 3. Technical implementation summary

### DEF-001
`src/lib/client-roadmap/service.ts` filters client initiatives with `hasUnpublishedStubTitle(initiative.title)` and stub template codes. Initiative title is the roadmap-copied headline and is present on the Prisma include / view model.

### DEF-002
`src/lib/technology-improvement-plan/service.ts`:
- Loads `recommendationTemplate.code` with assessment recommendations.
- `toRecommendationSeeds(..., role)` applies `filterClientDeliverableRecommendations` before seeding TIP/proposal derived state.
- Staff create/update/generate paths still seed with default admin visibility; client-facing assembly (including `getPublishedProposalDetail` → `assembleTipPlanDetail`) filters by role.
- TIP REST GET remains consultant/admin-only; published proposal GET is client-accessible and now role-filtered at the service layer (not UI-only).

### DEF-003
`src/lib/communications/workflows/triggers.ts` replaces ad-hoc stub/Improve checks with `filterClientDeliverableRecommendations(..., "client")`, rejecting stubs, Improve titles, and missing template codes.

### DEF-004
`src/lib/recommendations/sync-catalog-templates.ts`:
- Precomputes skipped categories / plan items, then applies upserts/updates inside `prisma.$transaction`.
- On failure, throws `…failed and was rolled back…` so callers cannot treat a partial write as success.
- Still does not modify consultant-edited (non-`Improve …`) rows; assessment retrigger sync elsewhere continues to preserve content/priority.

---

## 4. Files modified

| File | Change |
| --- | --- |
| `src/lib/client-roadmap/service.ts` | DEF-001 title reference (already corrected; verified) |
| `src/lib/technology-improvement-plan/service.ts` | DEF-002 role-aware deliverable filtering |
| `src/lib/communications/workflows/triggers.ts` | DEF-003 centralized email filter |
| `src/lib/recommendations/sync-catalog-templates.ts` | DEF-004 transactional sync/refresh |
| `tests/client-roadmap/stub-visibility.test.ts` | DEF-001 regression |
| `tests/technology-improvement-plan/client-deliverable-filtering.test.ts` | DEF-002 positive/negative |
| `tests/communications/assessment-complete-email-filtering.test.ts` | DEF-003 rejection conditions |
| `tests/recommendations/sync-catalog-templates.test.ts` | DEF-004 transaction/rollback |
| `tests/recommendations/b1-production-readiness-audit.test.ts` | Aligned with remediations |
| `tests/recommendations/pdf-delivery-safeguards.test.ts` | Email contract update |
| `docs/SS-OPT-003B-B1-REMEDIATION-REPORT.md` | This report |
| `docs/DOC-000 – Documentation Architecture & Index.md` | Index entry |

---

## 5. Tests added / updated

- DEF-001 roadmap title gate regression
- DEF-002 TIP/proposal filter positive + negative (stub, Improve title, missing code) + API wiring
- DEF-003 email filter rejection matrix + workflow wiring
- DEF-004 transactional success, mid-run failure rollback mocks, Improve-title skip behavior
- Production-readiness audit contracts updated for fixed gaps

---

## 6. Test results

| Check | Result |
| --- | --- |
| Full Vitest suite | **124 files / 563 tests passed** (0 failed) |
| Catalog integrity / B1 / lifecycle / visibility / sync tests | Passed |
| ESLint | **0 errors** (32 pre-existing warnings) |
| `tsc --noEmit` | **27 pre-existing errors** in unrelated tests/fixtures; **none** in remediated application files |
| Production build (`npm run build`) | **Pass** |

---

## 7. Client delivery surface consistency

| Surface | Gate location | Status |
| --- | --- | --- |
| Client recommendations portal | `getClientRecommendations` → visibility helpers | Protected |
| Assessment APIs | `presentRecommendationsForRole` | Protected |
| Assessment PDF | `filterClientDeliverableRecommendations` + `-internal` for staff | Protected |
| Client roadmap | Initiative title + stub code filter | Protected |
| Published proposal API/UI | `assembleTipPlanDetail(role)` | Protected (remediated) |
| TIP wizard/API | Consultant/admin only | Protected by auth |
| Assessment-complete email | Centralized client filter | Protected (remediated) |
| Technology profile recommendations | Role-aware client list | Protected |

### Remaining / residual paths (not Critical)

- **VCIO page** may list recent *completed* recommendation titles without stub filtering (title-only snippets). Low content-leak risk if a completed stub title remains; track as follow-up if clients commonly see VCIO completed-rec cards.
- **Staff PDF / staff TIP PDF** intentionally retain stubs; `-internal` filename on assessment PDF only.
- **Risk summaries / counts** on internal profile updates may still count stub rows for analytics (not client narrative delivery).
- **Browser E2E** not executed in this remediation.

---

## 8. Remaining risks

1. Existing DB rows with `Improve …` titles stay hidden from clients until optional refresh; consultants still see them.
2. `RecommendationTemplate` rows lag catalog until manual sync after deploy.
3. Improve-title refresh heuristic can still overwrite rare consultant edits that keep an `Improve ` prefix (DEF-006).
4. Manual smoke (browser/PDF/email) not yet run.
5. Pre-existing `tsc` debt in unrelated tests remains.

---

## 9. Manual verification requirements (pre-production sign-off)

1. Client: recommendations list shows only published B1 copy (no stubs / Improve titles).
2. Client: download assessment PDF — no stubs; filename without `-internal`.
3. Staff: download assessment PDF — may include stubs; filename ends with `-internal`.
4. Client: open published proposal — no unpublished recommendations in plan payload/UI.
5. Queue/preview assessment-complete email — only published titles in strengths/priorities.
6. After deploy: run `syncRecommendationTemplatesFromCatalog` once; confirm `ok: true`, 20 approved codes, empty or explained `skippedMissingCategory`.
7. Optional: dry-run Improve-title candidates, then `refreshUneditedStubRecommendationsFromCatalog` for B1 codes only.

---

## 10. Production deployment readiness

| Criterion | Status |
| --- | --- |
| DEF-001 build blocker | Resolved |
| DEF-002 proposal leak | Resolved |
| DEF-003 email missing-code leak | Resolved |
| DEF-004 sync atomicity | Resolved |
| Automated tests | Pass |
| Production build | Pass |
| Production DB sync executed | Not executed (deferred; manual after deploy) |
| Batch B2 | Not started |

### Explicit recommendation

# READY WITH CONDITIONS

Deploy application + catalog, then perform manual template sync and smoke checks above before considering client delivery fully production-cleared. Await explicit approval before deployment and before any production database synchronization. Do not begin Batch B2.
