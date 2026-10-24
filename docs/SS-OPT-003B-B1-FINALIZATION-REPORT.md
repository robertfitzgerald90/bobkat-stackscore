# SS-OPT-003B — Batch B1 Finalization Report

**Document ID:** SS-OPT-003B-B1-FINAL  
**Status:** Finalized (catalog published; production DB sync deferred)  
**Date:** October 23, 2026  
**Scope:** REC-IA-001–010 and REC-SO-001–010  
**Related:** [`SS-OPT-003B-B1-CONTENT-APPROVAL.md`](SS-OPT-003B-B1-CONTENT-APPROVAL.md), [`SS-OPT-003B-BATCH-B1-REVIEW.md`](SS-OPT-003B-BATCH-B1-REVIEW.md), [`SS-OPT-003A-RECOMMENDATION-AUDIT.md`](SS-OPT-003A-RECOMMENDATION-AUDIT.md)

**Constraints honored:** No Batch B2. No automatic production database backfill or deploy. Assessment question weights, scoring formulas, and historical recommendation priorities unchanged.

---

## 1. Editorial changes

Applied in `data/RecommendationCatalogV2.json`:

| ID | Change |
| --- | --- |
| REC-IA-001 | Title → **Centralize workforce identity and authentication** |
| REC-IA-003 | Title → **Replace shared employee credentials with individual accounts** |
| REC-SO-002 | Opening business-impact sentence → **Unpatched or misconfigured systems can expose organizations to preventable security incidents and operational disruptions.** Remaining SO-002 content preserved. |

All other B1 narrative fields retained as approved in the content-approval package.

---

## 2. Priority adjustments

Catalog default priorities only (not historical `AssessmentRecommendation.priority` overrides):

| ID | Before | After |
| --- | --- | --- |
| REC-IA-003 | medium | **high** |
| REC-IA-008 | medium | **high** |
| REC-SO-009 | low | **medium** |

Retrigger sync does **not** overwrite existing client-row priorities (see §4).

---

## 3. Publication status

| Partition | Count | `isStub` |
| --- | ---: | --- |
| Batch B1 (REC-IA-001–010, REC-SO-001–010) | 20 | `false` |
| Remaining catalog templates | 60 | `true` |
| Total catalog templates | 80 | — |

Runtime stub detection reads `RecommendationCatalogV2.json` via `@/lib/recommendations/stubs`. Clearing `isStub` for B1 is therefore live in application code once this catalog ships.

Batch B2 and later batches remain stubs and are withheld from client delivery.

---

## 4. Database synchronization behavior

### How `RecommendationTemplate` is created/updated

1. **Seed path:** `prisma/seed-v2.ts` upserts templates from `RecommendationCatalogV2.json` during library seed.
2. **Ops path (new):** `src/lib/recommendations/sync-catalog-templates.ts`
   - `syncRecommendationTemplatesFromCatalog(prisma)` — idempotent upsert of all catalog templates (title, description, businessImpact, suggestedService, priority, estimatedImpactPoints, consolidationGroupId, category).
   - Does **not** modify `AssessmentRecommendation` rows.
   - Intended for manual/ops invocation only — not wired to request paths or automatic production backfill.

### Whether approved catalog content reaches runtime queries

| Surface | Source of truth |
| --- | --- |
| Stub / publication gate | Catalog JSON `isStub` (process memory) |
| New recommendation generation | Catalog JSON via v2 engine |
| Existing client recommendation text | `AssessmentRecommendation` copied fields |
| Template playbook rows | `RecommendationTemplate` (requires seed/ops sync) |

Approved B1 copy reaches **new** assessment completions immediately from the catalog JSON. Existing client rows keep their stored text until an optional, opt-in refresh (below).

### Copied recommendation text

`AssessmentRecommendation` stores title, description, businessImpact, suggestedService, priority, and estimatedImpactPoints at create time. Completing another assessment does not rewrite those fields for existing active/declined/completed rows.

### Consultant edits vs generated content

There is **no** reliable edit-origin flag on `AssessmentRecommendation`. Therefore:

- Retrigger / reopen updates **trigger metadata and workflow status only** (`src/lib/recommendations/sync.ts`).
- Title, description, businessImpact, suggestedService, priority, and estimatedImpactPoints are **never** overwritten on existing rows by assessment sync.

### Optional heuristic refresh (manual only)

`refreshUneditedStubRecommendationsFromCatalog(prisma, templateCodes?)` updates rows that still have mechanical stub titles (`Improve …`) from approved catalog templates. Rows whose title no longer starts with `Improve ` are skipped (treated as consultant-edited or already refreshed).

**Records that cannot be safely updated automatically:**

- Any `AssessmentRecommendation` whose title does not start with `Improve ` (may include consultant edits or prior custom copy).
- Historical snapshots / completed assessment artifacts that embed recommendation text outside live rows.
- Client-specific priority overrides on existing rows (preserved by design).

---

## 5. Client delivery safeguards

Fail-closed policy for client-facing audiences (`role === "client"`):

