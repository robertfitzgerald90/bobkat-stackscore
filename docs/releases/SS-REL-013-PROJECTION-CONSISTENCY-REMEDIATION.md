# SS-REL-013 — Assessment Projection Consistency Remediation

| Field | Value |
| --- | --- |
| Status | **Complete (staging code + tests; not production-deployed)** |
| Date | 2026-10-26 |
| Branch | `staging` |
| Related | [`SS-REL-012-ASSESSMENT-REPORT-INTEGRITY-AUDIT.md`](SS-REL-012-ASSESSMENT-REPORT-INTEGRITY-AUDIT.md) |
| Constraints | No scoring weight/formula changes; no recommendation impact metadata changes; no migrations; no overwrite of historical `Assessment.executiveSummary`; no production deploy |

---

## Objective

Make customer-facing assessment projections, executive narratives, recommendation counts, PDF metrics, and roadmap score journeys share **one eligible recommendation set**: client-deliverable recommendations (`filterClientDeliverableRecommendations`).

Staff retain unfinished/stub recommendations for internal review; stubs must not drive customer projections.

---

## Changes made

### 1. Shared audience presentation — `src/lib/assessments/customer-facing-report.ts`

- `selectRecommendationsForAudience` / `filterGeneratedRecommendationsForCustomer`
- `buildAudienceAssessmentPresentation` / `buildAudienceAssessmentReportData`
- Clients always get a **regenerated** narrative from the filtered set
- Staff keep **stored** historical narrative when present
- **Never writes** `Assessment.executiveSummary`

### 2. Projection presentation — `results-summary.ts`, PDF, report sections

- Formula unchanged: `projectedScore = MIN(100, overall + Σ category MAX(impact))`
- Summary now exposes `projectionImpact` (authoritative) and `rawImpactSum` (diagnostic)
- PDF “Potential Points” replaced with **Projected Impact** (`+projectionImpact`)
- `buildAssessmentReportSections.totalImpact` aliased to `projectionImpact`

### 3. Executive narrative — `executive-summary.ts`

- DOC-119 maturity language only in the opening (no conflicting rating-band “critical range”)
- Stub titles / raw question stems excluded via `recommendationTopic`
- Softer projection copy (“potential gain”, no “guaranteed”, no “strongest maturity gains first”)
- Trajectory language scaled to projected band (no always-on “80+” claim)

### 4. Completion persistence (new assessments only)

- `complete-v2.ts` and v1 complete path persist narrative/projection from **customer-deliverable** recommendations
- Full generated set (including stubs) still syncs for staff
- Historical completed assessments are **not** rewritten

### 5. Surfaces wired to audience helper

| Surface | Behavior |
| --- | --- |
| PDF export | Filtered + regenerated for clients; staff keep stubs + stored narrative |
| On-screen report | Same as PDF audience rules |
| Assessment complete email | Regenerates customer-safe narrative at send time (no DB overwrite) |
| Recommendations API | Already used `presentRecommendationsForRole` |

### 6. Roadmap alignment

| Layer | Behavior |
| --- | --- |
| **Display (customers)** | Hide stub initiatives; drop empty stub-only phases; recompute phase + journey projections from visible set; do **not** use stub-inflated stored `projectedFinalScore` as a ceiling |
| **Materialize (drafts, future)** | Builds from client-deliverable recommendations only so new/refreshed **draft** totals match customer math |
| **Active roadmaps** | Untouched by materialize |
| **Historical draft rows** | Not auto-rewritten in this release (see reconciliation note) |

### 7. Stub leakage controls (verified)

Client filter remains fail-closed for Improve-titles, missing template codes, and `isStub` catalog codes across portal, PDF, email, roadmap views, and customer APIs. Staff paths unchanged.

---

## ABC LLC regression fixtures (not hardcoded app values)

For the approved client-deliverable recommendation set observed in SS-REL-012:

| Metric | Expected |
| --- | --- |
| Current score | **39** |
| Projection impact | **+20** |
| Projected score | **59** |

Covered by `tests/assessments/customer-facing-report.test.ts`.

---

## Tests

```
npm test -- tests/assessments/customer-facing-report.test.ts \
  tests/assessments/executive-summary.test.ts \
  tests/reports/assessment-content.test.ts \
  tests/client-roadmap/customer-projection.test.ts \
  tests/recommendations/visibility.test.ts \
  tests/client-roadmap/stub-visibility.test.ts
```

Coverage includes:

- Category-max vs raw impact sum
- Client vs staff visibility / narrative regeneration
- Stub exclusion in narrative topics
- Roadmap journey not inflated by stored stub ceiling
- PDF fixture includes `projectionImpact`

**Result:** targeted suites green (47 related tests in the final core batch; PDF pilot also passes).

---

## Validation results

| Check | Result |
| --- | --- |
| Scoring weights / answer values unchanged | Pass (no edits to v2 pillar math) |
| Impact metadata unchanged | Pass |
| Customer PDF projected = category-max path | Pass |
| Misleading raw-sum Potential Points removed | Pass → “Projected Impact” |
| Customer narrative matches filtered projection | Pass (regenerated at export/report/email) |
| Historical `executiveSummary` not overwritten | Pass |
| Staff still see stubs internally | Pass |
| Customer roadmap projections use visible initiatives | Pass (display-time) |
| No migrations / production deploy | Pass |

---

## Safe draft-roadmap reconciliation (approval required — not executed)

Existing staging draft roadmaps (e.g. ABC LLC) may still store `projectedFinalScore = 100` and stub initiatives in DB.

**Idempotent approach (staff-only, staging):**

1. Confirm roadmap `status === "draft"` (never touch `active`).
2. Call existing `materializeDraftRoadmap(assessmentId)` — now materializes deliverable-only initiatives and recomputes totals.
3. Verify customer dashboard projected final = **59** for ABC and staff recommendation list still shows stubs.

**Not run in SS-REL-013** to honor “no destructive data modifications” / approval gate. Display-time recompute already corrects customer-facing numbers without DB writes.

---

## Remaining issues

1. **Catalog content** — Documentation / Technology Strategy / Endpoint (and other stub pillars) still lack approved copy; customers will not see recommendations for those weak pillars until SS-OPT-003 content is published.
2. **Stored historical narratives** — Pre-fix completed assessments may still contain stub question text in `Assessment.executiveSummary`; customer PDF/report/email regenerate, but staff UI that prints the raw stored field may still show the old text.
3. **PDF structure / page count** — Not redesigned in this release (tracked in SS-REL-012 §7).
4. **Draft DB reconciliation** — Pending explicit approval (see above).
5. **Profile `maturityTier: nascent` vs DOC-119 `Initial`** — Vocabulary mapping not unified in this release.

---

## Rollback

Revert the SS-REL-013 commit set on `staging`. No schema migration to undo. Customer display helpers are additive; draft materialize behavior returns to stub-inclusive if reverted before any approved draft refresh.