1. Catalog stub codes (`isStub: true`) are withheld.
2. Rows still titled `Improve …` are withheld (stale generator copy after publication).
3. Rows without a resolvable template code are withheld.

Staff/consultant audiences retain stubs and stale titles for internal review.

| Channel | Safeguard |
| --- | --- |
| Client portal / APIs | `presentRecommendationsForRole` / `filterClientDeliverableRecommendations` |
| Assessment PDF export | Same filter; staff downloads use `-internal` filename suffix |
| Automated emails | Workflow trigger filters stubs + `Improve …` titles |
| Client roadmap / improvement-plan views | Initiative filter hides stubs + unpublished stub titles for non-consultants |

Consultant PDF exports remain available for internal use but are labeled with the `-internal` filename suffix so they are less likely to be mistaken for approved client deliverables. Reporting architecture was not redesigned.

---

## 6. Test results

| Check | Result |
| --- | --- |
| Catalog integrity / B1 publication tests | Pass (`tests/recommendations/batch-b1-catalog.test.ts`) |
| Recommendation trigger / dedupe tests | Pass |
| Client visibility tests | Pass |
| PDF delivery safeguard tests | Pass |
| Database synchronization contract tests | Pass |
| Full automated suite | **118 files / 519 tests passed** |
| ESLint | **0 errors** (pre-existing warnings only) |
| `tsc --noEmit` | Pre-existing errors in unrelated tests; none introduced by B1 finalization |
| Production build (`npm run build`) | **Pass** |

Verified priorities: REC-IA-003 high, REC-IA-008 high, REC-SO-009 medium.  
Verified publication: exactly the 20 B1 IDs have `isStub: false`.

---

## 7. Files modified

| File | Role |
| --- | --- |
| `data/RecommendationCatalogV2.json` | Editorial, priority, `isStub: false` for B1 |
| `src/lib/recommendations/sync.ts` | Preserve content/priority on retrigger |
| `src/lib/recommendations/sync-catalog-templates.ts` | **New** idempotent template sync + optional Improve-title refresh |
| `src/lib/recommendations/visibility.ts` | Fail-closed client deliverable filter + stub-title gate |
| `src/app/api/v1/assessments/[id]/export/pdf/route.ts` | Client PDF filter + `-internal` staff filename |
| `src/lib/client-roadmap/service.ts` | Hide stubs / Improve titles from client roadmap |
| `src/lib/communications/workflows/triggers.ts` | Email payload stub/title filter |
| `tests/recommendations/batch-b1-catalog.test.ts` | Publication + editorial + priority assertions |
| `tests/recommendations/visibility.test.ts` | Stub vs published B1 visibility |
| `tests/recommendations/pdf-delivery-safeguards.test.ts` | **New** PDF/email safeguard contracts |
| `tests/recommendations/sync-catalog-templates.test.ts` | **New** sync non-overwrite contract |
| `tests/assessments/ss-opt-002-remediation.test.ts` | Stub examples updated post-B1 publish |
| `docs/SS-OPT-003B-B1-FINALIZATION-REPORT.md` | This report |
| `docs/DOC-000 – Documentation Architecture & Index.md` | Index entry |

---

## 8. Remaining risks

1. **Existing client rows** may still store pre-approval `Improve …` titles. They are hidden from clients until refreshed, but consultants will still see them until ops runs the optional refresh.
2. **`RecommendationTemplate` DB rows** may lag the catalog until seed or `syncRecommendationTemplatesFromCatalog` is run in each environment.
3. **No edit-origin flag** means consultant-customized rows that still begin with `Improve ` could be overwritten by the optional refresh heuristic — review candidates before running refresh in production.
4. **Staff PDF exports** can still include stub recommendations; the `-internal` filename reduces accidental client handoff but does not hard-block sharing.
5. **Manual recommendations without template codes** are fail-closed for clients (hidden). Confirm whether any intentional custom client-visible rows lack template links.

---

## 9. Production deployment instructions

Do **not** run production-wide destructive backfills. Recommended sequence:

1. **Deploy application + catalog** (this change set). Runtime `isStub` gates and client filters take effect immediately from JSON.
2. **Sync templates (idempotent, safe):** invoke `syncRecommendationTemplatesFromCatalog(prisma)` in the target environment (ops script / one-off Node with Prisma). Confirm `approvedCodes` length is 20 and `skippedMissingCategory` is empty.
3. **Optional content refresh:** dry-run identify `AssessmentRecommendation` rows with `title LIKE 'Improve %'` linked to B1 template codes. After review, run `refreshUneditedStubRecommendationsFromCatalog(prisma, B1_IDS)` if desired. Skip or exclude any row suspected to be consultant-edited.
4. **Smoke checks:** client portal recommendations, assessment PDF as client vs staff (`*-internal.pdf`), roadmap initiatives, and assessment-complete email payload (no stub / Improve titles for clients).
5. **Do not** begin Batch B2 until a separate authorization.

Batch B2 is intentionally **not** started by this finalization.
